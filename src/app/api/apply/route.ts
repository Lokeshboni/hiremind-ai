import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { extractTextFromBuffer } from '@/lib/parser';
import { matchResumeAndJob } from '@/lib/gemini';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'resumes');

// GET: Retrieve a single application detailed AI evaluation report
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const appId = searchParams.get('id');

    if (!appId) {
      return NextResponse.json({ message: 'Missing application ID parameter.' }, { status: 400 });
    }

    const application = await prisma.application.findUnique({
      where: { id: appId },
      include: {
        candidate: {
          include: { user: true }
        },
        job: {
          include: { company: true }
        },
        analysis: true
      }
    });

    if (application) {
      let parsedAnalysis = null;
      if (application.analysis) {
        parsedAnalysis = {
          ...application.analysis,
          strengths: application.analysis.strengths ? JSON.parse(application.analysis.strengths) : [],
          weaknesses: application.analysis.weaknesses ? JSON.parse(application.analysis.weaknesses) : [],
          missingSkills: application.analysis.missingSkills ? JSON.parse(application.analysis.missingSkills) : [],
          questions: application.analysis.questions ? JSON.parse(application.analysis.questions) : []
        };
      }
      const parsedJob = {
        ...application.job,
        requirements: application.job.requirements ? JSON.parse(application.job.requirements) : [],
        skills: application.job.skills ? JSON.parse(application.job.skills) : []
      };
      const parsedCandidate = {
        ...application.candidate,
        skills: application.candidate.skills ? application.candidate.skills.split(',').map(s => s.trim()).filter(s => s.length > 0) : []
      };
      const parsedApp = {
        ...application,
        analysis: parsedAnalysis,
        job: parsedJob,
        candidate: parsedCandidate
      };
      return NextResponse.json({ application: parsedApp });
    }

    return NextResponse.json({ message: 'Application record not found.' }, { status: 404 });
  } catch (error) {
    console.error('Fetch Application Detail Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Candidate applies for a job vacancy
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'CANDIDATE') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const candidateProfile = await prisma.candidateProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!candidateProfile) {
      return NextResponse.json({ message: 'Candidate profile not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const jobId = formData.get('jobId') as string;
    const file = formData.get('file') as File | null;

    if (!jobId) {
      return NextResponse.json({ message: 'Missing Job ID' }, { status: 400 });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { company: true },
    });

    if (!job) {
      return NextResponse.json({ message: 'Job vacancy not found' }, { status: 404 });
    }

    const existingApplication = await prisma.application.findFirst({
      where: {
        candidateId: candidateProfile.id,
        jobId: job.id,
      }
    });

    if (existingApplication) {
      return NextResponse.json({ message: 'You have already applied for this position.' }, { status: 400 });
    }

    let resumeText = '';
    let resumeUrl = candidateProfile.resumeUrl;

    if (file && file.size > 0) {
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ message: 'File size exceeds 5MB limit.' }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const fileType = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : file.name.endsWith('.docx') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'text/plain');
      resumeText = await extractTextFromBuffer(buffer, fileType);
      
      if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      }
      const safeFilename = `${session.user.id}-app-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
      const filePath = path.join(UPLOAD_DIR, safeFilename);
      fs.writeFileSync(filePath, buffer);
      resumeUrl = `/uploads/resumes/${safeFilename}`;
      
      await prisma.candidateProfile.update({
        where: { id: candidateProfile.id },
        data: { resumeUrl },
      });
    } else {
      if (!resumeUrl) {
        return NextResponse.json({ message: 'Please upload a resume file to complete your application.' }, { status: 400 });
      }

      try {
        const localPath = path.join(process.cwd(), 'public', resumeUrl);
        if (fs.existsSync(localPath)) {
          const buffer = fs.readFileSync(localPath);
          const ext = path.extname(resumeUrl).toLowerCase();
          const mime = ext === '.pdf' ? 'application/pdf' : ext === '.docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'text/plain';
          resumeText = await extractTextFromBuffer(buffer, mime);
        }
      } catch (err) {
        console.error('Failed to read candidate existing resume file:', err);
      }
    }

    if (!resumeText || resumeText.trim().length === 0) {
      return NextResponse.json({ message: 'Unable to process resume text. Please re-upload your resume.' }, { status: 400 });
    }

    const reqs = job.requirements ? JSON.parse(job.requirements) : [];
    const skillsArr = job.skills ? JSON.parse(job.skills) : [];

    const jobDescription = `Job Title: ${job.title}
Company: ${job.company.name}
Description: ${job.description}
Requirements: ${reqs.join('; ')}
Skills: ${skillsArr.join(', ')}
Experience Required: ${job.experience}`;
    
    const analysis = await matchResumeAndJob(resumeText, jobDescription);

    const application = await prisma.$transaction(async (tx) => {
      const app = await tx.application.create({
        data: {
          candidateId: candidateProfile.id,
          jobId: job.id,
          resumeUrl,
          resumeText,
          matchScore: analysis.score,
          summary: analysis.summary,
        }
      });

      await tx.aIAnalysis.create({
        data: {
          applicationId: app.id,
          score: analysis.score,
          strengths: JSON.stringify(analysis.strengths),
          weaknesses: JSON.stringify(analysis.weaknesses),
          missingSkills: JSON.stringify(analysis.missingSkills),
          recommendation: analysis.recommendation,
          atsScore: analysis.atsScore,
          questions: JSON.stringify(analysis.interviewQuestions),
          jsonResponse: JSON.stringify(analysis),
        }
      });

      return app;
    });

    return NextResponse.json({
      message: 'Applied successfully',
      applicationId: application.id,
      score: analysis.score,
      recommendation: analysis.recommendation
    }, { status: 201 });

  } catch (error) {
    console.error('Apply Route Error:', error);
    return NextResponse.json({ message: 'Apply failed: ' + (error as Error).message }, { status: 500 });
  }
}

// PUT: Recruiter updates application status (Shortlist, Reject, Screening)
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'RECRUITER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { applicationId, status } = body;

    if (!applicationId || !status) {
      return NextResponse.json({ message: 'Missing applicationId or status parameters.' }, { status: 400 });
    }

    const validStatuses = ['PENDING', 'SCREENING', 'SHORTLISTED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: 'Invalid status type.' }, { status: 400 });
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status }
    });

    return NextResponse.json({ message: 'Application status updated.', application: updated });
  } catch (error) {
    console.error('Update Application Status Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

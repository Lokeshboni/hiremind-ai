import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const candidateProfileSchema = z.object({
  headline: z.string().optional(),
  location: z.string().optional(),
  skills: z.array(z.string()).optional(),
  linkedin: z.string().url().or(z.literal('')).optional(),
  github: z.string().url().or(z.literal('')).optional(),
  portfolio: z.string().url().or(z.literal('')).optional(),
  experience: z.string().optional(),
  education: z.string().optional(),
});

const recruiterProfileSchema = z.object({
  designation: z.string().optional(),
  companyName: z.string().optional(),
  companyWebsite: z.string().url().or(z.literal('')).optional(),
  companyIndustry: z.string().optional(),
  companyDescription: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id, role } = session.user;

    if (role === 'CANDIDATE') {
      const profile = await prisma.candidateProfile.findUnique({
        where: { userId: id },
        include: {
          applications: {
            include: {
              job: {
                include: { company: true }
              },
              analysis: true,
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (profile) {
        const parsedApplications = profile.applications.map(app => {
          let parsedAnalysis = null;
          if (app.analysis) {
            parsedAnalysis = {
              ...app.analysis,
              strengths: app.analysis.strengths ? JSON.parse(app.analysis.strengths) : [],
              weaknesses: app.analysis.weaknesses ? JSON.parse(app.analysis.weaknesses) : [],
              missingSkills: app.analysis.missingSkills ? JSON.parse(app.analysis.missingSkills) : [],
              questions: app.analysis.questions ? JSON.parse(app.analysis.questions) : []
            };
          }
          const parsedJob = {
            ...app.job,
            requirements: app.job.requirements ? JSON.parse(app.job.requirements) : [],
            skills: app.job.skills ? JSON.parse(app.job.skills) : []
          };
          return {
            ...app,
            analysis: parsedAnalysis,
            job: parsedJob
          };
        });

        const parsedProfile = {
          ...profile,
          skills: profile.skills ? profile.skills.split(',').map(s => s.trim()).filter(s => s.length > 0) : [],
          applications: parsedApplications
        };
        return NextResponse.json({ role, profile: parsedProfile });
      }

      return NextResponse.json({ role, profile: null });
    } else if (role === 'RECRUITER') {
      const profile = await prisma.recruiter.findUnique({
        where: { userId: id },
        include: {
          company: true,
        }
      });

      return NextResponse.json({ role, profile });
    }

    return NextResponse.json({ message: 'Admin profile not retrieved here.' }, { status: 400 });
  } catch (error) {
    console.error('Get Profile Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id, role } = session.user;
    const body = await req.json();

    if (role === 'CANDIDATE') {
      const result = candidateProfileSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json({ message: result.error.errors[0].message }, { status: 400 });
      }

      const { skills, ...rest } = result.data;

      const updated = await prisma.candidateProfile.update({
        where: { userId: id },
        data: {
          ...rest,
          skills: skills ? skills.join(', ') : undefined
        },
      });

      return NextResponse.json({ 
        message: 'Profile updated successfully', 
        profile: {
          ...updated,
          skills: updated.skills ? updated.skills.split(',').map(s => s.trim()).filter(s => s.length > 0) : []
        }
      });
    } else if (role === 'RECRUITER') {
      const result = recruiterProfileSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json({ message: result.error.errors[0].message }, { status: 400 });
      }

      const { designation, companyName, companyWebsite, companyIndustry, companyDescription } = result.data;

      const profile = await prisma.recruiter.findUnique({
        where: { userId: id },
      });

      if (!profile) {
        return NextResponse.json({ message: 'Recruiter profile not found.' }, { status: 404 });
      }

      // Update Recruiter designation and transactional Company details
      const updated = await prisma.$transaction(async (tx) => {
        let companyId = profile.companyId;

        if (companyId) {
          await tx.company.update({
            where: { id: companyId },
            data: {
              name: companyName,
              website: companyWebsite,
              industry: companyIndustry,
              description: companyDescription,
            }
          });
        } else if (companyName) {
          const comp = await tx.company.create({
            data: {
              name: companyName,
              website: companyWebsite,
              industry: companyIndustry,
              description: companyDescription,
            }
          });
          companyId = comp.id;
        }

        return tx.recruiter.update({
          where: { userId: id },
          data: {
            designation,
            companyId,
          },
          include: { company: true }
        });
      });

      return NextResponse.json({ message: 'Recruiter profile updated successfully', profile: updated });
    }

    return NextResponse.json({ message: 'Action not supported' }, { status: 400 });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

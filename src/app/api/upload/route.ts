import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { extractTextFromBuffer } from '@/lib/parser';
import { parseResume } from '@/lib/gemini';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

// Define the public directory for saving resume uploads locally
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'resumes');

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    // Enforce 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: 'File size exceeds maximum limit of 5MB.' }, { status: 400 });
    }

    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];

    if (!allowedMimeTypes.includes(file.type) && !file.name.endsWith('.docx') && !file.name.endsWith('.pdf') && !file.name.endsWith('.txt')) {
      return NextResponse.json({ message: 'Unsupported file format. Please upload PDF, DOCX, or TXT.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Extract text from resume
    const resumeText = await extractTextFromBuffer(buffer, file.type);
    
    if (!resumeText || resumeText.trim().length === 0) {
      return NextResponse.json({ message: 'Could not extract text from document. Ensure it is not an image.' }, { status: 400 });
    }

    // Call Gemini to parse resume structure
    const parsedData = await parseResume(resumeText);

    // Save file locally for retrieval / download demonstration
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    const safeFilename = `${session.user.id}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
    const filePath = path.join(UPLOAD_DIR, safeFilename);
    fs.writeFileSync(filePath, buffer);

    const relativeUrl = `/uploads/resumes/${safeFilename}`;

    // Auto-update the candidate's profile with the parsed resume URL & properties
    if (session.user.role === 'CANDIDATE') {
      await prisma.candidateProfile.update({
        where: { userId: session.user.id },
        data: {
          resumeUrl: relativeUrl,
          headline: parsedData.headline || undefined,
          skills: parsedData.skills ? parsedData.skills.join(', ') : '',
          experience: JSON.stringify(parsedData.experience),
          education: JSON.stringify(parsedData.education),
        }
      });
    }

    return NextResponse.json({
      message: 'Resume parsed and uploaded successfully',
      fileUrl: relativeUrl,
      rawText: resumeText,
      parsedData
    });

  } catch (error) {
    console.error('Resume Upload Route Error:', error);
    return NextResponse.json({ message: 'Failed to process and parse resume: ' + (error as Error).message }, { status: 500 });
  }
}

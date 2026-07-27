import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const jobCreateSchema = z.object({
  title: z.string().min(2, 'Job Title must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  requirements: z.array(z.string()).min(1, 'At least one requirement is required'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  experience: z.string().min(1, 'Minimum Experience is required'),
  location: z.string().min(2, 'Location is required'),
  salary: z.string().min(2, 'Salary is required'),
  employmentType: z.enum(['Full-time', 'Part-time', 'Contract', 'Internship']),
  workplaceType: z.enum(['Onsite', 'Hybrid', 'Remote']),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const location = searchParams.get('location') || '';
    const workplaceType = searchParams.get('workplaceType') || 'ALL';
    const employmentType = searchParams.get('employmentType') || 'ALL';

    const whereClause: any = {};

    // Search query matches title or skills
    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { skills: { contains: search } },
        { description: { contains: search } }
      ];
    }

    if (location) {
      whereClause.location = { contains: location, mode: 'insensitive' };
    }

    if (workplaceType !== 'ALL') {
      whereClause.workplaceType = workplaceType;
    }

    if (employmentType !== 'ALL') {
      whereClause.employmentType = employmentType;
    }

    const parsedJobs = jobs.map(job => ({
      ...job,
      requirements: job.requirements ? JSON.parse(job.requirements) : [],
      skills: job.skills ? JSON.parse(job.skills) : []
    }));

    return NextResponse.json({ jobs: parsedJobs });
  } catch (error) {
    console.error('Fetch Jobs Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user.role !== 'RECRUITER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = jobCreateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { title, description, requirements, skills, experience, location, salary, employmentType, workplaceType } = result.data;

    // Retrieve the Recruiter profile to find their company
    const recruiter = await prisma.recruiter.findUnique({
      where: { userId: session.user.id },
    });

    if (!recruiter || !recruiter.companyId) {
      return NextResponse.json(
        { message: 'You must link a Company profile before publishing jobs.' },
        { status: 400 }
      );
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        requirements: JSON.stringify(requirements),
        skills: JSON.stringify(skills),
        experience,
        location,
        salary,
        employmentType,
        workplaceType,
        companyId: recruiter.companyId,
        createdById: session.user.id,
      },
      include: {
        company: true
      }
    });

    const parsedJob = {
      ...job,
      requirements: job.requirements ? JSON.parse(job.requirements) : [],
      skills: job.skills ? JSON.parse(job.skills) : []
    };

    return NextResponse.json({ message: 'Job vacancy published successfully.', job: parsedJob }, { status: 201 });
  } catch (error) {
    console.error('Create Job Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

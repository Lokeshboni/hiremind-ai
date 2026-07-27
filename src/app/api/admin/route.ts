import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Retrieve all Users in the system
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });

    // Retrieve all Jobs published in the system
    const jobs = await prisma.job.findMany({
      include: {
        company: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Aggregates
    const totalUsers = users.length;
    const totalJobs = jobs.length;
    
    const totalApplications = await prisma.application.count();
    const totalAnalysis = await prisma.aIAnalysis.count();

    const parsedJobs = jobs.map(job => ({
      ...job,
      requirements: job.requirements ? JSON.parse(job.requirements) : [],
      skills: job.skills ? JSON.parse(job.skills) : []
    }));

    return NextResponse.json({
      stats: {
        totalUsers,
        totalJobs,
        totalApplications,
        totalAnalysis
      },
      users,
      jobs: parsedJobs
    });

  } catch (error) {
    console.error('Admin GET Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const jobId = searchParams.get('jobId');

    // Handle user deletion (spam cleanup)
    if (userId) {
      // Prevent admin from deleting themselves
      if (userId === session.user.id) {
        return NextResponse.json({ message: 'Cannot delete your own administrator account.' }, { status: 400 });
      }

      await prisma.user.delete({
        where: { id: userId }
      });

      return NextResponse.json({ message: 'User account and profile deleted successfully.' });
    }

    // Handle job deletion (spam listing cleanup)
    if (jobId) {
      await prisma.job.delete({
        where: { id: jobId }
      });

      return NextResponse.json({ message: 'Job posting deleted successfully.' });
    }

    return NextResponse.json({ message: 'Missing userId or jobId parameter.' }, { status: 400 });

  } catch (error) {
    console.error('Admin DELETE Error:', error);
    return NextResponse.json({ message: 'Failed to delete: ' + (error as Error).message }, { status: 500 });
  }
}

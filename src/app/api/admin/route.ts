import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: Admin stats overview metrics & user/job management listing
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Retrieve all Users registered in the system
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
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

    return NextResponse.json({
      stats: {
        totalUsers,
        totalJobs,
        totalApplications,
        totalAnalysis
      },
      users,
      jobs
    });

  } catch (error) {
    console.error('Admin GET Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Admin hard-delete a user or job listing
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetType = searchParams.get('type'); // 'user' or 'job'
    const targetId = searchParams.get('id');

    if (!targetType || !targetId) {
      return NextResponse.json({ message: 'Missing target type or ID parameters.' }, { status: 400 });
    }

    if (targetType === 'user') {
      // Prevent deleting self
      if (targetId === session.user.id) {
        return NextResponse.json({ message: 'Cannot self-delete logged-in admin user.' }, { status: 400 });
      }

      await prisma.user.delete({
        where: { id: targetId },
      });
      return NextResponse.json({ message: 'User record deleted successfully.' });

    } else if (targetType === 'job') {
      await prisma.job.delete({
        where: { id: targetId },
      });
      return NextResponse.json({ message: 'Job vacancy deleted successfully.' });
    }

    return NextResponse.json({ message: 'Unsupported target operation type.' }, { status: 400 });
  } catch (error) {
    console.error('Admin DELETE Error:', error);
    return NextResponse.json({ message: 'Deletion failed: ' + (error as Error).message }, { status: 500 });
  }
}

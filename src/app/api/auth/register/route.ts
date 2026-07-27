import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['CANDIDATE', 'RECRUITER']),
  companyName: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, role, companyName } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'A user with this email already exists.' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and associated profile transactionally
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email: normalizedEmail,
          password: hashedPassword,
          role,
        },
      });

      if (role === 'CANDIDATE') {
        await tx.candidateProfile.create({
          data: {
            userId: newUser.id,
            headline: 'Aspiring professional looking for opportunities',
            skills: '',
          },
        });
      } else if (role === 'RECRUITER') {
        let companyId = null;

        if (companyName) {
          const comp = await tx.company.create({
            data: {
              name: companyName,
              industry: 'Technology',
              description: `A forward-thinking company named ${companyName}`,
            },
          });
          companyId = comp.id;
        } else {
          // Create or link to a generic placeholder company
          const defaultCompany = await tx.company.findFirst({
            where: { name: 'Independent Recruitment' }
          });
          
          if (defaultCompany) {
            companyId = defaultCompany.id;
          } else {
            const comp = await tx.company.create({
              data: {
                name: 'Independent Recruitment',
                industry: 'Staffing',
              }
            });
            companyId = comp.id;
          }
        }

        await tx.recruiter.create({
          data: {
            userId: newUser.id,
            companyId,
            designation: 'Hiring Manager',
          },
        });
      }

      return newUser;
    });

    return NextResponse.json(
      { message: 'User registered successfully.', userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}

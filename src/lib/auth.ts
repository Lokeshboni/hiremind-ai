if (process.env.NEXTAUTH_URL === '') {
  delete process.env.NEXTAUTH_URL;
}

import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide both email and password.');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          include: {
            candidateProfile: true,
            recruiterProfile: true,
          }
        });

        if (!user) {
          throw new Error('No user found with this email.');
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.password);

        if (!isValidPassword) {
          throw new Error('Invalid email or password.');
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileId: user.role === 'CANDIDATE' 
            ? user.candidateProfile?.id 
            : user.recruiterProfile?.id,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.profileId = user.profileId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.profileId = token.profileId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'super-secret-hiremind-ai-key',
};

// NextAuth TypeScript typings extend
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: 'CANDIDATE' | 'RECRUITER' | 'ADMIN';
      profileId?: string;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: 'CANDIDATE' | 'RECRUITER' | 'ADMIN';
    profileId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'CANDIDATE' | 'RECRUITER' | 'ADMIN';
    profileId?: string;
  }
}

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database tables...');
  
  // Try deleting in order to prevent foreign key errors in SQLite
  try { await prisma.aIAnalysis.deleteMany({}); } catch {}
  try { await prisma.application.deleteMany({}); } catch {}
  try { await prisma.job.deleteMany({}); } catch {}
  try { await prisma.recruiter.deleteMany({}); } catch {}
  try { await prisma.candidateProfile.deleteMany({}); } catch {}
  try { await prisma.company.deleteMany({}); } catch {}
  try { await prisma.user.deleteMany({}); } catch {}

  console.log('Generating password hashes...');
  const defaultPassword = await bcrypt.hash('password123', 10);

  // 1. Create Companies
  console.log('Creating mock companies...');
  const stripe = await prisma.company.create({
    data: {
      id: 'stripe-uuid-1111',
      name: 'Stripe Inc.',
      website: 'https://stripe.com',
      logo: '',
      industry: 'Fintech / Payment Processing',
      description: 'Stripe is a suite of APIs powering online payment processing and commerce solutions for businesses of all sizes.',
    }
  });

  const supabase = await prisma.company.create({
    data: {
      id: 'supabase-uuid-2222',
      name: 'Supabase',
      website: 'https://supabase.com',
      logo: '',
      industry: 'Database / Cloud Tools',
      description: 'Supabase is an open source Firebase alternative providing database hooks, authentication endpoints, and real-time sockets.',
    }
  });

  // 2. Create Users
  console.log('Creating system users...');
  
  // Admin User
  await prisma.user.create({
    data: {
      id: 'admin-uuid-0000',
      name: 'System Admin',
      email: 'admin@hiremind.ai',
      password: defaultPassword,
      role: 'ADMIN',
    }
  });

  // Recruiter 1
  const rec1User = await prisma.user.create({
    data: {
      id: 'rec1-uuid-1111',
      name: 'Marcus Aurelius',
      email: 'marcus@stripe.com',
      password: defaultPassword,
      role: 'RECRUITER',
    }
  });

  await prisma.recruiter.create({
    data: {
      id: 'rec-profile-1111',
      userId: rec1User.id,
      companyId: stripe.id,
      designation: 'Principal Talent Partner',
    }
  });

  // Recruiter 2
  const rec2User = await prisma.user.create({
    data: {
      id: 'rec2-uuid-2222',
      name: 'Diana Prince',
      email: 'diana@supabase.io',
      password: defaultPassword,
      role: 'RECRUITER',
    }
  });

  await prisma.recruiter.create({
    data: {
      id: 'rec-profile-2222',
      userId: rec2User.id,
      companyId: supabase.id,
      designation: 'Lead Engineering Recruiter',
    }
  });

  // Candidate 1
  const cand1User = await prisma.user.create({
    data: {
      id: 'cand1-uuid-3333',
      name: 'Alex Mercer',
      email: 'alex.mercer@example.com',
      password: defaultPassword,
      role: 'CANDIDATE',
    }
  });

  const cand1Profile = await prisma.candidateProfile.create({
    data: {
      id: 'cand-profile-3333',
      userId: cand1User.id,
      headline: 'Senior Full Stack Engineer | React & Node Architect',
      location: 'San Francisco, CA',
      skills: 'React, Next.js, TypeScript, Node.js, PostgreSQL, AWS, Docker, REST APIs',
      linkedin: 'https://linkedin.com/in/alexmercer',
      github: 'https://github.com/alexmercer',
      portfolio: 'https://alexmercer.dev',
      experience: JSON.stringify([
        {
          company: 'TechNexus Corp',
          role: 'Senior Frontend Engineer',
          duration: '2023 - Present',
          description: 'Spearheaded frontend migration of client dashboards to Next.js 14, improving page interaction times by 35%.'
        },
        {
          company: 'DevFlow Studio',
          role: 'Full Stack Engineer',
          duration: '2021 - 2023',
          description: 'Constructed modular microservices using Express, PostgreSQL, and Redis caching blocks.'
        }
      ]),
      education: JSON.stringify([
        {
          institution: 'State University of Technology',
          degree: 'Bachelor of Science in Software Engineering',
          year: '2021'
        }
      ])
    }
  });

  // Candidate 2
  const cand2User = await prisma.user.create({
    data: {
      id: 'cand2-uuid-4444',
      name: 'Sarah Connor',
      email: 'sarah.connor@example.com',
      password: defaultPassword,
      role: 'CANDIDATE',
    }
  });

  const cand2Profile = await prisma.candidateProfile.create({
    data: {
      id: 'cand-profile-4444',
      userId: cand2User.id,
      headline: 'DevOps Lead & Cloud Automation Specialist',
      location: 'Austin, TX',
      skills: 'AWS, Kubernetes, Docker, Terraform, CI/CD, Python',
      linkedin: 'https://linkedin.com/in/sarahconnor',
      github: 'https://github.com/sarahconnor',
      experience: JSON.stringify([
        {
          company: 'Cyberdyne Systems',
          role: 'Principal DevOps Architect',
          duration: '2022 - Present',
          description: 'Re-architected cloud infrastructure on AWS EKS using Terraform, slashing provisioning cycles by 80%.'
        }
      ]),
      education: JSON.stringify([
        {
          institution: 'Texas A&M University',
          degree: 'Bachelor of Science in Computer Engineering',
          year: '2022'
        }
      ])
    }
  });

  // 3. Create Jobs
  console.log('Publishing mock job vacancies...');
  
  const job1 = await prisma.job.create({
    data: {
      id: 'job-uuid-1111',
      title: 'Senior Next.js Developer',
      description: 'We are seeking a senior frontend wizard to lead our billing portal team. You will write robust, high-speed interfaces using Next.js, TypeScript, and tailwind variables.',
      requirements: JSON.stringify([
        'Lead development of new billing interfaces and custom graphs',
        'Collaborate with PMs to refine checkout dashboards',
        'Optimize page speed, bundle sizes and image compression assets'
      ]),
      skills: JSON.stringify(['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'NextAuth.js', 'Recharts']),
      experience: '5+ years',
      location: 'San Francisco, CA',
      salary: '$150,000 - $185,000',
      employmentType: 'Full-time',
      workplaceType: 'Hybrid',
      companyId: stripe.id,
      createdById: rec1User.id,
    }
  });

  const job2 = await prisma.job.create({
    data: {
      id: 'job-uuid-2222',
      title: 'Cloud DevOps Architect',
      description: 'Supabase is expanding infrastructure. We need an architect proficient in scaling Kubernetes, implementing unified secret controls, and establishing automated terraform scripts.',
      requirements: JSON.stringify([
        'Design and deploy AWS and GCP multi-region nodes',
        'Establish automated deployment scripts using GitHub Actions',
        'Ensure system safety, rate limiting protocols and metrics logging'
      ]),
      skills: JSON.stringify(['AWS', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD', 'Python']),
      experience: '4+ years',
      location: 'Remote',
      salary: '$160,000 - $200,000',
      employmentType: 'Full-time',
      workplaceType: 'Remote',
      companyId: supabase.id,
      createdById: rec2User.id,
    }
  });

  // 4. Create Applications & AIAnalysis
  console.log('Creating applicant screening submissions...');

  // Application 1: Alex to Stripe (Next.js Job) -> Strong Match!
  const app1 = await prisma.application.create({
    data: {
      id: 'app-uuid-1111',
      candidateId: cand1Profile.id,
      jobId: job1.id,
      resumeUrl: '/uploads/resumes/alex-resume-stripe-mock.pdf',
      resumeText: 'Alex Mercer Resume. 6+ years React, NextJS, TypeScript, Node.js, Postgres. Worked at TechNexus.',
      status: 'SCREENING',
      matchScore: 82,
      summary: 'Alex Mercer matches the Next.js and TypeScript parameters. Direct frontend experience makes him an excellent candidate.',
    }
  });

  await prisma.aIAnalysis.create({
    data: {
      id: 'analysis-uuid-1111',
      applicationId: app1.id,
      score: 82,
      strengths: JSON.stringify([
        'Deep competencies in React, Next.js, and TypeScript',
        'Direct experience optimizing SaaS dashboards and performance metrics',
        'Strong back-end knowledge with Node.js and Postgres databases'
      ]),
      weaknesses: JSON.stringify([
        'No listed experience using Prisma ORM or NextAuth modules directly',
        'Slightly shorter tenure under 2 years at previous position'
      ]),
      missingSkills: JSON.stringify(['NextAuth.js', 'Recharts']),
      recommendation: 'SHORTLIST',
      atsScore: 78,
      questions: JSON.stringify([
        'Explain how you would optimize database queries inside a Next.js serverless route.',
        'Describe your experience deploying Next.js pages utilizing edge runtimes.',
        'Have you worked with client charting packages like Recharts?'
      ]),
      jsonResponse: JSON.stringify({
        score: 82,
        skillsMatched: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL'],
        missingSkills: ['NextAuth.js', 'Recharts'],
        experienceFit: 'Strong fit with 6+ years of general full-stack skills.',
        educationFit: 'Holds relevant BS in Software Engineering.',
        atsScore: 78,
        strengths: ['Deep competencies in React, Next.js, and TypeScript', 'Direct experience optimizing SaaS dashboards'],
        weaknesses: ['No listed experience using Prisma or NextAuth'],
        recommendation: 'SHORTLIST',
        summary: 'Alex Mercer matches the Next.js and TypeScript parameters.',
        interviewQuestions: ['Explain how you would optimize database queries inside a Next.js serverless route.'],
        resumeRewriteSuggestions: ['Add mentions of Next.js auth libraries or ORMs to demonstrate familiarity.'],
        skillGapAnalysis: 'Needs onboarding for specific auth and charting widgets.',
        careerRecommendation: 'Perfect staff developer career alignment.',
        recruiterNotes: 'Alex is a strong generalist. Highlight Next.js backend and routing protocols during screen.'
      })
    }
  });

  // Application 2: Sarah to Supabase (DevOps Job) -> Strong Match!
  const app2 = await prisma.application.create({
    data: {
      id: 'app-uuid-2222',
      candidateId: cand2Profile.id,
      jobId: job2.id,
      resumeUrl: '/uploads/resumes/sarah-resume-supabase-mock.pdf',
      resumeText: 'Sarah Connor DevOps Resume. AWS, Kubernetes, Terraform, Docker, Python, GitHub Actions.',
      status: 'PENDING',
      matchScore: 95,
      summary: 'Sarah is an outstanding fit for the DevOps role, showing complete matching tags across Kubernetes, Terraform, and AWS EKS.',
    }
  });

  await prisma.aIAnalysis.create({
    data: {
      id: 'analysis-uuid-2222',
      applicationId: app2.id,
      score: 95,
      strengths: JSON.stringify([
        'Complete alignment with the Terraform, Kubernetes, and AWS infrastructure stack',
        'Direct experience designing and maintaining multi-region cloud networks',
        'Solid scripting foundation in Python and Linux bash automations'
      ]),
      weaknesses: JSON.stringify([
        'Limited direct application development experience in React/Node'
      ]),
      missingSkills: JSON.stringify([]),
      recommendation: 'STRONG_BUY',
      atsScore: 92,
      questions: JSON.stringify([
        'How do you manage state lock file issues in multi-tenant Terraform scripts?',
        'Describe your strategy for migrating database clusters across AWS regions without downtime.'
      ]),
      jsonResponse: JSON.stringify({
        score: 95,
        skillsMatched: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD', 'Python'],
        missingSkills: [],
        experienceFit: 'Expert fit for AWS/Kubernetes systems architecture.',
        educationFit: 'BS in Computer Engineering.',
        atsScore: 92,
        strengths: ['Complete alignment with Terraform & Kubernetes'],
        weaknesses: ['Limited frontend React exposure'],
        recommendation: 'STRONG_BUY',
        summary: 'Sarah is an outstanding fit for the DevOps role.',
        interviewQuestions: ['How do you manage state lock file issues in multi-tenant Terraform scripts?'],
        resumeRewriteSuggestions: ['None needed. Resume is optimized.'],
        skillGapAnalysis: 'Zero critical gaps.',
        careerRecommendation: 'Direct fit on Principal DevOps track.',
        recruiterNotes: 'Highest priority candidate. Arrange tech panel interview immediately.'
      })
    }
  });

  console.log('Database seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error('Seeding process encountered an error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

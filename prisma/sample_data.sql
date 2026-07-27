-- HireMind AI Sample SQL Dump for PostgreSQL
-- Pre-populates default companies, users, and job listings.

-- 1. Create Role Enums and Tables (for review or direct import)
CREATE TYPE "Role" AS ENUM ('CANDIDATE', 'RECRUITER', 'ADMIN');

-- 2. Insert Mock Companies
INSERT INTO "Company" ("id", "name", "website", "logo", "industry", "description") VALUES
('stripe-uuid-1111', 'Stripe Inc.', 'https://stripe.com', '', 'Fintech / Payment Processing', 'Stripe is a suite of APIs powering online payment processing and commerce solutions for businesses of all sizes.'),
('supabase-uuid-2222', 'Supabase', 'https://supabase.com', '', 'Database / Cloud Tools', 'Supabase is an open source Firebase alternative providing database hooks, authentication endpoints, and real-time sockets.');

-- 3. Insert Mock Users
-- Passwords are hashed representation of 'password123' using bcrypt with cost 10
INSERT INTO "User" ("id", "name", "email", "password", "role", "createdAt") VALUES
('admin-uuid-0000', 'System Admin', 'admin@hiremind.ai', '$2a$10$tMh4HkI7L8U.jZtXGj5XCeW8K8l65GfB/3R9v4j2uXU8.pP5Nq2mS', 'ADMIN', NOW()),
('rec1-uuid-1111', 'Marcus Aurelius', 'marcus@stripe.com', '$2a$10$tMh4HkI7L8U.jZtXGj5XCeW8K8l65GfB/3R9v4j2uXU8.pP5Nq2mS', 'RECRUITER', NOW()),
('rec2-uuid-2222', 'Diana Prince', 'diana@supabase.io', '$2a$10$tMh4HkI7L8U.jZtXGj5XCeW8K8l65GfB/3R9v4j2uXU8.pP5Nq2mS', 'RECRUITER', NOW()),
('cand1-uuid-3333', 'Alex Mercer', 'alex.mercer@example.com', '$2a$10$tMh4HkI7L8U.jZtXGj5XCeW8K8l65GfB/3R9v4j2uXU8.pP5Nq2mS', 'CANDIDATE', NOW()),
('cand2-uuid-4444', 'Sarah Connor', 'sarah.connor@example.com', '$2a$10$tMh4HkI7L8U.jZtXGj5XCeW8K8l65GfB/3R9v4j2uXU8.pP5Nq2mS', 'CANDIDATE', NOW());

-- 4. Link Recruiter Profiles
INSERT INTO "Recruiter" ("id", "userId", "companyId", "designation") VALUES
('rec-profile-1111', 'rec1-uuid-1111', 'stripe-uuid-1111', 'Principal Talent Partner'),
('rec-profile-2222', 'rec2-uuid-2222', 'supabase-uuid-2222', 'Lead Engineering Recruiter');

-- 5. Link Candidate Profiles
INSERT INTO "CandidateProfile" ("id", "userId", "headline", "location", "skills", "experience", "education", "linkedin", "github", "portfolio", "createdAt") VALUES
('cand-profile-3333', 'cand1-uuid-3333', 'Senior Full Stack Engineer | React & Node Architect', 'San Francisco, CA', ARRAY['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'Docker'], '[{"company":"TechNexus Corp","role":"Senior Frontend Engineer","duration":"2023 - Present","description":"Spearheaded frontend migration of client dashboards to Next.js 14, improving page interaction times by 35%."}]', '[{"institution":"State University of Technology","degree":"Bachelor of Science in Software Engineering","year":"2021"}]', 'https://linkedin.com/in/alexmercer', 'https://github.com/alexmercer', 'https://alexmercer.dev', NOW()),
('cand-profile-4444', 'cand2-uuid-4444', 'DevOps Lead & Cloud Automation Specialist', 'Austin, TX', ARRAY['AWS', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD', 'Python'], '[{"company":"Cyberdyne Systems","role":"Principal DevOps Architect","duration":"2022 - Present","description":"Re-architected cloud infrastructure on AWS EKS using Terraform, slashing provisioning cycles by 80%."}]', '[{"institution":"Texas A&M University","degree":"Bachelor of Science in Computer Engineering","year":"2022"}]', 'https://linkedin.com/in/sarahconnor', 'https://github.com/sarahconnor', '', NOW());

-- 6. Insert Mock Jobs
INSERT INTO "Job" ("id", "title", "description", "requirements", "skills", "experience", "location", "salary", "employmentType", "workplaceType", "companyId", "createdById", "createdAt") VALUES
('job-uuid-1111', 'Senior Next.js Developer', 'We are seeking a senior frontend wizard to lead our billing portal team. You will write robust, high-speed interfaces using Next.js, TypeScript, and tailwind variables.', ARRAY['Lead development of new billing interfaces and custom graphs', 'Collaborate with PMs to refine checkout dashboards', 'Optimize page speed, bundle sizes and image compression assets'], ARRAY['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'NextAuth.js', 'Recharts'], '5+ years', 'San Francisco, CA', '$150,000 - $185,000', 'Full-time', 'Hybrid', 'stripe-uuid-1111', 'rec1-uuid-1111', NOW()),
('job-uuid-2222', 'Cloud DevOps Architect', 'Supabase is expanding infrastructure. We need an architect proficient in scaling Kubernetes, implementing unified secret controls, and establishing automated terraform scripts.', ARRAY['Design and deploy AWS and GCP multi-region nodes', 'Establish automated deployment scripts using GitHub Actions', 'Ensure system safety, rate limiting protocols and metrics logging'], ARRAY['AWS', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD', 'Python'], '4+ years', 'Remote', '$160,000 - $200,000', 'Full-time', 'Remote', 'supabase-uuid-2222', 'rec2-uuid-2222', NOW());

-- 7. Insert Mock Application & AIAnalysis
INSERT INTO "Application" ("id", "candidateId", "jobId", "resumeUrl", "resumeText", "status", "matchScore", "summary", "createdAt") VALUES
('app-uuid-1111', 'cand-profile-3333', 'job-uuid-1111', '/uploads/resumes/alex-resume-stripe-mock.pdf', 'Alex Mercer Resume. 6+ years React, NextJS, TypeScript, Node.js, Postgres. Worked at TechNexus.', 'SCREENING', 82, 'Alex Mercer matches the Next.js and TypeScript parameters. Direct frontend experience makes him an excellent candidate.', NOW());

INSERT INTO "AIAnalysis" ("id", "applicationId", "score", "strengths", "weaknesses", "missingSkills", "recommendation", "atsScore", "questions", "jsonResponse", "createdAt") VALUES
('analysis-uuid-1111', 'app-uuid-1111', 82, ARRAY['Deep competencies in React, Next.js, and TypeScript', 'Direct experience optimizing SaaS dashboards and performance metrics'], ARRAY['No listed experience using Prisma ORM or NextAuth modules directly'], ARRAY['NextAuth.js', 'Recharts'], 'SHORTLIST', 78, ARRAY['Explain how you would optimize database queries inside a Next.js serverless route.', 'Describe your experience deploying Next.js pages utilizing edge runtimes.', 'Have you worked with client charting packages like Recharts?'], '{}', NOW());

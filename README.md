# HireMind AI - Smart Resume Screening & AI Recruiter Platform

HireMind AI is a production-ready, enterprise-grade recruitment platform designed to automate applicant screening and parse credentials. Powered by Google Gemini and Next.js 15, the application parses candidate attachments (PDF, DOCX, TXT), maps skill alignments, performs semantic matching scores (0-100), detects duplicate candidates, and compiles in-depth recruiter evaluations.

---

## Technical Architecture

```mermaid
graph TD
  A[Candidate Client] -->|Upload Resume / Apply| B(NextJS Frontend Server Action)
  C[Recruiter Client] -->|Review Analytics & Reports| B
  B -->|Database Operations| D[Prisma Client ORM]
  D -->|Persist Records| E[(PostgreSQL Database)]
  B -->|Text Extraction| F[Parser Service: mammoth / pdf-parse]
  B -->|Semantic Screening Prompt| G[Google Gemini API: @google/genai]
  G -->|Structured JSON Output| B
  B -->|Authentication & Authorization| H[NextAuth credentials JWT]
```

---

## Core Features

### AI Engine & Document Parser
* **Document Extraction**: Server-side parsing of text from `.pdf`, `.docx`, and `.txt` files up to 5MB.
* **Resume Parser**: Direct extraction of candidates' full names, emails, contact info, headlines, skill tags, academic history, and work history.
* **Fit Compatibility (0-100)**: Semantic matching based on a weighted formula: **40% Core Skills, 30% Career Experience, 15% Education, 10% Projects, and 5% Certifications**.
* **ATS Compatibility**: Detailed analysis checks that flag layout gaps, missing keywords, and suggest resume optimization adjustments.

### Recruiter Suite
* **Interactive Control Panel**: Overview analytics detailing open listings, application trends, and unique applicant counts.
* **Analytical Visualizations (Recharts)**: Interactive area charts showing weekly trends and funnel bars detailing pipeline stages.
* **Applicant Screening board**: Multi-criteria search filters (by skill tags, locations, candidate names, and match thresholds).
* **AI Recruiter Notes**: Confidential recruiter evaluation summaries and AI-generated technical interview questions designed to probe candidate skill gaps.

### Candidate Portal
* **Profile Builder Progress**: Visual completion progress bar indicating which sections are complete.
* **AI Candidate Feedback**: Modal summaries explaining fit scores, missing credentials, and customized online courses and certifications to close skill gaps.
* **Job Board**: Open positions search with remote/hybrid filters, allowing single-click applications.

---

## Directory Structure

```text
app/
├── components/          # Reusable React components (Navbar, SessionProvider, etc.)
├── prisma/              # Prisma schema definition, SQL sample datasets, and seed scripts
├── public/              # Global asset uploads folder (resumes, media outputs)
├── src/
│   ├── app/             # Next.js App Router (pages, templates, layout styling)
│   │   ├── api/         # REST API routes (auth, apply, jobs, admin, upload)
│   │   ├── applications/# Candidate evaluation detailed pages
│   │   ├── auth/        # Login and registration layouts
│   │   ├── dashboard/   # Recruiter and candidate control panels
│   │   └── jobs/        # Postings boards and publish forms
│   ├── lib/             # Third-party utilities (Prisma singleton, NextAuth config, Gemini client)
│   └── middleware.ts    # Role-based route authorization gate
├── vercel.json          # Deployment configuration
└── package.json         # NPM package dependencies
```

---

## Tech Stack

* **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion, Recharts
* **Backend**: Next.js API Routes (NextAuth.js, Bcryptjs)
* **Database**: PostgreSQL (Prisma ORM)
* **AI Engine**: Google Gemini API (`@google/genai` client SDK)
* **Libraries**: Zod (validation), React Hook Form, `pdf-parse`, `mammoth`

---

## Installation & Local Development

### 1. Prerequisite Configuration
Ensure you have **Node.js (v20+)** and **npm** installed. Configure a PostgreSQL instance (e.g. Supabase, Neon, or local).

### 2. Clone and Setup Dependencies
```bash
# Clone the repository
cd hiremind-ai

# Install packages
npm install --legacy-peer-deps
```

### 3. Environment Setup
Create a `.env` file in the root workspace folder:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/hiremind_db?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="some-long-cryptographic-random-secret"
GEMINI_API_KEY="your-google-ai-studio-api-key"
```

### 4. Database Setup & Migrations
Deploy the database schema, generate the local client, and load mock profiles:
```bash
# Sync database schema
npx prisma db push

# Generate client typescript definitions
npm run prisma:generate

# Load mock seed records
npx prisma db seed
```

### 5. Running the Application
Launch the local Next.js dev server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the platform.

### Logins for Testing Mock Data:
* **Admin**: `admin@hiremind.ai` (Password: `password123`)
* **Recruiter**: `marcus@stripe.com` (Password: `password123`)
* **Candidate**: `alex.mercer@example.com` (Password: `password123`)

---

## Deployment & CI/CD

### Deploy to Vercel
The repository includes a `vercel.json` file configuring automatic Prisma generation hooks. Connect your repository to Vercel and populate the Environment Variables in the project settings:
* `DATABASE_URL`
* `NEXTAUTH_SECRET`
* `NEXTAUTH_URL` (e.g., `https://your-domain.vercel.app`)
* `GEMINI_API_KEY`

### GitHub Actions Pipeline
The pipeline file `.github/workflows/deploy.yml` triggers on pushes to the `main` or `master` branch. It executes:
1. TypeScript compilation checks (`tsc --noEmit`).
2. ESLint code validation checks (`npm run lint`).
3. Next.js building verification.
4. Automatic deployment to Vercel using secret deployment tokens.

---

## License
Distributed under the MIT License. See `LICENSE` for more details.

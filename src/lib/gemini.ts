import { GoogleGenAI } from '@google/genai';

const geminiApiKey = process.env.GEMINI_API_KEY;
const groqApiKey = process.env.GROQ_API_KEY;

const hasGroq = !!groqApiKey;

// Initialize the Gemini client safely if key is present
const getGeminiClient = () => {
  if (!geminiApiKey) {
    if (!hasGroq) {
      console.warn("Neither GEMINI_API_KEY nor GROQ_API_KEY is set in environment variables. AI features will fallback to mock data.");
    }
    return null;
  }
  return new GoogleGenAI({ apiKey: geminiApiKey });
};

export interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  headline: string;
  skills: string[];
  experience: Array<{
    company: string;
    role: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    year: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
  certifications: string[];
}

export interface MatchAnalysis {
  score: number;
  skillsMatched: string[];
  missingSkills: string[];
  experienceFit: string;
  educationFit: string;
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  summary: string;
  interviewQuestions: string[];
  resumeRewriteSuggestions: string[];
  skillGapAnalysis: string;
  careerRecommendation: string;
  recruiterNotes: string;
}

export async function parseResume(resumeText: string): Promise<ParsedResume> {
  // If GROQ is available, use GROQ API with Llama 3
  if (hasGroq) {
    try {
      console.log("Routing resume parsing to Groq API...");
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are an expert AI Resume Parser. Read the following resume text and extract the details into a structured JSON format matching the schema requested. ONLY return valid JSON. Do not explain anything. Do not wrap in markdown blocks like ```json.'
            },
            {
              role: 'user',
              content: `Schema:
{
  "name": "string (Candidate Full Name)",
  "email": "string (Email Address)",
  "phone": "string (Phone Number)",
  "headline": "string (Professional headline / summary)",
  "skills": ["string (Technical/soft skills list)"],
  "experience": [
    {
      "company": "string",
      "role": "string",
      "duration": "string",
      "description": "string"
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "year": "string"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"]
    }
  ],
  "certifications": ["string"]
}

Resume Text:
${resumeText}`
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API status ${response.status}`);
      }

      const data = await response.json();
      const text = data.choices[0].message.content?.trim() || '{}';
      return JSON.parse(text) as ParsedResume;
    } catch (error) {
      console.error("Groq Parse Resume Error, falling back to mock:", error);
      return getMockParsedResume();
    }
  }

  // Gemini Fallback
  const ai = getGeminiClient();
  if (!ai) {
    return getMockParsedResume();
  }

  try {
    const prompt = `
You are an expert AI Resume Parser. Read the following resume text and extract the details into a structured JSON format.
Only return valid JSON matching the schema below. Do not explain anything. Do not wrap in markdown blocks like \`\`\`json.

Schema:
{
  "name": "string (Candidate Full Name)",
  "email": "string (Email Address)",
  "phone": "string (Phone Number)",
  "headline": "string (Professional headline / summary)",
  "skills": ["string (Technical/soft skills list)"],
  "experience": [
    {
      "company": "string",
      "role": "string",
      "duration": "string",
      "description": "string"
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "year": "string"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"]
    }
  ],
  "certifications": ["string"]
}

Resume Text:
${resumeText}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text?.trim() || '{}';
    return JSON.parse(text) as ParsedResume;
  } catch (error) {
    console.error("Gemini Parse Resume Error:", error);
    return getMockParsedResume();
  }
}

export async function matchResumeAndJob(resumeText: string, jobDescription: string): Promise<MatchAnalysis> {
  // If GROQ is available, use GROQ API with Llama 3
  if (hasGroq) {
    try {
      console.log("Routing resume match evaluation to Groq API...");
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are a Senior Technical Recruiter and AI ATS screener. Compare the Candidate\'s Resume against the Job Description and perform an match evaluation. ONLY return valid JSON matching the schema. Do not explain anything. Do not wrap in markdown blocks.'
            },
            {
              role: 'user',
              content: `Schema:
{
  "score": "integer (0-100 overall score)",
  "skillsMatched": ["string (matching skills)"],
  "missingSkills": ["string (required missing skills)"],
  "experienceFit": "string (evaluation of experience)",
  "educationFit": "string (evaluation of academic qualifications)",
  "atsScore": "integer (0-100 ATS compatibility score)",
  "strengths": ["string (strengths list)"],
  "weaknesses": ["string (gaps list)"],
  "recommendation": "string (STRONG_BUY, BUY, SHORTLIST, REJECT)",
  "summary": "string (2-sentence overview)",
  "interviewQuestions": ["string (3-5 situational/technical interview questions)"],
  "resumeRewriteSuggestions": ["string (2-3 concrete tips)"],
  "skillGapAnalysis": "string (missing skills evaluation)",
  "careerRecommendation": "string (career trajectory match description)",
  "recruiterNotes": "string (notes summary for recruiter)"
}

Job Description:
${jobDescription}

Candidate Resume Text:
${resumeText}`
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API status ${response.status}`);
      }

      const data = await response.json();
      const text = data.choices[0].message.content?.trim() || '{}';
      const parsed = JSON.parse(text);
      
      return {
        score: Number(parsed.score ?? 0),
        skillsMatched: parsed.skillsMatched ?? [],
        missingSkills: parsed.missingSkills ?? [],
        experienceFit: parsed.experienceFit ?? '',
        educationFit: parsed.educationFit ?? '',
        atsScore: Number(parsed.atsScore ?? 0),
        strengths: parsed.strengths ?? [],
        weaknesses: parsed.weaknesses ?? [],
        recommendation: parsed.recommendation ?? 'SHORTLIST',
        summary: parsed.summary ?? '',
        interviewQuestions: parsed.interviewQuestions ?? parsed.questions ?? [],
        resumeRewriteSuggestions: parsed.resumeRewriteSuggestions ?? parsed.suggestions ?? [],
        skillGapAnalysis: parsed.skillGapAnalysis ?? '',
        careerRecommendation: parsed.careerRecommendation ?? '',
        recruiterNotes: parsed.recruiterNotes ?? ''
      };
    } catch (error) {
      console.error("Groq Match Analysis Error, falling back to mock:", error);
      return getMockMatchAnalysis();
    }
  }

  // Gemini Fallback
  const ai = getGeminiClient();
  if (!ai) {
    return getMockMatchAnalysis();
  }

  try {
    const prompt = `
You are a Senior Technical Recruiter and AI ATS screener. Compare the Candidate's Resume against the Job Description and perform an in-depth match analysis.
Only return valid JSON matching the schema below. Do not explain anything. Do not wrap in markdown blocks.

Schema:
{
  "score": "integer (0-100 overall score based on 40% Skills, 30% Experience, 15% Education, 10% Projects, 5% Certifications)",
  "skillsMatched": ["string (skills found in both resume and job description)"],
  "missingSkills": ["string (required skills from job description that are NOT in candidate resume)"],
  "experienceFit": "string (evaluation of candidate's career experience level relative to requirements)",
  "educationFit": "string (evaluation of academic qualifications vs requirements)",
  "atsScore": "integer (0-100 ATS compatibility score based on keyword densities, layout structure, contact info and sections)",
  "strengths": ["string (key advantages of hiring this candidate)"],
  "weaknesses": ["string (gaps, red flags, or short tenures)"],
  "recommendation": "string (e.g. STRONG_BUY, BUY, SHORTLIST, REJECT)",
  "summary": "string (short 2-sentence summary of the match for candidate reading)",
  "interviewQuestions": ["string (3-5 highly tailored, technical/situational questions to test their gaps during interview)"],
  "resumeRewriteSuggestions": ["string (2-3 concrete tips on how to improve this resume for this job)"],
  "skillGapAnalysis": "string (assessment of missing skills and advice on which to acquire next)",
  "careerRecommendation": "string (how this position fits into their long term career path)",
  "recruiterNotes": "string (internal summary for recruiters outlining why this candidate should or should not be interviewed)"
}

Job Description:
${jobDescription}

Candidate Resume Text:
${resumeText}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text?.trim() || '{}';
    return JSON.parse(text) as MatchAnalysis;
  } catch (error) {
    console.error("Gemini Match Analysis Error:", error);
    return getMockMatchAnalysis();
  }
}

function getMockParsedResume(): ParsedResume {
  return {
    name: "Alex Mercer",
    email: "alex.mercer@example.com",
    phone: "+1 (555) 019-2834",
    headline: "Senior Full Stack Engineer with 6+ years experience building cloud-native SaaS systems.",
    skills: ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Tailwind CSS", "Docker", "AWS", "REST APIs", "GraphQL"],
    experience: [
      {
        company: "TechNexus Corp",
        role: "Senior Frontend Engineer",
        duration: "2023 - Present",
        description: "Led redesign of core SaaS analytics dashboard using Next.js, boosting user engagement by 40%. Implemented responsive CSS layouts and optimized page load times by 1.2s."
      },
      {
        company: "DevFlow Studio",
        role: "Full Stack Developer",
        duration: "2020 - 2023",
        description: "Maintained RESTful backend microservices in Node.js and PostgreSQL. Created interactive UI flows with React and Tailwind CSS."
      }
    ],
    education: [
      {
        institution: "State University of Computer Science",
        degree: "Bachelor of Science in Software Engineering",
        year: "2020"
      }
    ],
    projects: [
      {
        name: "CloudRank Analytics",
        description: "Open-source developer analytics tool with Real-time Postgres hooks.",
        technologies: ["Next.js", "PostgreSQL", "Tailwind CSS"]
      }
    ],
    certifications: ["AWS Certified Solutions Architect - Associate", "Certified ScrumMaster"]
  };
}

function getMockMatchAnalysis(): MatchAnalysis {
  return {
    score: 82,
    skillsMatched: ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Tailwind CSS", "REST APIs"],
    missingSkills: ["Prisma", "NextAuth.js", "Recharts", "Framer Motion"],
    experienceFit: "Highly qualified. The candidate has 6+ years of full stack experience, matching the senior scope required for this role.",
    educationFit: "Strong fit. Candidate holds a Bachelor's in Software Engineering, exceeding the baseline technical requirement.",
    atsScore: 78,
    strengths: [
      "Extensive experience with the core React/Next.js and Node.js backend stack",
      "Proven track record of optimizing page speeds and engineering dashboard interfaces",
      "Strong cloud infrastructure familiarity with AWS Associate certification"
    ],
    weaknesses: [
      "No listed experience using Prisma ORM or NextAuth.js libraries",
      "Relatively short tenure (under 2 years) in their current position"
    ],
    recommendation: "SHORTLIST",
    summary: "Alex is a strong candidate with deep competence in React, Next.js, and Node.js. Although they lack direct experience with Prisma and NextAuth, their general full-stack skills make them a highly viable candidate.",
    interviewQuestions: [
      "How would you optimize database query performance in a Next.js API route that fetches millions of rows?",
      "Can you explain your experience implementing auth middleware in Next.js using JWTs?",
      "Describe a time you had to optimize core web vitals of a React single page application. What specific tools and techniques did you use?"
    ],
    resumeRewriteSuggestions: [
      "Incorporate mentions of ORM frameworks or authentication setups you have built to show proficiency in topics similar to Prisma/NextAuth.",
      "Add metrics detailing server-side performance improvements or database transaction optimizations."
    ],
    skillGapAnalysis: "The candidate has excellent fundamentals but needs to get up to speed with modern Next.js ORMs like Prisma and client-side visualization libraries like Recharts.",
    careerRecommendation: "This Senior Developer role is a direct career match that offers them the chance to own architecture and lead junior members, aligning with staff track aspirations.",
    recruiterNotes: "Alex Mercer has deep engineering roots in standard React/Node. High recommend for initial phone screen. Focus the interview on testing their knowledge of database schemas, caching layers, and middleware configurations."
  };
}

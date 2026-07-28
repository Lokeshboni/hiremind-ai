import path from 'path';
import fs from 'fs';

/**
 * Returns the correct upload directory for resumes.
 * Falls back to /tmp/uploads/resumes in serverless environments (e.g. Vercel, AWS Lambda)
 * to avoid read-only filesystem errors.
 */
export function getUploadDir(): string {
  const isServerless = !!(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NETLIFY ||
    process.env.LAMBDA_TASK_ROOT
  );

  if (isServerless) {
    return path.join('/tmp', 'uploads', 'resumes');
  }

  return path.join(process.cwd(), 'public', 'uploads', 'resumes');
}

/**
 * Attempts to locate the absolute path of an uploaded resume based on its URL.
 * Checks both the temporary serverless location and the public static folder.
 */
export function getResumeFilePath(resumeUrl: string): string | null {
  if (!resumeUrl) return null;
  
  const filename = path.basename(resumeUrl);

  // 1. Check in /tmp/uploads/resumes (serverless upload location)
  const tempPath = path.join('/tmp', 'uploads', 'resumes', filename);
  if (fs.existsSync(tempPath)) {
    return tempPath;
  }

  // 2. Check in public/uploads/resumes (local dev or seeded files)
  const publicPath = path.join(process.cwd(), 'public', 'uploads', 'resumes', filename);
  if (fs.existsSync(publicPath)) {
    return publicPath;
  }

  return null;
}

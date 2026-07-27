'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Brain, ArrowLeft, Loader2, Send, Save, Briefcase, Plus, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

const jobSchema = z.object({
  title: z.string().min(2, 'Job Title must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  requirementsStr: z.string().min(10, 'Requirements details are required'),
  skillsStr: z.string().min(2, 'At least one skill is required'),
  experience: z.string().min(1, 'Minimum Experience is required'),
  location: z.string().min(2, 'Location is required'),
  salary: z.string().min(2, 'Salary is required'),
  employmentType: z.enum(['Full-time', 'Part-time', 'Contract', 'Internship']),
  workplaceType: z.enum(['Onsite', 'Hybrid', 'Remote']),
});

type JobFormValues = z.infer<typeof jobSchema>;

export default function CreateJobPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [publishing, setPublishing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      employmentType: 'Full-time',
      workplaceType: 'Onsite'
    }
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'RECRUITER' && session?.user?.role !== 'ADMIN') {
      toast.error('Only Recruiters are permitted to publish job postings.');
      router.push('/');
    }
  }, [status]);

  const onSubmit = async (data: JobFormValues) => {
    setPublishing(true);

    const parsedRequirements = data.requirementsStr
      .split('\n')
      .map(r => r.trim())
      .filter(r => r.length > 0);

    const parsedSkills = data.skillsStr
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const payload = {
      title: data.title,
      description: data.description,
      requirements: parsedRequirements,
      skills: parsedSkills,
      experience: data.experience,
      location: data.location,
      salary: data.salary,
      employmentType: data.employmentType,
      workplaceType: data.workplaceType,
    };

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (res.ok) {
        toast.success('Job vacancy published successfully!');
        router.push('/dashboard/recruiter');
      } else {
        toast.error(resData.message || 'Failed to create job.');
      }
    } catch (err) {
      toast.error('A network error occurred. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link 
          href="/dashboard/recruiter"
          className="inline-flex items-center space-x-2 text-neutral-400 hover:text-white transition-colors mb-6 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="glass-card p-8 rounded-2xl border border-white/5 shadow-xl">
          <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-white/5">
            <div className="bg-purple-950/40 p-2.5 rounded-lg border border-purple-500/30 text-purple-400">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Publish a Job Vacancy</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Define your position details. AI will match candidates automatically.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Staff React Developer"
                  {...register('title')}
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg py-2.5 px-3.5 text-sm text-neutral-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all"
                />
                {errors.title && (
                  <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Job Description</label>
                <textarea
                  rows={4}
                  placeholder="Describe the overall scope of the role, team dynamics, and technical goals..."
                  {...register('description')}
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg py-2.5 px-3.5 text-sm text-neutral-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all"
                />
                {errors.description && (
                  <p className="text-xs text-red-400 mt-1">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Employment Type</label>
                <select
                  {...register('employmentType')}
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg py-2.5 px-3 text-sm text-neutral-200 focus:outline-none focus:border-purple-500 transition-all"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Workplace Setting</label>
                <select
                  {...register('workplaceType')}
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg py-2.5 px-3 text-sm text-neutral-200 focus:outline-none focus:border-purple-500 transition-all"
                >
                  <option value="Onsite">Onsite</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Location</label>
                <input
                  type="text"
                  placeholder="e.g. San Francisco, CA or Remote"
                  {...register('location')}
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg py-2.5 px-3.5 text-sm text-neutral-200 focus:outline-none focus:border-purple-500 transition-all"
                />
                {errors.location && (
                  <p className="text-xs text-red-400 mt-1">{errors.location.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Experience Required</label>
                <input
                  type="text"
                  placeholder="e.g. 3-5 Years or 5+ Years"
                  {...register('experience')}
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg py-2.5 px-3.5 text-sm text-neutral-200 focus:outline-none focus:border-purple-500 transition-all"
                />
                {errors.experience && (
                  <p className="text-xs text-red-400 mt-1">{errors.experience.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Salary Package range</label>
                <input
                  type="text"
                  placeholder="e.g. $130,000 - $160,000"
                  {...register('salary')}
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg py-2.5 px-3.5 text-sm text-neutral-200 focus:outline-none focus:border-purple-500 transition-all"
                />
                {errors.salary && (
                  <p className="text-xs text-red-400 mt-1">{errors.salary.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Target Skills (comma separated)</label>
                <input
                  type="text"
                  placeholder="NextJS, TypeScript, Tailwind, Prisma, Postgres"
                  {...register('skillsStr')}
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg py-2.5 px-3.5 text-sm text-neutral-200 focus:outline-none focus:border-purple-500 transition-all"
                />
                {errors.skillsStr && (
                  <p className="text-xs text-red-400 mt-1">{errors.skillsStr.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Key Requirements & Responsibilities (one per line)</label>
                <textarea
                  rows={4}
                  placeholder="Own architecture and components development
Collaborate with designers to deliver glassmorphism visuals
Integrate backend NextAuth modules securely"
                  {...register('requirementsStr')}
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg py-2.5 px-3.5 text-sm text-neutral-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all"
                />
                {errors.requirementsStr && (
                  <p className="text-xs text-red-400 mt-1">{errors.requirementsStr.message}</p>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex justify-end">
              <button
                type="submit"
                disabled={publishing}
                className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md hover:shadow-purple-600/20 transition-all flex items-center cursor-pointer disabled:opacity-50"
              >
                {publishing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    <span>Publish Vacancy</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Brain, User, Briefcase, Lock, Mail, Loader2, ArrowRight, Building } from 'lucide-react';
import Navbar from '@/components/Navbar';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['CANDIDATE', 'RECRUITER']),
  companyName: z.string().optional(),
}).refine(data => {
  if (data.role === 'RECRUITER' && !data.companyName) {
    return false;
  }
  return true;
}, {
  message: "Company Name is required for Recruiters",
  path: ["companyName"]
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<'CANDIDATE' | 'RECRUITER'>('CANDIDATE');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'CANDIDATE',
    }
  });

  const handleRoleChange = (role: 'CANDIDATE' | 'RECRUITER') => {
    setActiveRole(role);
    setValue('role', role);
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (!response.ok) {
        toast.error(resData.message || 'Registration failed. Please try again.');
        setLoading(false);
      } else {
        toast.success('Account created successfully! Please sign in.');
        router.push('/auth/login');
      }
    } catch (err) {
      toast.error('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Glowing background highlights */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-600/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <div className="glass-card p-8 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.37)]">
            <div className="text-center mb-6">
              <Link href="/" className="inline-flex items-center space-x-2 text-white font-bold text-xl group mb-4">
                <Brain className="h-6 w-6 text-purple-400" />
                <span>HireMind<span className="text-purple-400 font-extrabold">.AI</span></span>
              </Link>
              <h2 className="text-2xl font-bold text-white tracking-tight">Create Account</h2>
              <p className="text-neutral-400 text-sm mt-1">Get started with automated AI resume parsing</p>
            </div>

            {/* Role Switcher tabs */}
            <div className="grid grid-cols-2 p-1 bg-neutral-900 rounded-lg mb-6 border border-white/5">
              <button
                type="button"
                onClick={() => handleRoleChange('CANDIDATE')}
                className={`py-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                  activeRole === 'CANDIDATE'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <User className="h-4 w-4" />
                <span>Candidate</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('RECRUITER')}
                className={`py-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                  activeRole === 'RECRUITER'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Briefcase className="h-4 w-4" />
                <span>Recruiter</span>
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <input type="hidden" {...register('role')} />

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-4.5 w-4.5 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Alex Mercer"
                    {...register('name')}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all"
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4.5 w-4.5 text-neutral-500" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    {...register('email')}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
                )}
              </div>

              {activeRole === 'RECRUITER' && (
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Company Name</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3.5 h-4.5 w-4.5 text-neutral-500" />
                    <input
                      type="text"
                      placeholder="Acme Corporation"
                      {...register('companyName')}
                      className="w-full bg-neutral-900 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all"
                    />
                  </div>
                  {errors.companyName && (
                    <p className="text-xs text-red-400 mt-1">{errors.companyName.message}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4.5 w-4.5 text-neutral-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...register('password')}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all"
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 text-center text-sm">
              <span className="text-neutral-400">Already have an account?</span>{' '}
              <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 font-medium">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

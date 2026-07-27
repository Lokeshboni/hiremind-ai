'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Brain, Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';

export const dynamic = 'force-dynamic';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const errorParam = searchParams.get('error');

  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
        setLoading(false);
      } else {
        toast.success('Logged in successfully!');
        
        // Fetch current session to determine route
        const sessionRes = await fetch('/api/auth/session');
        const session = await sessionRes.json();
        
        if (session?.user?.role === 'ADMIN') {
          router.push('/admin');
        } else if (session?.user?.role === 'RECRUITER') {
          router.push('/dashboard/recruiter');
        } else {
          router.push('/dashboard/candidate');
        }
        router.refresh();
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
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center space-x-2 text-white font-bold text-xl group mb-4">
                <Brain className="h-6 w-6 text-purple-400" />
                <span>HireMind<span className="text-purple-400 font-extrabold">.AI</span></span>
              </Link>
              <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
              <p className="text-neutral-400 text-sm mt-1">Sign in to your candidate or recruiter account</p>
            </div>

            {errorParam && (
              <div className="bg-red-950/40 border border-red-800/40 rounded-lg p-3 text-xs text-red-300 text-center mb-6">
                Authentication failed: Invalid credentials or session expired.
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4.5 w-4.5 text-neutral-500" />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    {...register('email')}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">Password</label>
                  <a href="#" className="text-xs text-purple-400 hover:text-purple-300">Forgot?</a>
                </div>
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
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 text-center text-sm">
              <span className="text-neutral-400">New to HireMind?</span>{' '}
              <Link href="/auth/register" className="text-purple-400 hover:text-purple-300 font-medium">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

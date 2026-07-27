'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Brain, User, LogOut, LayoutDashboard, Briefcase } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const getDashboardLink = () => {
    if (!session?.user) return '/';
    if (session.user.role === 'ADMIN') return '/admin';
    if (session.user.role === 'RECRUITER') return '/dashboard/recruiter';
    return '/dashboard/candidate';
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/5 bg-neutral-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 text-white font-bold text-xl group">
              <div className="bg-purple-600/20 p-2 rounded-lg border border-purple-500/30 group-hover:border-purple-500 group-hover:bg-purple-600/30 transition-all duration-300">
                <Brain className="h-6 w-6 text-purple-400 group-hover:scale-110 transition-transform" />
              </div>
              <span className="bg-gradient-to-r from-white via-neutral-100 to-purple-400 bg-clip-text text-transparent tracking-tight">
                HireMind<span className="text-purple-400 font-extrabold font-mono">.AI</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/jobs" className="text-neutral-300 hover:text-white transition-colors flex items-center space-x-1">
              <Briefcase className="h-4 w-4" />
              <span>Explore Jobs</span>
            </Link>
            <a href="#features" className="text-neutral-400 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-neutral-400 hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="text-neutral-400 hover:text-white transition-colors">FAQ</a>
          </div>

          {/* Actions / Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <>
                <Link
                  href={getDashboardLink()}
                  className="flex items-center space-x-2 px-4 h-10 rounded-lg text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center space-x-2 px-4 h-10 rounded-lg text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/30 border border-red-900/30 hover:border-red-900/50 transition-all duration-300 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-neutral-300 hover:text-white px-4 h-10 flex items-center transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-5 h-10 flex items-center justify-center rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.4)] hover:shadow-[0_0_20px_rgba(147,51,234,0.6)] border border-purple-500/20 transition-all duration-300 hover:-translate-y-[1px]"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-neutral-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${menuOpen ? 'hidden' : 'block'} h-6 w-6`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
              <svg
                className={`${menuOpen ? 'block' : 'hidden'} h-6 w-6`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`${menuOpen ? 'block' : 'hidden'} md:hidden border-b border-white/5 bg-neutral-950/95`}>
        <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
          <Link href="/jobs" className="block px-3 py-2 rounded-md text-base font-medium text-neutral-300 hover:text-white hover:bg-white/5">
            Explore Jobs
          </Link>
          <a href="#features" className="block px-3 py-2 rounded-md text-base font-medium text-neutral-400 hover:text-white hover:bg-white/5">
            Features
          </a>
          <a href="#pricing" className="block px-3 py-2 rounded-md text-base font-medium text-neutral-400 hover:text-white hover:bg-white/5">
            Pricing
          </a>
          <a href="#faq" className="block px-3 py-2 rounded-md text-base font-medium text-neutral-400 hover:text-white hover:bg-white/5">
            FAQ
          </a>
          <div className="border-t border-white/5 pt-4 pb-2 mt-4">
            {session ? (
              <div className="flex flex-col space-y-2 px-3">
                <Link
                  href={getDashboardLink()}
                  className="w-full flex items-center justify-center space-x-2 py-2 rounded-md text-base font-medium text-neutral-300 bg-white/5 border border-white/10 hover:bg-white/10"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full flex items-center justify-center space-x-2 py-2 rounded-md text-base font-medium text-red-400 bg-red-950/20 border border-red-900/30 hover:bg-red-950/30"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 px-3">
                <Link
                  href="/auth/login"
                  className="w-full text-center py-2 rounded-md text-base font-medium text-neutral-300 hover:text-white hover:bg-white/5"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="w-full text-center py-2 rounded-md text-base font-medium bg-purple-600 text-white hover:bg-purple-500"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { 
  Loader2, 
  ArrowLeft,
  Sparkles,
  CheckCircle,
  XCircle,
  HelpCircle,
  TrendingUp,
  MapPin,
  Building,
  Mail,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';

interface ApplicationDetail {
  id: string;
  matchScore: number;
  status: string;
  createdAt: string;
  candidate: {
    skills: string[];
    location: string;
    headline: string;
    user: {
      name: string;
      email: string;
    };
  };
  job: {
    title: string;
    company: {
      name: string;
    };
  };
  analysis: {
    score: number;
    atsScore: number;
    strengths: string[];
    weaknesses: string[];
    missingSkills: string[];
    recommendation: string;
    questions: string[];
  };
}

export default function ApplicationDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const appId = params.id as string;

  const [app, setApp] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchApplicationDetail = async () => {
    try {
      const res = await fetch(`/api/apply?id=${appId}`);
      if (res.ok) {
        const data = await res.json();
        setApp(data.application);
      } else {
        toast.error('Failed to load application screening details.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not connect to service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchApplicationDetail();
    }
  }, [status, appId]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!app) return;
    setUpdating(true);

    try {
      const res = await fetch(`/api/apply`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: app.id, status: newStatus }),
      });

      if (res.ok) {
        toast.success(`Candidate state updated to ${newStatus}`);
        setApp(prev => prev ? { ...prev, status: newStatus } : null);
      } else {
        toast.error('Failed to update applicant state.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network failure.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-4" />
        <span className="text-xs text-neutral-500">Retrieving evaluation record...</span>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <h2 className="text-xl font-bold text-white">Record Not Found</h2>
          <p className="text-xs text-neutral-500 mt-2">The application could not be found or you do not have permission to view it.</p>
          <Link href="/dashboard/recruiter" className="text-purple-400 hover:text-purple-300 mt-4 text-sm font-semibold">
            &larr; Back to Recruiter Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20';
    if (score >= 60) return 'text-yellow-400 border-yellow-500/30 bg-yellow-950/20';
    return 'text-red-400 border-red-500/30 bg-red-950/20';
  };

  const getBackLink = () => {
    return session?.user?.role === 'RECRUITER' ? '/dashboard/recruiter' : '/dashboard/candidate';
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link 
          href={getBackLink()}
          className="inline-flex items-center space-x-2 text-neutral-400 hover:text-white transition-colors mb-6 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Control Dashboard</span>
        </Link>

        {/* Candidate Detail Card */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="text-[10px] bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded border border-purple-800/20 font-bold uppercase tracking-wider flex items-center w-fit mb-2">
              <Sparkles className="h-3.5 w-3.5 mr-1" /> AI Screening Profile
            </span>
            <h2 className="text-xl font-bold text-white">{app.candidate.user.name}</h2>
            <p className="text-xs text-neutral-400 mt-1">applied for {app.job.title} • {app.candidate.location}</p>
            <div className="flex items-center space-x-4 text-xs text-neutral-500 mt-3">
              <span className="flex items-center"><Mail className="h-3.5 w-3.5 mr-1" /> {app.candidate.user.email}</span>
              <span>Submitted {new Date(app.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className={`px-4 py-2 rounded-full border text-xs font-bold ${getScoreColor(app.matchScore)}`}>
              {app.matchScore}% Overall Fit
            </div>
            <div className="bg-neutral-900 border border-white/5 px-3 py-2 rounded-lg text-xs">
              <span className="text-neutral-500 block uppercase text-[9px] tracking-wider font-bold">Recommendation</span>
              <span className="text-white font-bold">{app.analysis.recommendation}</span>
            </div>
          </div>
        </div>

        {/* Detailed Evaluation Panels */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-center items-center text-center">
              <div className="w-20 h-20 rounded-full border-4 border-purple-500/20 flex items-center justify-center font-black text-xl text-purple-400 mb-3">
                {app.matchScore}%
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Semantic Fit Score</h4>
              <p className="text-[10px] text-neutral-500 mt-1 max-w-xs">Weighted analysis of technical stack match, project history, and experience scope.</p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-center items-center text-center">
              <div className="w-20 h-20 rounded-full border-4 border-cyan-500/20 flex items-center justify-center font-black text-xl text-cyan-400 mb-3">
                {app.analysis.atsScore}%
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">ATS Score</h4>
              <p className="text-[10px] text-neutral-500 mt-1 max-w-xs">Keyword alignment, parsing density, contact integrity, and layout consistency.</p>
            </div>
          </div>

          {/* Skills Grid */}
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-6">Semantic Skillsets Comparison</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-neutral-950/40 p-5 rounded-xl border border-white/5">
              <div>
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">Skills Matched</h4>
                <div className="flex flex-wrap gap-2">
                  {app.candidate.skills.map((s, idx) => (
                    <span key={idx} className="text-xs bg-emerald-950/20 text-emerald-400 border border-emerald-900/30 px-2.5 py-1 rounded-lg">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3">Missing required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {app.analysis.missingSkills.length > 0 ? (
                    app.analysis.missingSkills.map((s, idx) => (
                      <span key={idx} className="text-xs bg-red-950/20 text-red-400 border border-red-900/30 px-2.5 py-1 rounded-lg">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-neutral-500 italic">No missing skills flagged.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card p-6 rounded-2xl border border-white/5">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4">AI Pinpointed Strengths</h3>
              <ul className="space-y-3">
                {app.analysis.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start text-xs text-neutral-300">
                    <span className="text-emerald-400 mr-2 shrink-0">•</span>
                    <span className="leading-relaxed">{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/5">
              <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-4">Gaps & Risk Flags</h3>
              <ul className="space-y-3">
                {app.analysis.weaknesses.map((w, idx) => (
                  <li key={idx} className="flex items-start text-xs text-neutral-300">
                    <span className="text-red-400 mr-2 shrink-0">•</span>
                    <span className="leading-relaxed">{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Questions */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 bg-purple-950/5">
            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-4 flex items-center">
              <HelpCircle className="h-4 w-4 mr-1.5" /> AI Interview Prep Questions
            </h3>
            <ul className="space-y-3">
              {app.analysis.questions.map((q, idx) => (
                <li key={idx} className="p-3 bg-neutral-900/50 rounded-lg border border-white/5 text-xs text-neutral-300">
                  <strong>Question {idx+1}:</strong> {q}
                </li>
              ))}
            </ul>
          </div>

          {/* Recruiter Action Buttons */}
          {session?.user?.role === 'RECRUITER' && (
            <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
              <span className="text-xs text-neutral-500">Currently marked as <strong className="text-white uppercase font-mono">{app.status}</strong></span>
              
              <div className="flex space-x-4 w-full sm:w-auto">
                <button
                  onClick={() => handleUpdateStatus('REJECTED')}
                  disabled={updating || app.status === 'REJECTED'}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 text-red-400 text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Reject Application</span>
                </button>
                <button
                  onClick={() => handleUpdateStatus('SHORTLISTED')}
                  disabled={updating || app.status === 'SHORTLISTED'}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 shadow-md"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Shortlist Candidate</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

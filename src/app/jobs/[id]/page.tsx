'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { 
  Building, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  GraduationCap,
  Calendar,
  ArrowLeft,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  Search,
  Info
} from 'lucide-react';
import Link from 'next/link';

interface JobDetails {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  skills: string[];
  experience: string;
  location: string;
  salary: string;
  employmentType: string;
  workplaceType: string;
  createdAt: string;
  company: {
    name: string;
    website: string;
    logo: string;
    industry: string;
    description: string;
  };
}

export default function JobDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applyStep, setApplyStep] = useState<string>(''); // parsing, matching, complete
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hasExistingResume, setHasExistingResume] = useState(false);
  const [useExisting, setUseExisting] = useState(false);

  // Fetch job details and check candidate's profile
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const jobRes = await fetch(`/api/jobs`);
        if (jobRes.ok) {
          const jobData = await jobRes.json();
          const target = jobData.jobs?.find((j: any) => j.id === jobId);
          if (target) {
            setJob(target);
          } else {
            toast.error('Job listing not found.');
          }
        }

        // If candidate logged in, check if they have a resume already
        if (session?.user?.role === 'CANDIDATE') {
          const profileRes = await fetch('/api/profile');
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            if (profileData.profile?.resumeUrl) {
              setHasExistingResume(true);
              setUseExisting(true);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchDetails();
    }
  }, [jobId, session]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB limit.');
        return;
      }
      setSelectedFile(file);
      setUseExisting(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!useExisting && !selectedFile) {
      toast.error('Please upload a resume file or select your existing resume.');
      return;
    }

    setApplying(true);
    setApplyStep('extracting'); // Step 1: Extract text
    
    // Simulate multi-phase extraction loading details for rich user feel
    setTimeout(() => {
      setApplyStep('matching'); // Step 2: Compare weights and skills gaps
    }, 1500);

    const formData = new FormData();
    formData.append('jobId', jobId);
    if (!useExisting && selectedFile) {
      formData.append('file', selectedFile);
    }

    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setApplyStep('complete');
        setTimeout(() => {
          toast.success(`Applied successfully! AI Fit Match Score: ${data.score}%`);
          router.push('/dashboard/candidate');
        }, 1000);
      } else {
        toast.error(data.message || 'Application failed.');
        setApplying(false);
      }
    } catch (err) {
      console.error(err);
      toast.error('A network error occurred.');
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
          <h2 className="text-xl font-bold text-white">Job Not Found</h2>
          <Link href="/jobs" className="text-purple-400 hover:text-purple-300 mt-4 text-sm font-semibold">
            &larr; Back to Job Board
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link 
          href="/jobs"
          className="inline-flex items-center space-x-2 text-neutral-400 hover:text-white transition-colors mb-6 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Job Listings</span>
        </Link>

        {/* Detailed Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Job parameters */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-6 sm:p-8 rounded-2xl border border-white/5 shadow-lg">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-[10px] bg-purple-950/40 text-purple-300 border border-purple-800/30 px-2.5 py-0.5 rounded font-bold uppercase">
                  {job.workplaceType}
                </span>
                <span className="text-[10px] bg-neutral-900 text-neutral-400 px-2 py-0.5 rounded">
                  {job.employmentType}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">{job.title}</h1>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/5 text-xs text-neutral-400">
                <div className="flex flex-col">
                  <span className="text-neutral-500 uppercase font-bold tracking-wider text-[9px]">Salary Range</span>
                  <span className="text-white font-semibold mt-1 flex items-center"><DollarSign className="h-3.5 w-3.5 mr-0.5" /> {job.salary}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-neutral-500 uppercase font-bold tracking-wider text-[9px]">Location</span>
                  <span className="text-white font-semibold mt-1 flex items-center"><MapPin className="h-3.5 w-3.5 mr-0.5" /> {job.location}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-neutral-500 uppercase font-bold tracking-wider text-[9px]">Experience</span>
                  <span className="text-white font-semibold mt-1 flex items-center"><Briefcase className="h-3.5 w-3.5 mr-0.5" /> {job.experience}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-neutral-500 uppercase font-bold tracking-wider text-[9px]">Published</span>
                  <span className="text-white font-semibold mt-1 flex items-center"><Calendar className="h-3.5 w-3.5 mr-0.5" /> {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="glass-card p-6 sm:p-8 rounded-2xl border border-white/5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Job Description</h3>
              <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">{job.description}</p>
            </div>

            {/* Requirements */}
            <div className="glass-card p-6 sm:p-8 rounded-2xl border border-white/5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Key Requirements & Responsibilities</h3>
              <ul className="space-y-3">
                {job.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start text-sm text-neutral-300">
                    <span className="text-purple-400 mr-2 shrink-0">•</span>
                    <span className="leading-relaxed">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Target Skills */}
            <div className="glass-card p-6 sm:p-8 rounded-2xl border border-white/5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Target Skillsets</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, idx) => (
                  <span key={idx} className="text-xs bg-neutral-900 text-purple-300 border border-purple-800/20 px-3 py-1 rounded-lg">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Company Info */}
            <div className="glass-card p-6 sm:p-8 rounded-2xl border border-white/5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">About {job.company.name}</h3>
              <p className="text-xs text-purple-400 font-semibold mb-3">{job.company.industry} • <a href={job.company.website} target="_blank" rel="noopener noreferrer" className="hover:underline">{job.company.website}</a></p>
              <p className="text-sm text-neutral-400 leading-relaxed">{job.company.description || 'No description listed.'}</p>
            </div>
          </div>

          {/* Right Column: Apply form panel */}
          <div className="space-y-8">
            <div className="glass-card p-6 rounded-2xl border border-white/5 sticky top-24">
              <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider flex items-center">
                <Sparkles className="h-4.5 w-4.5 text-purple-400 mr-1.5 animate-pulse-slow" />
                <span>Job Application Portal</span>
              </h3>

              {applying ? (
                /* AI Analysis Progress State */
                <div className="py-8 text-center flex flex-col items-center">
                  <Loader2 className="h-10 w-10 text-purple-500 animate-spin mb-4" />
                  
                  {applyStep === 'extracting' && (
                    <>
                      <h4 className="text-sm font-bold text-white">Parsing Resume text...</h4>
                      <p className="text-[10px] text-neutral-500 mt-2">Converting file buffers on secure server pipeline</p>
                    </>
                  )}
                  {applyStep === 'matching' && (
                    <>
                      <h4 className="text-sm font-bold text-white text-gradient">Matching against Job details...</h4>
                      <p className="text-[10px] text-neutral-500 mt-2">Gemini calculating skills alignments & suggestions</p>
                    </>
                  )}
                  {applyStep === 'complete' && (
                    <>
                      <CheckCircle className="h-10 w-10 text-emerald-400 mb-4 animate-bounce" />
                      <h4 className="text-sm font-bold text-white">Application Evaluated!</h4>
                    </>
                  )}
                </div>
              ) : status === 'unauthenticated' ? (
                /* Non-logged in state */
                <div className="text-center py-4">
                  <p className="text-xs text-neutral-400 mb-6">Create a candidate account or login to apply and receive immediate AI feedback scores.</p>
                  <Link 
                    href="/auth/register"
                    className="w-full h-11 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium text-xs flex items-center justify-center shadow-md transition-all cursor-pointer"
                  >
                    Register to Apply
                  </Link>
                </div>
              ) : session?.user?.role !== 'CANDIDATE' ? (
                /* Recruiter logged in state */
                <div className="text-center py-4 text-xs text-neutral-500">
                  <Info className="h-8 w-8 mx-auto text-neutral-600 mb-2" />
                  <p>You are logged in as a **Recruiter**. You can view listing details but cannot apply as a candidate.</p>
                </div>
              ) : (
                /* Candidate logged in: Apply form */
                <form onSubmit={handleApply} className="space-y-6">
                  {hasExistingResume && (
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="use-existing-box"
                          checked={useExisting}
                          onChange={e => setUseExisting(e.target.checked)}
                          className="h-4 w-4 rounded border-white/10 bg-neutral-900 text-purple-600 focus:ring-purple-500"
                        />
                        <label htmlFor="use-existing-box" className="ml-2.5 text-xs text-neutral-300 cursor-pointer select-none">
                          Use existing parsed resume
                        </label>
                      </div>
                      {useExisting && (
                        <div className="bg-neutral-900/60 p-3 rounded-lg border border-white/5 text-[10px] text-neutral-500 flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-purple-400 shrink-0" />
                          <span className="truncate">Active parsed resume from candidate profile</span>
                        </div>
                      )}
                    </div>
                  )}

                  {!useExisting && (
                    <div>
                      <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Upload Resume file</label>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden" 
                        accept=".pdf,.docx,.txt"
                      />
                      
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-neutral-900/40 hover:bg-neutral-900/80 border border-dashed border-white/10 hover:border-purple-500/30 rounded-xl py-6 px-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center"
                      >
                        <Upload className="h-5 w-5 text-neutral-500 mb-2" />
                        <span className="text-xs text-neutral-300 font-medium">
                          {selectedFile ? selectedFile.name : 'Choose PDF, DOCX, TXT'}
                        </span>
                        <span className="text-[9px] text-neutral-500 mt-1">Maximum file size: 5MB</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full h-11 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold text-xs flex items-center justify-center shadow-md transition-all cursor-pointer"
                  >
                    Submit Application
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

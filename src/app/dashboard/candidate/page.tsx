'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { 
  FileUp, 
  MapPin, 
  Linkedin, 
  Github, 
  Globe, 
  Briefcase, 
  GraduationCap, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
  BookOpen
} from 'lucide-react';

interface Application {
  id: string;
  job: {
    id: string;
    title: string;
    location: string;
    salary: string;
    employmentType: string;
    company: {
      name: string;
      logo: string;
    };
  };
  status: string;
  matchScore: number;
  summary: string;
  createdAt: string;
  analysis: {
    id: string;
    score: number;
    strengths: string[];
    weaknesses: string[];
    missingSkills: string[];
    recommendation: string;
    atsScore: number;
    questions: string[];
    jsonResponse: string; // contains suggestions, career advice, gap analyses
  } | null;
}

interface ProfileData {
  headline: string;
  location: string;
  skills: string[];
  linkedin: string;
  github: string;
  portfolio: string;
  experience: string; // JSON string
  education: string; // JSON string
  resumeUrl: string;
}

export default function CandidateDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'profile'>('overview');
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  
  // Selected Application for detailed Candidate AI report modal
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Edit form states
  const [headline, setHeadline] = useState('');
  const [location, setLocation] = useState('');
  const [skillsStr, setSkillsStr] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [experienceList, setExperienceList] = useState<any[]>([]);
  const [educationList, setEducationList] = useState<any[]>([]);

  // Fetch candidate profile data
  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          const prof = data.profile;
          setProfile(prof);
          
          setHeadline(prof.headline || '');
          setLocation(prof.location || '');
          setSkillsStr(prof.skills?.join(', ') || '');
          setLinkedin(prof.linkedin || '');
          setGithub(prof.github || '');
          setPortfolio(prof.portfolio || '');

          try {
            setExperienceList(prof.experience ? JSON.parse(prof.experience) : []);
          } catch {
            setExperienceList([]);
          }

          try {
            setEducationList(prof.education ? JSON.parse(prof.education) : []);
          } catch {
            setEducationList([]);
          }

          setApplications(prof.applications || []);
        }
      } else {
        toast.error('Failed to load profile details.');
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
      fetchProfile();
    }
  }, [status]);

  // Handle resume uploading & automatic text parsing
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File exceeds maximum size limit of 5MB.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Resume parsed and profile updated successfully!');
        fetchProfile(); // reload profile details
      } else {
        toast.error(data.message || 'Parsing failed.');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred during resume uploading.');
    } finally {
      setUploading(false);
    }
  };

  // Handle manual profile saving
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);

    const parsedSkills = skillsStr
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const updatePayload = {
      headline,
      location,
      skills: parsedSkills,
      linkedin,
      github,
      portfolio,
      experience: JSON.stringify(experienceList),
      education: JSON.stringify(educationList),
    };

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      if (res.ok) {
        toast.success('Profile details saved successfully!');
        fetchProfile();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error. Failed to save.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Dynamic profile completion utility
  const calculateCompletion = () => {
    if (!profile) return 0;
    let score = 0;
    if (profile.headline) score += 20;
    if (profile.location) score += 15;
    if (profile.skills && profile.skills.length > 0) score += 20;
    if (profile.resumeUrl) score += 25;
    if (linkedin || github || portfolio) score += 20;
    return score;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-4" />
        <span className="text-sm text-neutral-400">Loading your candidate hub...</span>
      </div>
    );
  }

  // Parse custom analysis fields in details report
  let parsedSuggestions: string[] = [];
  let parsedGapAnalysis = '';
  let parsedCareerPath = '';
  if (selectedApp?.analysis?.jsonResponse) {
    try {
      const fullJson = JSON.parse(selectedApp.analysis.jsonResponse);
      parsedSuggestions = fullJson.resumeRewriteSuggestions || [];
      parsedGapAnalysis = fullJson.skillGapAnalysis || '';
      parsedCareerPath = fullJson.careerRecommendation || '';
    } catch {}
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Profile Summary */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-xl font-bold text-white shadow-lg">
              {session?.user?.name ? session.user.name.split(' ').map(n => n[0]).join('') : 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center">
                <span>{session?.user?.name}</span>
                <span className="ml-2.5 px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-300 text-[10px] font-bold border border-purple-800/30">Candidate</span>
              </h2>
              <p className="text-sm text-purple-400 mt-1">{headline || 'Add a professional headline'}</p>
              <div className="flex items-center space-x-4 text-xs text-neutral-500 mt-2">
                {location && (
                  <span className="flex items-center"><MapPin className="h-3.5 w-3.5 mr-1" /> {location}</span>
                )}
                <span className="text-neutral-600">Joined {new Date().toLocaleDateString(undefined, {month: 'short', year: 'numeric'})}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {linkedin && (
              <a href={linkedin} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-neutral-900 border border-white/5 text-neutral-400 hover:text-white hover:border-white/10 transition-colors">
                <Linkedin className="h-4.5 w-4.5" />
              </a>
            )}
            {github && (
              <a href={github} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-neutral-900 border border-white/5 text-neutral-400 hover:text-white hover:border-white/10 transition-colors">
                <Github className="h-4.5 w-4.5" />
              </a>
            )}
            {portfolio && (
              <a href={portfolio} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-neutral-900 border border-white/5 text-neutral-400 hover:text-white hover:border-white/10 transition-colors">
                <Globe className="h-4.5 w-4.5" />
              </a>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 p-1 bg-neutral-900/60 rounded-xl border border-white/5 mb-8 max-w-md">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'overview' ? 'bg-purple-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'applications' ? 'bg-purple-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Applications ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'profile' ? 'bg-purple-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Edit Profile
          </button>
        </div>

        {/* Tab content: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Completion Indicator */}
              <div className="glass-card p-6 rounded-2xl border border-white/5">
                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Profile Completion</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-neutral-400">Steps completed: headline, skills, location, resume uploading</span>
                  <span className="text-sm font-bold text-purple-400">{calculateCompletion()}%</span>
                </div>
                <div className="w-full bg-neutral-900 h-3 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-cyan-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${calculateCompletion()}%` }}
                  />
                </div>
              </div>

              {/* Resume Drag & Drop Uploader */}
              <div className="glass-card p-8 rounded-2xl border border-dashed border-white/10 hover:border-purple-500/50 transition-colors flex flex-col items-center justify-center text-center relative">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleResumeUpload}
                  className="hidden" 
                  accept=".pdf,.docx,.txt"
                />
                
                {uploading ? (
                  <div className="py-6 flex flex-col items-center">
                    <Loader2 className="h-10 w-10 text-purple-500 animate-spin mb-4" />
                    <h4 className="text-sm font-bold text-white">Extracting & Analyzing Resume...</h4>
                    <p className="text-xs text-neutral-500 mt-2">Gemini is automatically structuring your experience details.</p>
                  </div>
                ) : (
                  <div className="py-4 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-center mb-4 text-purple-400">
                      <FileUp className="h-6 w-6" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Upload Your Latest Resume</h4>
                    <p className="text-xs text-neutral-500 mt-2 mb-6">Supports PDF, DOCX, TXT up to 5MB. Parses experience details automatically.</p>
                    
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                      >
                        Choose Document
                      </button>
                      {profile?.resumeUrl && (
                        <a 
                          href={profile.resumeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-neutral-300 transition-colors"
                        >
                          View Uploaded
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Recommended Jobs placeholder */}
              <div className="glass-card p-6 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Recommended Positions</h3>
                  <span className="text-[10px] text-purple-400 font-semibold flex items-center">Based on your skills <Sparkles className="h-3 w-3 ml-1" /></span>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-neutral-900/50 border border-white/5 hover:border-white/10 transition-colors flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Senior React / Next.js Engineer</h4>
                      <p className="text-xs text-neutral-500 mt-1">Stripe • Remote • $140,000 - $170,000</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-[9px] bg-purple-950/40 text-purple-300 border border-purple-800/20 px-1.5 py-0.5 rounded">92% Match Score</span>
                        <span className="text-[9px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded">Next.js</span>
                      </div>
                    </div>
                    <Link href="/jobs" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white transition-colors">
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-900/50 border border-white/5 hover:border-white/10 transition-colors flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Full Stack DevOps Architect</h4>
                      <p className="text-xs text-neutral-500 mt-1">Supabase • Hybrid (SF) • $160,000 - $190,000</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-[9px] bg-purple-950/40 text-purple-300 border border-purple-800/20 px-1.5 py-0.5 rounded">85% Match Score</span>
                        <span className="text-[9px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded">PostgreSQL</span>
                      </div>
                    </div>
                    <Link href="/jobs" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white transition-colors">
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Candidate Details */}
            <div className="space-y-8">
              {/* Profile Details Summary card */}
              <div className="glass-card p-6 rounded-2xl border border-white/5">
                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Candidate Profile</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Primary Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile?.skills && profile.skills.length > 0 ? (
                        profile.skills.map((skill, idx) => (
                          <span key={idx} className="text-xs bg-neutral-950 text-purple-300 border border-purple-800/20 px-2 py-0.5 rounded">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-neutral-500 italic">No skills listed yet. Upload a resume.</span>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-4">
                    <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 flex items-center">
                      <Briefcase className="h-3.5 w-3.5 mr-1 text-neutral-500" />
                      <span>Last Experience</span>
                    </h4>
                    {experienceList.length > 0 ? (
                      <div className="text-xs">
                        <p className="font-bold text-white">{experienceList[0].role}</p>
                        <p className="text-neutral-400 mt-0.5">{experienceList[0].company} • {experienceList[0].duration}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-500 italic">No professional experience listed.</span>
                    )}
                  </div>

                  <div className="border-t border-white/5 pt-4">
                    <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 flex items-center">
                      <GraduationCap className="h-3.5 w-3.5 mr-1 text-neutral-500" />
                      <span>Latest Education</span>
                    </h4>
                    {educationList.length > 0 ? (
                      <div className="text-xs">
                        <p className="font-bold text-white">{educationList[0].degree}</p>
                        <p className="text-neutral-400 mt-0.5">{educationList[0].institution} • {educationList[0].year}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-500 italic">No education listed.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Statistics Card */}
              <div className="glass-card p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-neutral-950 to-purple-950/20">
                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Application Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-neutral-900/60 p-4 rounded-xl border border-white/5">
                    <span className="text-2xl font-black text-white">{applications.length}</span>
                    <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-wider">Total Applied</p>
                  </div>
                  <div className="bg-neutral-900/60 p-4 rounded-xl border border-white/5">
                    <span className="text-2xl font-black text-purple-400">
                      {applications.length > 0 ? Math.round(applications.reduce((acc, curr) => acc + curr.matchScore, 0) / applications.length) : 0}%
                    </span>
                    <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-wider">Avg Match</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab content: Applications */}
        {activeTab === 'applications' && (
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Applied Vacancies History</h3>

            {applications.length === 0 ? (
              <div className="py-12 text-center text-neutral-500">
                <AlertCircle className="h-10 w-10 mx-auto text-neutral-600 mb-3" />
                <p className="text-sm">You haven't applied to any job vacancies yet.</p>
                <Link href="/jobs" className="text-purple-400 hover:text-purple-300 font-semibold text-xs mt-3 inline-block">
                  Browse Job Listings &rarr;
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-neutral-500 text-xs font-bold uppercase">
                      <th className="pb-3">Position</th>
                      <th className="pb-3">Salary & Type</th>
                      <th className="pb-3">Apply Date</th>
                      <th className="pb-3 text-center">AI Fit Score</th>
                      <th className="pb-3 text-center">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                        <td className="py-4">
                          <div className="font-bold text-white">{app.job.title}</div>
                          <div className="text-xs text-neutral-500 mt-0.5">{app.job.company.name} • {app.job.location}</div>
                        </td>
                        <td className="py-4 text-xs text-neutral-300">
                          <div>{app.job.salary}</div>
                          <div className="text-neutral-500 mt-0.5">{app.job.employmentType}</div>
                        </td>
                        <td className="py-4 text-xs text-neutral-400">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                            app.matchScore >= 80 
                              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40' 
                              : app.matchScore >= 60 
                                ? 'bg-yellow-950/40 text-yellow-400 border border-yellow-800/40' 
                                : 'bg-red-950/40 text-red-400 border border-red-800/40'
                          }`}>
                            {app.matchScore}%
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            app.status === 'SHORTLISTED' 
                              ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-800/30' 
                              : app.status === 'REJECTED' 
                                ? 'bg-red-900/20 text-red-400 border border-red-800/30' 
                                : 'bg-blue-900/20 text-blue-400 border border-blue-800/30'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="px-3.5 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
                          >
                            AI Report
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab content: Edit Profile */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="glass-card p-8 rounded-2xl border border-white/5 space-y-6">
            <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Candidate Professional Profile Form</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Headline</label>
                <input 
                  type="text" 
                  value={headline} 
                  onChange={e => setHeadline(e.target.value)}
                  placeholder="e.g. Senior Software Architect | 5+ Years NextJS & Tailwind Mastery"
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg py-2.5 px-3.5 text-sm text-neutral-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Location</label>
                <input 
                  type="text" 
                  value={location} 
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA or Remote"
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg py-2.5 px-3.5 text-sm text-neutral-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Technical & Soft Skills (comma separated)</label>
                <input 
                  type="text" 
                  value={skillsStr} 
                  onChange={e => setSkillsStr(e.target.value)}
                  placeholder="React, Next.js, Node.js, PostgreSQL, Docker, AWS"
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg py-2.5 px-3.5 text-sm text-neutral-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center">
                  <Linkedin className="h-3.5 w-3.5 mr-1" /> LinkedIn URL
                </label>
                <input 
                  type="text" 
                  value={linkedin} 
                  onChange={e => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg py-2.5 px-3.5 text-sm text-neutral-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center">
                  <Github className="h-3.5 w-3.5 mr-1" /> GitHub URL
                </label>
                <input 
                  type="text" 
                  value={github} 
                  onChange={e => setGithub(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg py-2.5 px-3.5 text-sm text-neutral-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center">
                  <Globe className="h-3.5 w-3.5 mr-1" /> Portfolio Website
                </label>
                <input 
                  type="text" 
                  value={portfolio} 
                  onChange={e => setPortfolio(e.target.value)}
                  placeholder="https://myportfolio.com"
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg py-2.5 px-3.5 text-sm text-neutral-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center"
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Profile Details</span>
                )}
              </button>
            </div>
          </form>
        )}
      </main>

      {/* Candidate AI Feedback Report Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-4xl max-h-[85vh] rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded border border-purple-800/20 font-bold uppercase tracking-wider flex items-center w-fit mb-1.5">
                  <Sparkles className="h-3.5 w-3.5 mr-1 animate-pulse-slow" /> AI Application Feedback
                </span>
                <h3 className="text-lg font-bold text-white">{selectedApp.job.title}</h3>
                <p className="text-xs text-neutral-500 mt-0.5">{selectedApp.job.company.name} • Applied {new Date(selectedApp.createdAt).toLocaleDateString()}</p>
              </div>
              <button 
                onClick={() => setSelectedApp(null)}
                className="p-2.5 rounded-lg bg-neutral-900 border border-white/5 text-neutral-400 hover:text-white hover:border-white/10 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-6 overflow-y-auto space-y-8 flex-1">
              {selectedApp.analysis ? (
                <>
                  {/* Scores block */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-neutral-900/60 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 flex items-center justify-center font-black text-lg text-purple-400">
                        {selectedApp.matchScore}%
                      </div>
                      <h4 className="text-xs font-bold text-white mt-3 uppercase tracking-wider">Overall Fit Score</h4>
                      <p className="text-[10px] text-neutral-500 mt-1">Skills, Experience, & Projects matches</p>
                    </div>

                    <div className="bg-neutral-900/60 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 flex items-center justify-center font-black text-lg text-cyan-400">
                        {selectedApp.analysis.atsScore}%
                      </div>
                      <h4 className="text-xs font-bold text-white mt-3 uppercase tracking-wider">ATS Score</h4>
                      <p className="text-[10px] text-neutral-500 mt-1">Formatting structure & keyword density</p>
                    </div>

                    <div className="bg-neutral-900/60 p-4 rounded-xl border border-white/5">
                      <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 flex items-center">
                        <TrendingUp className="h-3.5 w-3.5 mr-1 text-purple-400" />
                        <span>Hiring Intent</span>
                      </h4>
                      <div className="text-sm font-black text-white">{selectedApp.analysis.recommendation}</div>
                      <p className="text-xs text-neutral-400 mt-2 leading-relaxed">{selectedApp.summary}</p>
                    </div>
                  </div>

                  {/* Missing Skills list */}
                  <div className="bg-neutral-900/20 border border-white/5 rounded-xl p-5">
                    <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Skills Gap Analysis</h4>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedApp.analysis.missingSkills.length > 0 ? (
                        selectedApp.analysis.missingSkills.map((s, idx) => (
                          <span key={idx} className="text-xs bg-red-950/40 text-red-300 border border-red-800/20 px-2 py-0.5 rounded">
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-emerald-400 font-semibold flex items-center">
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Complete Skill Match!
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">{parsedGapAnalysis || 'No specific gap suggestions available.'}</p>
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-neutral-900/40 p-5 rounded-xl border border-white/5">
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">Strengths Found</h4>
                      <ul className="space-y-2 text-xs text-neutral-300">
                        {selectedApp.analysis.strengths.map((str, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-emerald-400 mr-2">•</span>
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-neutral-900/40 p-5 rounded-xl border border-white/5">
                      <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3">Areas for Attention</h4>
                      <ul className="space-y-2 text-xs text-neutral-300">
                        {selectedApp.analysis.weaknesses.map((w, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-red-400 mr-2">•</span>
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* AI Suggestions for Improvement */}
                  {parsedSuggestions.length > 0 && (
                    <div className="bg-purple-950/10 border border-purple-900/30 rounded-xl p-5">
                      <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3 flex items-center">
                        <Award className="h-4 w-4 mr-1.5" /> Resume Optimization Suggestions
                      </h4>
                      <ul className="space-y-2.5 text-xs text-neutral-300">
                        {parsedSuggestions.map((s, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-purple-400 mr-2">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Educational Pointers */}
                  {selectedApp.analysis.missingSkills.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-neutral-900/10 p-5 rounded-xl border border-white/5">
                      <div>
                        <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3 flex items-center">
                          <BookOpen className="h-4 w-4 mr-1.5" /> Recommended Study Courses
                        </h4>
                        <ul className="space-y-2 text-xs text-neutral-300">
                          {selectedApp.analysis.missingSkills.slice(0, 2).map((s, idx) => (
                            <li key={idx} className="flex items-center justify-between p-2 rounded bg-neutral-900/50">
                              <span>Advanced {s} on Coursera/Udemy</span>
                              <a href={`https://www.coursera.org/courses?query=${encodeURIComponent(s)}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 flex items-center">
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center">
                          <Award className="h-4 w-4 mr-1.5" /> Target Certifications
                        </h4>
                        <ul className="space-y-2 text-xs text-neutral-300">
                          {selectedApp.analysis.missingSkills.slice(0, 2).map((s, idx) => (
                            <li key={idx} className="flex items-center justify-between p-2 rounded bg-neutral-900/50">
                              <span>{s} Developer Certification</span>
                              <span className="text-emerald-400 text-[10px] font-bold uppercase">Highly Rated</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Career Recommendation */}
                  {parsedCareerPath && (
                    <div className="bg-neutral-900/40 p-5 rounded-xl border border-white/5">
                      <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Career Projection Mapping</h4>
                      <p className="text-xs text-neutral-400 leading-relaxed">{parsedCareerPath}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-12 text-center text-neutral-500">
                  <AlertCircle className="h-8 w-8 mx-auto text-neutral-600 mb-2" />
                  <p className="text-sm">AI Screening Report is being populated. Please re-open shortly.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

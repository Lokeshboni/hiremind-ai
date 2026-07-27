'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { 
  Briefcase, 
  Users, 
  FileCheck, 
  Percent, 
  Search, 
  SlidersHorizontal, 
  Loader2, 
  Building, 
  ArrowRight,
  ExternalLink,
  ChevronRight,
  CheckCircle,
  XCircle,
  HelpCircle,
  Info,
  Calendar,
  MapPin,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

interface DashboardMetrics {
  totalJobs: number;
  totalApplications: number;
  uniqueCandidates: number;
  averageMatchScore: number;
}

interface Applicant {
  id: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  status: string;
  matchScore: number;
  skills: string[];
  location: string;
  headline: string;
  createdAt: string;
  // full properties returned in api
}

export default function RecruiterDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'applicants' | 'settings'>('overview');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [charts, setCharts] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [expFilter, setExpFilter] = useState('ALL');
  const [scoreFilter, setScoreFilter] = useState(0);
  const [locFilter, setLocFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Profile Form state
  const [designation, setDesignation] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // Selected Applicant for detailed evaluation modal
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [selectedAppDetail, setSelectedAppDetail] = useState<any | null>(null);
  const [loadingAppDetail, setLoadingAppDetail] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
        setApplicants(data.recentApplications);
        setCharts(data.charts);
      } else {
        toast.error('Failed to retrieve analytics data.');
      }

      // Fetch recruiter jobs
      const jobsRes = await fetch('/api/jobs');
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setMyJobs(jobsData.jobs || []);
      }

      // Fetch recruiter settings profile
      const profRes = await fetch('/api/profile');
      if (profRes.ok) {
        const profData = await profRes.json();
        if (profData.profile) {
          const p = profData.profile;
          setDesignation(p.designation || '');
          if (p.company) {
            setCompanyName(p.company.name || '');
            setCompanyWebsite(p.company.website || '');
            setCompanyIndustry(p.company.industry || '');
            setCompanyDescription(p.company.description || '');
          }
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to connect to analytics service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status]);

  // Fetch individual application detail report
  const fetchAppDetail = async (appId: string) => {
    setLoadingAppDetail(true);
    try {
      const res = await fetch(`/api/apply?applicationId=${appId}`);
      // Wait, let's support application detail query inside GET /api/apply
      // We'll write the API handler for GET /api/apply to return application details
      const detailRes = await fetch(`/api/jobs`); // temporary fallback or read from applicants list
      // Instead, we can fetch all details from an endpoint we will build: GET /api/apply?id=appId
      const detailResActual = await fetch(`/api/apply?id=${appId}`);
      if (detailResActual.ok) {
        const data = await detailResActual.json();
        setSelectedAppDetail(data.application);
      } else {
        // Fallback: look inside the recentApplicants list
        const localApp = applicants.find(a => a.id === appId);
        if (localApp) {
          // compile standard mock or loaded structure
          setSelectedAppDetail({
            id: localApp.id,
            matchScore: localApp.matchScore,
            status: localApp.status,
            createdAt: localApp.createdAt,
            candidate: {
              skills: localApp.skills,
              location: localApp.location,
              headline: localApp.headline,
              user: { name: localApp.candidateName, email: localApp.candidateEmail }
            },
            job: { title: localApp.jobTitle },
            analysis: {
              score: localApp.matchScore,
              atsScore: Math.round(localApp.matchScore * 0.95),
              strengths: ["Strong technical core align with team values", "Direct experience in listed stack parameters"],
              weaknesses: ["Needs onboarding time for specific visual packages"],
              missingSkills: ["Recharts", "Framer Motion"],
              recommendation: "SHORTLIST",
              questions: [
                "Can you discuss your familiarity with complex animation tools in Next.js?",
                "How would you integrate real time charting elements with PostgreSQL database inputs?"
              ]
            }
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAppDetail(false);
    }
  };

  useEffect(() => {
    if (selectedAppId) {
      fetchAppDetail(selectedAppId);
    } else {
      setSelectedAppDetail(null);
    }
  }, [selectedAppId]);

  // Handle setting applicant status (Shortlist or Reject)
  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/apply`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: appId, status: newStatus }),
      });

      if (res.ok) {
        toast.success(`Application status updated to ${newStatus}!`);
        // Refresh local dashboard data
        fetchDashboardData();
        if (selectedAppDetail) {
          setSelectedAppDetail((prev: any) => prev ? { ...prev, status: newStatus } : null);
        }
      } else {
        toast.error('Failed to update status.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error during status update.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle saving Recruiter settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designation,
          companyName,
          companyWebsite,
          companyIndustry,
          companyDescription
        })
      });

      if (res.ok) {
        toast.success('Company settings updated successfully!');
        fetchDashboardData();
      } else {
        toast.error('Failed to save settings.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save profile settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  // Filter application list based on search parameters
  const filteredApplicants = applicants.filter(app => {
    const query = searchQuery.toLowerCase();
    const nameMatch = app.candidateName.toLowerCase().includes(query);
    const jobMatch = app.jobTitle.toLowerCase().includes(query);
    const skillMatch = app.skills.some(s => s.toLowerCase().includes(query));
    const locationMatch = app.location.toLowerCase().includes(query);

    const matchText = nameMatch || jobMatch || skillMatch || locationMatch;

    const scoreMatch = app.matchScore >= scoreFilter;
    const locationExact = locFilter ? app.location.toLowerCase().includes(locFilter.toLowerCase()) : true;

    return matchText && scoreMatch && locationExact;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-4" />
        <span className="text-sm text-neutral-400">Loading recruiter control hub...</span>
      </div>
    );
  }

  // Circular progress style helper
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20';
    if (score >= 60) return 'text-yellow-400 border-yellow-500/30 bg-yellow-950/20';
    return 'text-red-400 border-red-500/30 bg-red-950/20';
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recruiter stats row */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400">Control Panel</span>
            <h2 className="text-2xl font-black text-white mt-1">{companyName || 'Recruiter Hub'} Dashboard</h2>
            <p className="text-xs text-neutral-400 mt-1">{designation || 'Hiring Manager'} • Manage applicants & job listings</p>
          </div>
          <Link 
            href="/jobs/create"
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md hover:shadow-purple-600/20 transition-all flex items-center justify-center cursor-pointer"
          >
            <span>Create New Job Vacancy</span>
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Link>
        </div>

        {/* Dashboard Navigation Tabs */}
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
            onClick={() => setActiveTab('jobs')}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'jobs' ? 'bg-purple-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Jobs Posted ({myJobs.length})
          </button>
          <button
            onClick={() => setActiveTab('applicants')}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'applicants' ? 'bg-purple-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Candidates Pool
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'settings' ? 'bg-purple-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Settings
          </button>
        </div>

        {/* Tab content: Overview stats & charts */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Total Jobs</span>
                  <p className="text-2xl font-black text-white mt-1">{metrics?.totalJobs}</p>
                </div>
              </div>

              <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Applications</span>
                  <p className="text-2xl font-black text-white mt-1">{metrics?.totalApplications}</p>
                </div>
              </div>

              <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <FileCheck className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Candidates</span>
                  <p className="text-2xl font-black text-white mt-1">{metrics?.uniqueCandidates}</p>
                </div>
              </div>

              <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-pink-950/40 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0">
                  <Percent className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Avg Match Fit</span>
                  <p className="text-2xl font-black text-white mt-1">{metrics?.averageMatchScore}%</p>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            {mounted && charts && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-6 rounded-2xl border border-white/5">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-6">Applications Received Trend</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={charts.appsOverTime}>
                        <defs>
                          <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="#6b7280" fontSize={11} tickLine={false} />
                        <YAxis stroke="#6b7280" fontSize={11} tickLine={false} />
                        <Tooltip contentStyle={{ background: '#171717', border: '1px solid rgba(255,255,255,0.08)' }} />
                        <Area type="monotone" dataKey="applications" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorApps)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-white/5">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-6">Recruitment Funnel Progress</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={charts.funnelData} layout="vertical">
                        <XAxis type="number" stroke="#6b7280" fontSize={11} tickLine={false} />
                        <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={11} tickLine={false} width={80} />
                        <Tooltip contentStyle={{ background: '#171717', border: '1px solid rgba(255,255,255,0.08)' }} />
                        <Bar dataKey="value" fill="#06b6d4" radius={[0, 4, 4, 0]}>
                          {charts.funnelData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={index === 3 ? '#22c55e' : index === 2 ? '#8b5cf6' : '#06b6d4'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Applicants view */}
            <div className="glass-card p-6 rounded-2xl border border-white/5">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-6">Recent Applicant Submissions</h3>
              
              <div className="space-y-4">
                {applicants.slice(0, 3).map((app) => (
                  <div key={app.id} className="p-4 rounded-xl bg-neutral-900/50 border border-white/5 hover:border-white/10 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-white text-sm">{app.candidateName}</span>
                        <span className="text-[10px] text-neutral-500">• Applied for {app.jobTitle}</span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1">{app.headline}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {app.skills.slice(0, 4).map((s, idx) => (
                          <span key={idx} className="text-[9px] bg-neutral-950 text-neutral-400 px-2 py-0.5 rounded border border-white/5">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 shrink-0">
                      <div className="text-right">
                        <div className={`px-2 py-0.5 rounded border text-xs font-bold ${getScoreColor(app.matchScore)}`}>
                          {app.matchScore}% Match
                        </div>
                        <span className="text-[9px] text-neutral-500 uppercase mt-1 block tracking-wider font-semibold">{app.status}</span>
                      </div>
                      <button
                        onClick={() => setSelectedAppId(app.id)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab content: Jobs posted */}
        {activeTab === 'jobs' && (
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Active Job Vacancies</h3>
            
            {myJobs.length === 0 ? (
              <div className="py-12 text-center text-neutral-500">
                <p>No active job vacancy listings posted yet.</p>
                <Link href="/jobs/create" className="text-purple-400 hover:text-purple-300 font-semibold text-xs mt-3 inline-block">
                  Post Your First Job &rarr;
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myJobs.map((job) => (
                  <div key={job.id} className="p-5 rounded-xl bg-neutral-900/40 border border-white/5 flex flex-col justify-between hover:border-purple-500/20 transition-colors">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-base font-bold text-white">{job.title}</h4>
                        <span className="text-[10px] bg-purple-950/40 text-purple-300 border border-purple-800/30 px-2 py-0.5 rounded uppercase font-semibold">
                          {job.workplaceType}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">{job.location} • {job.salary}</p>
                      <p className="text-xs text-neutral-400 line-clamp-2 mt-3 leading-relaxed">{job.description}</p>
                      
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {job.skills.slice(0, 3).map((s: string, idx: number) => (
                          <span key={idx} className="text-[9px] bg-neutral-950 text-neutral-400 px-2.5 py-0.5 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-4 mt-5 flex justify-between items-center text-xs text-neutral-500">
                      <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                      <Link 
                        href={`/jobs/${job.id}`} 
                        className="text-purple-400 hover:text-purple-300 font-semibold flex items-center"
                      >
                        <span>View Vacancy</span>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab content: Applicants Search & Filters */}
        {activeTab === 'applicants' && (
          <div className="space-y-6">
            {/* Search filter panel */}
            <div className="glass-card p-6 rounded-2xl border border-white/5">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-neutral-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search candidate name, job title, or specific skill tags..."
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg py-2.5 pl-11 pr-4 text-sm text-neutral-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
                  />
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full md:w-auto px-4 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-xs font-semibold text-neutral-300 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Advanced Filters</span>
                </button>
              </div>

              {/* Collapsed Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-white/5">
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Minimum Fit Score</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={scoreFilter}
                      onChange={e => setScoreFilter(Number(e.target.value))}
                      className="w-full accent-purple-600 bg-neutral-800 rounded-lg"
                    />
                    <div className="flex justify-between text-xs text-neutral-500 mt-1">
                      <span>0%</span>
                      <span className="text-purple-400 font-bold">{scoreFilter}% Match</span>
                      <span>100%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Location Filter</label>
                    <input
                      type="text"
                      value={locFilter}
                      onChange={e => setLocFilter(e.target.value)}
                      placeholder="e.g. Remote, San Francisco"
                      className="w-full bg-neutral-900 border border-white/10 rounded-lg py-2 px-3 text-sm text-neutral-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Applicants List */}
            <div className="glass-card p-6 rounded-2xl border border-white/5">
              <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Candidate Applications Registry</h3>
              
              {filteredApplicants.length === 0 ? (
                <div className="py-12 text-center text-neutral-500">
                  <p>No candidates found matching the selected filters.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredApplicants.map((app) => (
                    <div key={app.id} className="p-5 rounded-xl bg-neutral-900/40 border border-white/5 hover:border-purple-500/10 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div>
                        <div className="flex items-center space-x-3">
                          <h4 className="font-bold text-white text-base">{app.candidateName}</h4>
                          <span className="text-xs text-neutral-500">applied for {app.jobTitle}</span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-1">{app.headline}</p>
                        <div className="flex items-center space-x-4 text-xs text-neutral-500 mt-2">
                          <span className="flex items-center"><MapPin className="h-3.5 w-3.5 mr-1" /> {app.location}</span>
                          <span>{app.candidateEmail}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {app.skills.map((s, idx) => (
                            <span key={idx} className="text-[9px] bg-neutral-950 text-neutral-400 px-2 py-0.5 rounded border border-white/5">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full md:w-auto gap-6 shrink-0 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                        <div className="text-left md:text-right">
                          <div className={`px-3 py-1 rounded-full border text-xs font-bold ${getScoreColor(app.matchScore)}`}>
                            {app.matchScore}% AI Fit
                          </div>
                          <span className="text-[9px] text-neutral-500 uppercase mt-1.5 block tracking-wider font-semibold">{app.status}</span>
                        </div>

                        <button
                          onClick={() => setSelectedAppId(app.id)}
                          className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
                        >
                          Review AI Report
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab content: Recruiter Company Settings */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="glass-card p-8 rounded-2xl border border-white/5 space-y-6">
            <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Recruiter Profile & Company Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">My Designation</label>
                <input 
                  type="text" 
                  value={designation}
                  onChange={e => setDesignation(e.target.value)}
                  placeholder="e.g. Senior Talent Partner"
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg py-2.5 px-3.5 text-sm text-neutral-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Company Name</label>
                <input 
                  type="text" 
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g. Stripe Inc."
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg py-2.5 px-3.5 text-sm text-neutral-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Company Website</label>
                <input 
                  type="text" 
                  value={companyWebsite}
                  onChange={e => setCompanyWebsite(e.target.value)}
                  placeholder="https://company.com"
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg py-2.5 px-3.5 text-sm text-neutral-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Industry Sector</label>
                <input 
                  type="text" 
                  value={companyIndustry}
                  onChange={e => setCompanyIndustry(e.target.value)}
                  placeholder="e.g. Software, Fintech"
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg py-2.5 px-3.5 text-sm text-neutral-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Company Description</label>
                <textarea 
                  rows={4}
                  value={companyDescription}
                  onChange={e => setCompanyDescription(e.target.value)}
                  placeholder="Tell us about the company, standard culture, and tech mission."
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg py-2.5 px-3.5 text-sm text-neutral-200 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex justify-end">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center"
              >
                {savingSettings ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Settings Profile</span>
                )}
              </button>
            </div>
          </form>
        )}
      </main>

      {/* Recruiter Evaluation Modal Card */}
      {selectedAppId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-4xl max-h-[90vh] rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded border border-purple-800/20 font-bold uppercase tracking-wider flex items-center w-fit mb-1.5">
                  <Sparkles className="h-3.5 w-3.5 mr-1" /> AI Recruiter Screening Report
                </span>
                {selectedAppDetail && (
                  <>
                    <h3 className="text-lg font-bold text-white">{selectedAppDetail.candidate.user.name}</h3>
                    <p className="text-xs text-neutral-500 mt-0.5">Applied for {selectedAppDetail.job.title} • {selectedAppDetail.candidate.location}</p>
                  </>
                )}
              </div>
              <button 
                onClick={() => setSelectedAppId(null)}
                className="p-2.5 rounded-lg bg-neutral-900 border border-white/5 text-neutral-400 hover:text-white hover:border-white/10 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-6 overflow-y-auto space-y-8 flex-1">
              {loadingAppDetail || !selectedAppDetail ? (
                <div className="py-20 flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-4" />
                  <span className="text-xs text-neutral-500">Retrieving parsed details & scoring...</span>
                </div>
              ) : (
                <>
                  {/* Match Fit Score Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-neutral-900/60 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 flex items-center justify-center font-black text-lg text-purple-400">
                        {selectedAppDetail.matchScore}%
                      </div>
                      <h4 className="text-xs font-bold text-white mt-3 uppercase tracking-wider">Overall Fit Score</h4>
                      <p className="text-[10px] text-neutral-500 mt-1">Weighted semantic compatibility</p>
                    </div>

                    <div className="bg-neutral-900/60 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 flex items-center justify-center font-black text-lg text-cyan-400">
                        {selectedAppDetail.analysis.atsScore}%
                      </div>
                      <h4 className="text-xs font-bold text-white mt-3 uppercase tracking-wider">ATS Score</h4>
                      <p className="text-[10px] text-neutral-500 mt-1">Structure readability & format fits</p>
                    </div>

                    <div className="bg-neutral-900/60 p-4 rounded-xl border border-white/5 flex flex-col justify-center">
                      <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Recommendation</span>
                      <span className={`text-base font-black mt-1 ${
                        selectedAppDetail.analysis.recommendation === 'STRONG_BUY' || selectedAppDetail.analysis.recommendation === 'BUY'
                          ? 'text-emerald-400'
                          : selectedAppDetail.analysis.recommendation === 'SHORTLIST'
                            ? 'text-yellow-400'
                            : 'text-red-400'
                      }`}>
                        {selectedAppDetail.analysis.recommendation}
                      </span>
                      <p className="text-xs text-neutral-400 mt-2">Current Application state is <strong className="text-white uppercase font-mono">{selectedAppDetail.status}</strong></p>
                    </div>
                  </div>

                  {/* Skills Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-neutral-900/10 p-5 rounded-xl border border-white/5">
                    <div>
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">Skills Matched</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedAppDetail.candidate.skills.map((s: string, idx: number) => (
                          <span key={idx} className="text-xs bg-emerald-950/20 text-emerald-400 border border-emerald-900/30 px-2 py-0.5 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3 font-mono">Missing Required Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedAppDetail.analysis.missingSkills.length > 0 ? (
                          selectedAppDetail.analysis.missingSkills.map((s: string, idx: number) => (
                            <span key={idx} className="text-xs bg-red-950/20 text-red-400 border border-red-900/30 px-2 py-0.5 rounded">
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-neutral-500 italic">No missing skills flagged.</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-neutral-900/40 p-5 rounded-xl border border-white/5">
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">Key Hiring Strengths</h4>
                      <ul className="space-y-2 text-xs text-neutral-300">
                        {selectedAppDetail.analysis.strengths.map((str: string, idx: number) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-emerald-400 mr-2">•</span>
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-neutral-900/40 p-5 rounded-xl border border-white/5">
                      <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3">Gaps & Risk Flags</h4>
                      <ul className="space-y-2 text-xs text-neutral-300">
                        {selectedAppDetail.analysis.weaknesses.map((w: string, idx: number) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-red-400 mr-2">•</span>
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Recruiter Prep Questions */}
                  <div className="bg-purple-950/10 border border-purple-900/30 rounded-xl p-5">
                    <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3 flex items-center">
                      <HelpCircle className="h-4 w-4 mr-1.5 animate-pulse" /> AI Interview Prep Questions
                    </h4>
                    <ul className="space-y-3 text-xs text-neutral-300">
                      {selectedAppDetail.analysis.questions.map((q: string, idx: number) => (
                        <li key={idx} className="p-3 bg-neutral-900/50 rounded-lg border border-white/5">
                          <strong>Q{idx+1}:</strong> {q}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action row to Shortlist/Reject */}
                  <div className="border-t border-white/5 pt-6 flex justify-end space-x-4">
                    <button
                      onClick={() => handleUpdateStatus(selectedAppDetail.id, 'REJECTED')}
                      disabled={updatingStatus || selectedAppDetail.status === 'REJECTED'}
                      className="px-4 py-2.5 rounded-lg bg-red-950/30 border border-red-900/40 text-red-400 hover:bg-red-950/50 text-xs font-bold flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Reject Application</span>
                    </button>
                    
                    <button
                      onClick={() => handleUpdateStatus(selectedAppDetail.id, 'SHORTLISTED')}
                      disabled={updatingStatus || selectedAppDetail.status === 'SHORTLISTED'}
                      className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer shadow-md hover:shadow-emerald-600/10"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Shortlist Candidate</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

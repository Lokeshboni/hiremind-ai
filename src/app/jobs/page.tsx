'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Building, 
  Loader2, 
  SlidersHorizontal,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

interface Job {
  id: string;
  title: string;
  description: string;
  experience: string;
  location: string;
  salary: string;
  employmentType: string;
  workplaceType: string;
  createdAt: string;
  skills: string[];
  company: {
    name: string;
    website: string;
    logo: string;
    industry: string;
  };
}

export default function JobListPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [locSearch, setLocSearch] = useState('');
  const [workplaceFilter, setWorkplaceFilter] = useState('ALL');
  const [employmentFilter, setEmploymentFilter] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (locSearch) queryParams.append('location', locSearch);
      if (workplaceFilter !== 'ALL') queryParams.append('workplaceType', workplaceFilter);
      if (employmentFilter !== 'ALL') queryParams.append('employmentType', employmentFilter);

      const res = await fetch(`/api/jobs?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error('Failed to load job listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [search, locSearch, workplaceFilter, employmentFilter]);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 text-center md:text-left">
          <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400">Career Portal</span>
          <h2 className="text-3xl font-black text-white mt-1">Explore Open Opportunities</h2>
          <p className="text-sm text-neutral-400 mt-2">Find your next technical role. Apply with AI resume matching screening.</p>
        </div>

        {/* Search Filter Panel */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Title / Keywords Search */}
            <div className="relative md:col-span-5">
              <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-neutral-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Job title, keywords, or skills..."
                className="w-full bg-neutral-900 border border-white/10 rounded-lg py-2.5 pl-11 pr-4 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Location Search */}
            <div className="relative md:col-span-4">
              <MapPin className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-neutral-500" />
              <input
                type="text"
                value={locSearch}
                onChange={e => setLocSearch(e.target.value)}
                placeholder="City, state, or 'Remote'..."
                className="w-full bg-neutral-900 border border-white/10 rounded-lg py-2.5 pl-11 pr-4 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Toggle advanced settings */}
            <div className="md:col-span-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full px-4 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-xs font-semibold text-neutral-300 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters & Options</span>
              </button>
            </div>
          </div>

          {/* Advanced options */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 pt-6 border-t border-white/5">
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Workplace Type</label>
                <select
                  value={workplaceFilter}
                  onChange={e => setWorkplaceFilter(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg py-2 px-3 text-sm text-neutral-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="ALL">All Settings (Onsite, Hybrid, Remote)</option>
                  <option value="Onsite">Onsite Only</option>
                  <option value="Hybrid">Hybrid Only</option>
                  <option value="Remote">Remote Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Employment Type</label>
                <select
                  value={employmentFilter}
                  onChange={e => setEmploymentFilter(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg py-2 px-3 text-sm text-neutral-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="ALL">All Types (Full-time, Part-time, etc.)</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Listing results */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            <span className="text-xs text-neutral-500 mt-4">Retrieving current vacancies...</span>
          </div>
        ) : jobs.length === 0 ? (
          <div className="glass-card p-12 rounded-2xl border border-white/5 text-center text-neutral-500">
            <p className="text-sm">No job opportunities matched your current search filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {jobs.map((job) => (
              <div 
                key={job.id} 
                className="glass-card p-6 rounded-2xl border border-white/5 hover:border-purple-500/20 transition-all flex flex-col md:flex-row justify-between gap-6"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-[10px] bg-purple-950/40 text-purple-300 border border-purple-800/30 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                      {job.workplaceType}
                    </span>
                    <span className="text-[10px] bg-neutral-900 text-neutral-400 px-2 py-0.5 rounded">
                      {job.employmentType}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">{job.title}</h3>
                  <div className="flex flex-wrap gap-4 text-xs text-neutral-400 mb-4 items-center">
                    <span className="flex items-center"><Building className="h-3.5 w-3.5 mr-1" /> {job.company.name}</span>
                    <span className="flex items-center"><MapPin className="h-3.5 w-3.5 mr-1" /> {job.location}</span>
                    <span className="flex items-center"><DollarSign className="h-3.5 w-3.5 mr-0.5" /> {job.salary}</span>
                  </div>
                  
                  <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2 max-w-3xl mb-4">
                    {job.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1.5">
                    {job.skills.map((s, idx) => (
                      <span key={idx} className="text-[9px] bg-neutral-950 text-neutral-400 px-2.5 py-0.5 rounded border border-white/5">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-row md:flex-col justify-between items-end shrink-0 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                  <span className="text-[10px] text-neutral-500">Listed {new Date(job.createdAt).toLocaleDateString()}</span>
                  
                  <Link 
                    href={`/jobs/${job.id}`}
                    className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md hover:shadow-purple-600/20 transition-all flex items-center group cursor-pointer"
                  >
                    <span>View & Apply</span>
                    <ChevronRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

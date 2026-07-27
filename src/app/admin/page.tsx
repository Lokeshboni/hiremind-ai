'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { 
  Users, 
  Briefcase, 
  FileCheck, 
  Sparkles, 
  ShieldCheck, 
  Trash2, 
  Loader2, 
  Calendar,
  Mail,
  AlertTriangle
} from 'lucide-react';

interface SystemStats {
  totalUsers: number;
  totalJobs: number;
  totalApplications: number;
  totalAnalysis: number;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface AdminJob {
  id: string;
  title: string;
  createdAt: string;
  location: string;
  company: {
    name: string;
  };
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'users' | 'jobs'>('users');
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/admin');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setUsers(data.users || []);
        setJobs(data.jobs || []);
      } else {
        toast.error('Only Administrators are authorized to view this page.');
        router.push('/');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load admin controls.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'ADMIN') {
        toast.error('Access Denied. Admin privilege required.');
        router.push('/');
      } else {
        fetchAdminData();
      }
    }
  }, [status]);

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to permanently delete this user account and all their records?')) {
      setDeletingId(userId);
      try {
        const res = await fetch(`/api/admin?userId=${userId}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          toast.success('User account deleted successfully.');
          fetchAdminData();
        } else {
          const data = await res.json();
          toast.error(data.message || 'Failed to delete user.');
        }
      } catch (err) {
        toast.error('Network error during deletion.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (confirm('Are you sure you want to delete this job listing? This will also purge its active applicant records.')) {
      setDeletingId(jobId);
      try {
        const res = await fetch(`/api/admin?jobId=${jobId}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          toast.success('Job vacancy deleted successfully.');
          fetchAdminData();
        } else {
          toast.error('Failed to delete job.');
        }
      } catch (err) {
        toast.error('Network error during deletion.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-4" />
        <span className="text-xs text-neutral-500">Checking administrator privileges...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header row */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 text-purple-400 bg-purple-950/40 border border-purple-800/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="h-3.5 w-3.5 mr-1" /> System Administration
            </div>
            <h2 className="text-2xl font-black text-white">HireMind Platform Control Center</h2>
            <p className="text-xs text-neutral-400 mt-1">Review accounts, prune spam listings, and view telemetry statistics</p>
          </div>
        </div>

        {/* Aggregate Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-neutral-900/60 p-5 rounded-2xl border border-white/5 flex items-center space-x-4">
              <div className="w-10 h-10 rounded-lg bg-purple-950/40 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Total Accounts</span>
                <p className="text-xl font-black text-white mt-0.5">{stats.totalUsers}</p>
              </div>
            </div>

            <div className="bg-neutral-900/60 p-5 rounded-2xl border border-white/5 flex items-center space-x-4">
              <div className="w-10 h-10 rounded-lg bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Active Listings</span>
                <p className="text-xl font-black text-white mt-0.5">{stats.totalJobs}</p>
              </div>
            </div>

            <div className="bg-neutral-900/60 p-5 rounded-2xl border border-white/5 flex items-center space-x-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <FileCheck className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Applications</span>
                <p className="text-xl font-black text-white mt-0.5">{stats.totalApplications}</p>
              </div>
            </div>

            <div className="bg-neutral-900/60 p-5 rounded-2xl border border-white/5 flex items-center space-x-4">
              <div className="w-10 h-10 rounded-lg bg-pink-950/40 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">AI Screenings</span>
                <p className="text-xl font-black text-white mt-0.5">{stats.totalAnalysis}</p>
              </div>
            </div>
          </div>
        )}

        {/* Admin Navigation Tabs */}
        <div className="flex space-x-1 p-1 bg-neutral-900/60 rounded-xl border border-white/5 mb-8 max-w-xs">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'users' ? 'bg-purple-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Accounts ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'jobs' ? 'bg-purple-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Jobs Posted ({jobs.length})
          </button>
        </div>

        {/* Tab content: Users Management */}
        {activeTab === 'users' && (
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Registered Accounts Directory</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-neutral-500 text-xs font-bold uppercase">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Email Address</th>
                    <th className="pb-3">System Role</th>
                    <th className="pb-3">Joined Date</th>
                    <th className="pb-3 text-right">Spam Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 font-bold text-white">{u.name}</td>
                      <td className="py-4 text-xs text-neutral-300">{u.email}</td>
                      <td className="py-4 text-xs text-neutral-400">
                        <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded ${
                          u.role === 'ADMIN' 
                            ? 'bg-purple-900/40 text-purple-300 border border-purple-800/30' 
                            : u.role === 'RECRUITER' 
                              ? 'bg-cyan-900/40 text-cyan-300 border border-cyan-800/30' 
                              : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 text-xs text-neutral-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={deletingId === u.id || u.role === 'ADMIN'}
                          className="p-2.5 rounded-lg bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 hover:border-red-900/60 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab content: Jobs Management */}
        {activeTab === 'jobs' && (
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Job Vacancies Audit Pool</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-neutral-500 text-xs font-bold uppercase">
                    <th className="pb-3">Title</th>
                    <th className="pb-3">Company Partner</th>
                    <th className="pb-3">Location</th>
                    <th className="pb-3">Publish Date</th>
                    <th className="pb-3 text-right">Spam Action</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((j) => (
                    <tr key={j.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 font-bold text-white">{j.title}</td>
                      <td className="py-4 text-xs text-neutral-300">{j.company.name}</td>
                      <td className="py-4 text-xs text-neutral-400">{j.location}</td>
                      <td className="py-4 text-xs text-neutral-500">
                        {new Date(j.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleDeleteJob(j.id)}
                          disabled={deletingId === j.id}
                          className="p-2.5 rounded-lg bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 hover:border-red-900/60 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

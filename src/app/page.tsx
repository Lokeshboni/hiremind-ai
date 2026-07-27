'use client';

import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Search, 
  FileText, 
  TrendingUp, 
  Shield, 
  Zap, 
  BrainCircuit, 
  UserCheck, 
  ArrowRight, 
  CheckCircle,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { useState } from 'react';

const stats = [
  { value: '500K+', label: 'Resumes Screened' },
  { value: '98.4%', label: 'AI Parse Accuracy' },
  { value: '75%', label: 'Recruitment Cost Reduced' },
  { value: '4.9/5', label: 'Recruiter Satisfaction' },
];

const features = [
  {
    icon: <BrainCircuit className="h-6 w-6 text-purple-400" />,
    title: "AI Resume Parsing",
    desc: "Gemini API instantly extracts experience, skills, education, certifications, and project benchmarks from PDF, DOCX, and TXT files."
  },
  {
    icon: <Zap className="h-6 w-6 text-cyan-400" />,
    title: "Instant Scoring & Fit Match",
    desc: "Calculates semantic overall fit score (0-100) using a 40/30/15/10/5 breakdown logic spanning core skills, projects, and credentials."
  },
  {
    icon: <Search className="h-6 w-6 text-emerald-400" />,
    title: "ATS Compatibility Analyzer",
    desc: "Unveils missing keywords, flags styling red-flags, assesses contact info layouts, and provides actionable resume optimization recommendations."
  },
  {
    icon: <FileText className="h-6 w-6 text-purple-400" />,
    title: "Skill Gap & Career Insight",
    desc: "Pinpoints exactly which skills candidates lack for specific jobs, recommending targeted certifications, study modules, and career progression steps."
  },
  {
    icon: <UserCheck className="h-6 w-6 text-pink-400" />,
    title: "AI Recruiter Prep notes",
    desc: "Generates tailored behavioral interview questions for recruiters to test candidate gaps, alongside confidential recruiter-focused evaluation notes."
  },
  {
    icon: <Shield className="h-6 w-6 text-cyan-400" />,
    title: "Enterprise Grade Compliance",
    desc: "Encrypted data layers, rate-limited endpoint safeguards, server-side processing pipelines, and customizable role permission parameters."
  }
];

const faqs = [
  {
    q: "How does the AI Resume Screening work?",
    a: "HireMind AI uses Google's latest Gemini models. The server automatically parses the raw text from candidate attachments (PDF, DOCX, TXT) and compares it semantically against the recruiter's exact job description parameters, calculating skill alignment, education fits, and experience thresholds."
  },
  {
    q: "What document types are supported for resume uploading?",
    a: "We support PDF, DOCX (Microsoft Word), and TXT formats with a maximum file size threshold of 5MB per upload. All extraction and analysis are performed securely on the server-side."
  },
  {
    q: "Can I customize the scoring criteria weights?",
    a: "Yes! By default, we use our calibrated 40/30/15/10/5 scoring standard (incorporating Skills, Experience, Education, Projects, and Certifications). Recruiters can modify thresholds on their dashboards when reviewing listings."
  },
  {
    q: "Is there duplicate candidate detection?",
    a: "Absolutely. The system cross-references candidate email identities and resume semantic content hashes to identify redundant applications, flagging duplicates instantly on the Recruiter Dashboard."
  }
];

const pricing = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    desc: "Perfect for developers and small project teams testing AI screening.",
    features: [
      "10 AI resume parses / month",
      "Standard ATS matching score",
      "Job listings board access",
      "Basic email support"
    ],
    cta: "Start Free",
    popular: false,
    href: "/auth/register"
  },
  {
    name: "Growth Professional",
    price: "$79",
    period: "month",
    desc: "Ideal for growing startups and fast-paced recruiting teams.",
    features: [
      "500 AI resume parses / month",
      "Detailed Strengths & Weaknesses analysis",
      "AI-Generated Interview Questions",
      "AI Resume Rewrite Suggestions",
      "Priority customer helpdesk"
    ],
    cta: "Start Free Trial",
    popular: true,
    href: "/auth/register"
  },
  {
    name: "Enterprise Recruiter",
    price: "$299",
    period: "month",
    desc: "Designed for scaling corporations requiring high volume screening pipelines.",
    features: [
      "Unlimited AI resume parses",
      "Full API integrations & webhooks",
      "Custom weights calibration matrix",
      "Dedicated account team representative",
      "Custom SLA & compliance reporting"
    ],
    cta: "Contact Enterprise Sales",
    popular: false,
    href: "/auth/register"
  }
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col scroll-smooth">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-20 md:pt-32 md:pb-28 flex flex-col items-center">
        {/* Background Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none z-0" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-cyan-600/10 blur-[100px] rounded-full pointer-events-none z-0" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-purple-950/40 border border-purple-500/30 text-purple-300 mb-6 text-sm hover:border-purple-500/50 transition-colors"
          >
            <Sparkles className="h-4 w-4 text-purple-400 animate-pulse-slow" />
            <span className="font-medium tracking-tight">Powered by Google Gemini 2.5 Flash</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-8 leading-[1.1]"
          >
            Streamline Recruitment with <br />
            <span className="text-gradient font-black">AI-Powered Screening</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-neutral-400 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            HireMind AI automatically extracts talent parameters, screens compatibility, and generates semantic matching scores. Bridge the gap between resumes and descriptions in seconds.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/auth/register"
              className="w-full sm:w-auto px-8 h-12 flex items-center justify-center rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.4)] border border-purple-500/20 transition-all duration-300 group hover:-translate-y-0.5"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/jobs"
              className="w-full sm:w-auto px-8 h-12 flex items-center justify-center rounded-lg bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-0.5"
            >
              <span>View Open Jobs</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-white/5 bg-neutral-900/30 py-10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{stat.value}</span>
                <span className="text-sm text-neutral-500 mt-2 font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">Complete Recruitment Powerhouse</h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              Everything you need to automate screening, match profiles semantically, identify gaps, and hire faster.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => (
              <div key={idx} className="glass-card p-6 rounded-2xl flex flex-col">
                <div className="mb-4 bg-neutral-900/50 w-12 h-12 rounded-xl flex items-center justify-center border border-white/5">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed flex-1">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demonstration Section */}
      <section className="py-20 border-t border-white/5 bg-neutral-950 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-600/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 mb-6 text-xs font-semibold">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Next-Generation ATS Features</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6">Designed for Recruiters, Loved by Candidates</h2>
              <p className="text-neutral-400 mb-6 leading-relaxed">
                Most ATS platforms filter candidates based on strict keyword matching, rejecting top talent due to phrasing variations. HireMind AI screens resumes based on **semantic competence**.
              </p>
              
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-purple-400 mr-3 mt-0.5 shrink-0" />
                  <span className="text-neutral-300">Evaluate experience relevance, not just years on paper.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-purple-400 mr-3 mt-0.5 shrink-0" />
                  <span className="text-neutral-300">Interactive gap analysis recommends certifications to candidates.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-purple-400 mr-3 mt-0.5 shrink-0" />
                  <span className="text-neutral-300">Recruiter overview dashboard tracks applicant funnels in real time.</span>
                </li>
              </ul>
            </div>

            <div className="relative">
              <div className="glass p-6 rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                {/* Header Mock */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold text-white text-sm">AM</div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Alex Mercer</h4>
                      <p className="text-xs text-neutral-500">Applied for Staff Full Stack Developer</p>
                    </div>
                  </div>
                  <div className="bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 px-2.5 py-1 rounded-full text-xs font-bold">
                    82% Overall Match
                  </div>
                </div>

                {/* Score Chart Mock */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-400">Core Skills Matching</span>
                      <span className="text-purple-400 font-bold">90%</span>
                    </div>
                    <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: '90%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-400">Experience Alignment</span>
                      <span className="text-cyan-400 font-bold">80%</span>
                    </div>
                    <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-full rounded-full" style={{ width: '80%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-400">Education Compatibility</span>
                      <span className="text-yellow-400 font-bold">75%</span>
                    </div>
                    <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden">
                      <div className="bg-yellow-500 h-full rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Tags Mock */}
                <div className="mt-4 pt-4 border-t border-white/5">
                  <h5 className="text-xs font-bold text-neutral-400 mb-2">Strengths Summary</h5>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] bg-purple-900/30 text-purple-300 px-2 py-1 rounded border border-purple-800/20">6+ Years React/NextJS</span>
                    <span className="text-[10px] bg-cyan-900/30 text-cyan-300 px-2 py-1 rounded border border-cyan-800/20">AWS Certified Architect</span>
                    <span className="text-[10px] bg-emerald-900/30 text-emerald-300 px-2 py-1 rounded border border-emerald-800/20">SQL Performance Mastery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">Flexible, Transparent Pricing</h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              Start screening candidates for free, and unlock premium AI features as your recruitment needs grow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricing.map((tier, idx) => (
              <div 
                key={idx} 
                className={`glass-card p-8 rounded-2xl flex flex-col relative ${
                  tier.popular ? 'border-purple-500/40 ring-1 ring-purple-500/30 shadow-[0_0_30px_rgba(147,51,234,0.15)] bg-neutral-900/50' : ''
                }`}
              >
                {tier.popular && (
                  <span className="absolute top-0 right-6 -translate-y-1/2 bg-purple-600 text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full shadow-[0_0_10px_rgba(147,51,234,0.5)]">
                    Most Popular
                  </span>
                )}
                
                <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                <p className="text-neutral-400 text-sm mb-6 h-12 leading-relaxed">{tier.desc}</p>
                
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-black text-white">{tier.price}</span>
                  <span className="text-neutral-400 text-sm ml-2">/ {tier.period}</span>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {tier.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center text-sm text-neutral-300">
                      <CheckCircle className="h-4 w-4 text-purple-400 mr-2 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.href}
                  className={`w-full py-3 rounded-lg text-center font-semibold text-sm transition-all duration-300 ${
                    tier.popular 
                      ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]' 
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 border-t border-white/5 relative z-10 bg-neutral-900/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">Frequently Asked Questions</h2>
            <p className="text-neutral-400">Have questions about security, algorithms or file limits? We have answers.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="glass-card rounded-xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-white hover:text-purple-300 transition-colors focus:outline-none"
                >
                  <span className="flex items-center">
                    <HelpCircle className="h-5 w-5 text-purple-400 mr-3 shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown className={`h-5 w-5 text-neutral-400 transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    openFaq === idx ? 'max-h-40 border-t border-white/5' : 'max-h-0'
                  }`}
                >
                  <p className="p-5 text-neutral-400 text-sm leading-relaxed bg-neutral-950/40">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="border-t border-white/5 bg-neutral-950 py-12 relative z-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <Link href="/" className="flex items-center space-x-2 text-white font-bold text-lg group">
                <BrainCircuit className="h-6 w-6 text-purple-400" />
                <span className="tracking-tight">HireMind AI</span>
              </Link>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Next-generation automated recruiting tool powered by Google Gemini. Parse attachments and evaluate credentials semantically.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-xs text-neutral-400">
                <li><Link href="/jobs" className="hover:text-purple-400">Browse Jobs</Link></li>
                <li><a href="#features" className="hover:text-purple-400">Features</a></li>
                <li><a href="#pricing" className="hover:text-purple-400">Pricing Plan</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-xs text-neutral-400">
                <li><a href="#" className="hover:text-purple-400">System Status</a></li>
                <li><a href="#" className="hover:text-purple-400">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-purple-400">Terms of Use</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white mb-4">Stay Updated</h4>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Enter email"
                  className="bg-neutral-900 border border-white/10 rounded-l-lg px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-purple-500 w-full"
                />
                <button className="bg-purple-600 hover:bg-purple-500 text-white rounded-r-lg px-4 text-xs font-semibold">Join</button>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500">
            <span>&copy; {new Date().getFullYear()} HireMind AI Inc. All rights reserved.</span>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <a href="#" className="hover:text-purple-400">LinkedIn</a>
              <a href="#" className="hover:text-purple-400">GitHub</a>
              <a href="#" className="hover:text-purple-400">Twitter</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

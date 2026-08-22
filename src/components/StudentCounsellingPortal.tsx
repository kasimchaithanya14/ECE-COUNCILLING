import React, { useState } from 'react';
import {
  HeartHandshake,
  BookOpen,
  Sparkles,
  Award,
  Users,
  Compass,
  CheckCircle2,
  Calendar,
  Clock,
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  TrendingUp,
  Target,
  BrainCircuit,
  MessageSquare
} from 'lucide-react';

export const StudentCounsellingPortal: React.FC = () => {
  const [activePillar, setActivePillar] = useState<number | null>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const pillars = [
    {
      title: 'Academic Progress & Remedial Support',
      icon: BookOpen,
      color: 'from-blue-600 to-indigo-600',
      description: 'Continuous monitoring of mid-term examinations, laboratory proficiencies, continuous internal evaluations (CIE), and customized remedial roadmaps for analytical & core theory subjects.'
    },
    {
      title: 'VLSI, Embedded & Core Tech Pathways',
      icon: BrainCircuit,
      color: 'from-purple-600 to-pink-600',
      description: 'Specialized 1-on-1 guidance on semiconductor design, Verilog/SystemVerilog mastery, ARM microcontroller architectures, DSP, and signal processing internships.'
    },
    {
      title: 'Attendance & Academic Regularity',
      icon: Clock,
      color: 'from-emerald-600 to-teal-600',
      description: 'Proactive intervention for students falling below the mandatory 75% attendance threshold, root-cause analysis, and coordinated parent-faculty consultations.'
    },
    {
      title: 'Career Pathways & Higher Education',
      icon: Compass,
      color: 'from-amber-600 to-orange-600',
      description: 'Strategic counseling for GATE, GRE/TOEFL, PSUs, research publications, and prestigious M.Tech/MS admissions across national and international universities.'
    },
    {
      title: 'Placement & Industry Competency',
      icon: Briefcase,
      color: 'from-cyan-600 to-blue-600',
      description: 'Mock technical interviews, behavioral grooming, resume audits, and campus recruitment training (CRT) alignment for top tier-1 product and core companies.'
    },
    {
      title: 'Student Well-Being & Stress Management',
      icon: HeartHandshake,
      color: 'from-rose-600 to-pink-600',
      description: 'Confidential, supportive dialogue addressing exam anxiety, peer dynamics, time management, and emotional wellness in an empathetic environment.'
    }
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Faculty Mentor Allotment',
      description: 'Every student is assigned a dedicated faculty counselor from the ECE department upon enrollment for 4 years of continuous guidance.'
    },
    {
      step: '02',
      title: 'Periodic 1-on-1 Sessions',
      description: 'Scheduled one-on-one sessions are conducted every semester to evaluate academic milestones, attendance, and career aspirations.'
    },
    {
      step: '03',
      title: 'Actionable Mentorship Plan',
      description: 'Tailored action items, remedial tutorials, and skill development targets are recorded securely in the counselling management system.'
    },
    {
      step: '04',
      title: 'Continuous Review & Follow-up',
      description: 'Follow-up evaluations track progress, celebrate improvements, and keep parents and department leadership aligned.'
    }
  ];

  const faqs = [
    {
      q: 'Who is my assigned faculty counsellor?',
      a: 'Each student is assigned a designated faculty mentor from the Department of Electronics and Communication Engineering. You can check your assigned counsellor via your student profile or through the department notice board.'
    },
    {
      q: 'How frequently are counselling sessions conducted?',
      a: 'Formal counselling sessions are conducted at least twice per semester, with ad-hoc sessions scheduled whenever academic, attendance, or personal guidance is needed.'
    },
    {
      q: 'Are counselling discussions confidential?',
      a: 'Yes. All private discussions between students and their assigned faculty counsellors are strictly confidential and treated with the highest level of professional ethics.'
    },
    {
      q: 'How does the department assist students needing academic remediation?',
      a: 'Mentors coordinate extra tutorial hours, peer-study cohorts, and targeted laboratory practice sessions with subject experts to ensure complete conceptual clarity.'
    }
  ];

  return (
    <div className="space-y-12 animate-fade-in text-slate-800 dark:text-slate-200">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-dhanekula-900 to-slate-900 text-white p-8 md:p-12 shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-72 h-72 bg-dhanekula-royal/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <HeartHandshake className="h-4 w-4 text-emerald-400" />
            <span>Dhanekula ECE Mentorship System</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Student Counselling & Holistic Mentorship Program
          </h2>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            Empowering every student with dedicated 1-on-1 faculty mentorship, continuous academic tracking, career roadmaps, and confidential personal support throughout their undergraduate journey.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
            <div className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
              <span className="text-2xl font-black text-white block">100%</span>
              <span className="text-[11px] text-slate-300 uppercase tracking-wide font-medium">Mentorship Ratio</span>
            </div>
            <div className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
              <span className="text-2xl font-black text-emerald-400 block">1:15</span>
              <span className="text-[11px] text-slate-300 uppercase tracking-wide font-medium">Faculty-Student Ratio</span>
            </div>
            <div className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
              <span className="text-2xl font-black text-cyan-400 block">4 Years</span>
              <span className="text-[11px] text-slate-300 uppercase tracking-wide font-medium">Continuous Guidance</span>
            </div>
            <div className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
              <span className="text-2xl font-black text-amber-400 block">24/7</span>
              <span className="text-[11px] text-slate-300 uppercase tracking-wide font-medium">Student Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Core Counselling Pillars */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Core Pillars of Student Mentorship
          </h3>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            A comprehensive framework designed to nurture academic brilliance, industry-ready engineering skills, and emotional resilience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            const isSelected = activePillar === idx;
            return (
              <div
                key={idx}
                onClick={() => setActivePillar(idx)}
                className={`p-6 rounded-3xl transition-all duration-300 cursor-pointer border ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 border-dhanekula-royal/40 shadow-xl shadow-dhanekula-royal/5 scale-102 ring-1 ring-dhanekula-royal'
                    : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className={`h-12 w-12 rounded-2xl bg-gradient-to-tr ${pillar.color} flex items-center justify-center text-white shadow-md mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white mb-2">
                  {pillar.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* The 4-Step Counselling Workflow */}
      <div className="p-8 md:p-10 rounded-3xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[10px] font-black text-dhanekula-royal uppercase tracking-widest bg-dhanekula-50 dark:bg-dhanekula-950 px-3 py-1 rounded-full border border-dhanekula-200 dark:border-dhanekula-800">
            Systematic Process
          </span>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
            How the Counselling Process Works
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Transparent, structured, and continuous engagement ensuring no student is left behind.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowSteps.map((step, idx) => (
            <div key={idx} className="relative p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <span className="text-3xl font-black text-slate-200 dark:text-slate-700 block">
                {step.step}
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {step.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Mentorship Impact & Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Student-Centric Impact
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Measurable Outcomes Driven by Dedicated Faculty Mentors
            </h3>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Our continuous counselling framework actively identifies learning bottlenecks, provides timely remedial tutorials, and aligns academic projects with real-world electronics and VLSI industry demands.
            </p>
          </div>

          <div className="space-y-3">
            {[
              'Comprehensive multi-session note tracking preserving student history across all semesters',
              'Strict confidentiality ensuring a secure and supportive environment for every mentee',
              'Direct linkage between academic attendance, internal assessments, and remedial coaching',
              'Faculty counsellors coordinate with parents for holistic student development'
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-dhanekula-royal/10 via-emerald-500/5 to-transparent border border-dhanekula-royal/20 space-y-6">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-6 w-6 text-dhanekula-royal" />
            <h4 className="font-black text-slate-900 dark:text-white text-base">
              Department Mentorship Policy
            </h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            The Dhanekula Institute of Engineering and Technology ECE Department adheres to strict NAAC and NBA mentoring standards. Faculty mentors maintain an active log of each counselling discussion, milestones achieved, and follow-ups.
          </p>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span>Average CGPA Improvement Post-Mentoring</span>
              <span className="text-emerald-600 dark:text-emerald-400">+1.2 GPA</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full w-[85%]" />
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-6 pt-4">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Answers to common questions regarding the student counselling and mentorship framework.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-xs text-slate-900 dark:text-white hover:text-dhanekula-royal"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-dhanekula-royal shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-850">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

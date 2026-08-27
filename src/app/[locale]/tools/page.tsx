'use client';

import React, { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import { useAuth } from "@/context/AuthContext";
import { getToolData, saveToolData } from "@/lib/supabase/tools";
import { supabase } from "@/lib/supabase/client"; // Import Supabase client
import { 
  DollarSign,
  TrendingUp,
  FileText,
  BarChart3,
  Filter,
  Target,
  Users,
  SearchCode,
  CheckSquare,
  Loader2,
  Clock,
  ArrowRight,
  Lock,
  ShieldCheck,
  Cloud,
  RefreshCcw,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from 'next-intl';

// Import Kalkulator
import CashflowCalculator from "@/features/cashflow-calculator/data-container";
import GrowthSimulator from "@/features/growth-simulator/data-container";
import SOPGenerator from "@/features/sop-generator/data-container";
import CacLtvCalculator from "@/features/cac-ltv-calculator/data-container";
import FunnelSimulator from "@/features/funnel-simulator/data-container";
import ProductionTargetSimulator from "@/features/production-target-simulator/data-container";
import L10Meeting from "@/features/l10-meeting/data-container";
import PeopleAnalyzer from "@/features/people-analyzer/data-container";

const ToDoTracker = dynamic(() => import("@/features/todo-tracker/data-container"), { ssr: false });

const toolIcons: { [key: string]: React.ReactNode } = {
  "Cashflow Analysis": <DollarSign size={24} />,
  "Growth Simulator": <TrendingUp size={24} />,
  "SOP Generator": <FileText size={24} />,
  "CAC vs LTV": <BarChart3 size={24} />,
  "Funnel Simulator": <Filter size={24} />,
  "Production Target Simulator": <Target size={24} />,
  "Template L10 Meeting": <Users size={24} />,
  "People Analyzer": <SearchCode size={24} />,
  "To-Do Tracker": <CheckSquare size={24} />
};

const toolNameSlugMap: { [key: string]: string } = {
  "Cashflow Analysis": "cashflow-calculator",
  "Growth Simulator": "growth-simulator",
  "SOP Generator": "sop-generator",
  "CAC vs LTV": "cac-ltv-calculator",
  "Funnel Simulator": "funnel-simulator",
  "Production Target Simulator": "production-target-simulator",
  "Template L10 Meeting": "l10-meeting",
  "People Analyzer": "people-analyzer",
  "To-Do Tracker": "todo-tracker"
};

export default function ToolsPage() {
  const t = useTranslations('ToolsPage');
  const tools = t.raw('tools') as { name: string; description: string; status: string; action: string }[];

  const { user, isLoading: isLoadingAuth } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [activeToolSlug, setActiveToolSlug] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<Record<string, unknown> | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [formData, setFormData] = useState({
    nama: "",
    namaBisnis: "",
    sektor: "",
    whatsapp: "",
    tantangan: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    for (const key in formData) {
      if (formData[key as keyof typeof formData].trim() === "") {
        setFormError(t('form.errorAllFields'));
        return;
      }
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Form submitted:", formData);
    setIsSubmitting(false);
    setHasAccess(true);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (user) {
      setTimeout(() => setHasAccess(true), 0);
    }
  }, [user]);

  useEffect(() => {
    const fetchToolData = async () => {
      if (activeToolSlug && user) {
        setIsLoadingData(true);
        setInitialData(null);
        try {
          const data = await getToolData(user, activeToolSlug);
          setInitialData(data);
        } catch (error) {
          console.error("Failed to fetch tool data:", error);
        } finally {
          setIsLoadingData(false);
        }
      } else {
        setInitialData(null);
      }
    };
    fetchToolData();
  }, [activeToolSlug, user?.id]);

  const handleSave = async (data: Record<string, unknown>) => {
    if (!activeToolSlug) return;

    const { data: { user: currentUser } } = await supabase.auth.getUser();

    if (!currentUser) {
      console.warn("Save aborted: No user is currently logged in.");
      setIsSyncing(false);
      return;
    }

    setIsSyncing(true);
    await saveToolData(currentUser, activeToolSlug, data);
    setTimeout(() => setIsSyncing(false), 500);
  };

  useEffect(() => {
    if (user) return;
    let timer: NodeJS.Timeout;
    if (hasAccess && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimeout(() => setIsTimeUp(true), 0);
    }
    return () => clearInterval(timer);
  }, [hasAccess, timeLeft, user]);

  const handleToolClick = (toolName: string, status: string) => {
    if (status === "Pro") {
      alert(t('proToolAlert'));
      return;
    }
    const slug = toolNameSlugMap[toolName];
    setActiveToolSlug(slug);
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  const renderActiveTool = () => {
    if (isLoadingData) {
      return <div className="flex items-center justify-center h-96"><Loader2 className="animate-spin text-slate-700" size={40} /></div>;
    }

    const commonProps = { user, initialData, isSyncing, onSave: handleSave };
    const activeToolName = Object.keys(toolNameSlugMap).find(name => toolNameSlugMap[name] === activeToolSlug);

    switch (activeToolName) {
      case "Cashflow Analysis": return <CashflowCalculator {...commonProps} />;
      case "Growth Simulator": return <GrowthSimulator {...commonProps} />;
      case "SOP Generator": return <SOPGenerator {...commonProps} />;
      case "CAC vs LTV": return <CacLtvCalculator {...commonProps} />;
      case "Funnel Simulator": return <FunnelSimulator {...commonProps} />;
      case "Production Target Simulator": return <ProductionTargetSimulator {...commonProps} />;
      case "Template L10 Meeting": return <L10Meeting {...commonProps} />;
      case "People Analyzer": return <PeopleAnalyzer {...commonProps} />;
      case "To-Do Tracker": return <ToDoTracker {...commonProps} />;
      default: return null;
    }
  };

  if (isLoadingAuth) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-slate-700" size={40} /></div>;
  }

  return (
    <div className={`w-full max-w-none px-4 md:px-8 xl:px-12 flex flex-col items-stretch font-[family-name:var(--font-inter)] min-h-[calc(100vh-64px)] ${activeToolSlug ? 'pt-4 pb-12' : 'py-12'}`}>
      {!activeToolSlug && (
        <div className="mb-12 space-y-4 relative">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-center font-[family-name:var(--font-plus-jakarta)] text-slate-950 dark:text-slate-50">{t('title')}</h1>
          <p className="text-slate-700 dark:text-slate-400 text-center max-w-2xl mx-auto text-lg font-normal">{t('subtitle')}</p>
          {hasAccess && (
            <div className="flex justify-center pt-4 gap-4">
              {user ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} title={isSyncing ? "Sinkronisasi..." : "Data tersimpan di Cloud"} className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                  {isSyncing ? <RefreshCcw size={16} className="text-blue-500 animate-spin" /> : <Cloud size={16} className="text-emerald-600" />}
                </motion.div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-slate-50 font-mono text-sm font-bold border border-slate-200 dark:border-slate-700 shadow-sm">
                  <Clock size={16} className="text-slate-700" />
                  {t('accessTimeLeft', { time: formatTime(timeLeft) })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <div className="relative">
        {activeToolSlug && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
            <button onClick={() => setActiveToolSlug(null)} className="inline-flex items-center gap-2 text-slate-950 dark:text-[#EEEEEE] hover:text-slate-950 dark:hover:text-slate-50 font-bold transition-colors group px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              {t('backToCatalog')}
            </button>
          </motion.div>
        )}
        <AnimatePresence mode="wait">
          {activeToolSlug ? (
            <motion.div key={activeToolSlug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
              {renderActiveTool()}
            </motion.div>
          ) : (
            <>
              {isTimeUp && !user && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto text-center p-12 rounded-[2.5rem] bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 space-y-6 shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-500"><Clock size={32} /></div>
                  <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-500 font-[family-name:var(--font-plus-jakarta)]">{t('sessionOver')}</h2>
                  <p className="text-amber-700 dark:text-amber-500/80 leading-relaxed font-medium">{t('sessionOverMessage')}</p>
                  <Link href="/kontak" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-950 font-bold transition-all hover:opacity-90 active:scale-95">{t('contactTeam')} <ArrowRight size={18} /></Link>
                </motion.div>
              )}
              {!hasAccess && !isTimeUp && (
                <motion.div key="form" initial="hidden" animate="visible" exit="hidden" variants={containerVariants} className="max-w-xl mx-auto mb-20 p-10 md:p-14 rounded-[2.5rem] bg-white/95 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative z-10 shadow-sm">
                  <motion.div variants={itemVariants} className="text-center mb-12 space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto mb-4 text-slate-950 dark:text-slate-50 shadow-sm"><Lock size={24} /></div>
                    <h2 className="text-3xl font-bold font-[family-name:var(--font-plus-jakarta)] text-slate-950 dark:text-slate-50">{t('unlockAccess')}</h2>
                    <p className="text-slate-700 dark:text-slate-400 font-normal">{t('unlockAccessSubtitle')}</p>
                  </motion.div>
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <motion.div variants={itemVariants} className="space-y-2"><label htmlFor="nama" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-700 ml-1">{t('form.fullName')}</label><input id="nama" type="text" value={formData.nama} onChange={handleInputChange} placeholder={t('form.fullNamePlaceholder')} className="w-full px-5 py-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-slate-400 dark:focus:border-slate-500 outline-none transition-all font-medium" required /></motion.div>
                    <motion.div variants={itemVariants} className="space-y-2"><label htmlFor="namaBisnis" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-700 ml-1">{t('form.businessName')}</label><input id="namaBisnis" type="text" value={formData.namaBisnis} onChange={handleInputChange} placeholder={t('form.businessNamePlaceholder')} className="w-full px-5 py-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-slate-400 dark:focus:border-slate-500 outline-none transition-all font-medium" required /></motion.div>
                    <motion.div variants={itemVariants} className="space-y-2"><label htmlFor="sektor" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-700 ml-1">{t('form.sector')}</label><input id="sektor" type="text" value={formData.sektor} onChange={handleInputChange} placeholder={t('form.sectorPlaceholder')} className="w-full px-5 py-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-slate-400 dark:focus:border-slate-500 outline-none transition-all font-medium" required /></motion.div>
                    <motion.div variants={itemVariants} className="space-y-2"><label htmlFor="whatsapp" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-700 ml-1">{t('form.whatsapp')}</label><input id="whatsapp" type="tel" value={formData.whatsapp} onChange={handleInputChange} placeholder={t('form.whatsappPlaceholder')} className="w-full px-5 py-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-slate-400 dark:focus:border-slate-500 outline-none transition-all font-medium" required /></motion.div>
                    <motion.div variants={itemVariants} className="space-y-2"><label htmlFor="tantangan" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-700 ml-1">{t('form.biggestChallenge')}</label><textarea id="tantangan" value={formData.tantangan} onChange={handleInputChange} rows={4} placeholder={t('form.biggestChallengePlaceholder')} className="w-full px-5 py-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-slate-400 dark:focus:border-slate-500 outline-none transition-all resize-none font-medium" required /></motion.div>
                    {formError && <motion.div variants={itemVariants} className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 text-amber-600 dark:text-amber-500 text-sm font-medium shadow-sm">{formError}</motion.div>}
                    <motion.div variants={itemVariants} className="space-y-4">
                      <button type="submit" disabled={isSubmitting} className="w-full py-5 rounded-2xl bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-950 font-bold transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 text-lg">
                        {isSubmitting ? <><Loader2 className="animate-spin" size={24} />{t('form.processing')}</> : <>{t('form.submitButton')} <ArrowRight size={20} /></>}
                      </button>
                      <p className="text-[11px] text-slate-700 text-center font-medium leading-relaxed px-4">{t('form.submitDisclaimer')}</p>
                    </motion.div>
                  </form>
                </motion.div>
              )}
              {hasAccess && (
                <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {tools.map((tool, index) => (
                    <div key={index} onClick={() => handleToolClick(tool.name, tool.status)} className={`p-10 rounded-[2rem] bg-white/90 dark:bg-slate-900/40 aksana-glass border border-slate-200 dark:border-slate-800 transition-all hover:shadow-2xl group relative cursor-pointer ${tool.status === 'Pro' ? 'grayscale-[0.5]' : ''}`}>
                      {tool.status === 'Pro' && (
                        <div className="absolute top-8 right-8 px-3 py-1 rounded-full bg-slate-100/50 dark:bg-slate-50/10 border border-slate-200 dark:border-slate-700 shadow-sm"><p className="text-[10px] font-black tracking-widest text-slate-700 uppercase flex items-center gap-1.5"><ShieldCheck size={10} /> {t('proTag')}</p></div>
                      )}
                      <div className="flex items-center gap-5 mb-8"><div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-950 dark:text-slate-50 group-hover:bg-slate-900 group-hover:text-slate-50 dark:group-hover:bg-slate-50 dark:group-hover:text-slate-950 transition-all duration-500 shadow-sm">{toolIcons[tool.name]}</div><h3 className="font-bold text-xl font-[family-name:var(--font-plus-jakarta)] text-slate-950 dark:text-slate-50">{tool.name}</h3></div>
                      <p className="text-slate-700 dark:text-slate-400 leading-relaxed mb-8 font-normal">{tool.description}</p>
                      <button className="w-full py-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-widest text-slate-950 dark:text-slate-50 group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-slate-50 dark:group-hover:text-slate-950 transition-all shadow-sm">{tool.status === 'Pro' ? t('proAction') : tool.action}</button>
                    </div>
                  ))}
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

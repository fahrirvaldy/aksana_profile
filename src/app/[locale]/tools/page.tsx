"use client";

import React, { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import { supabase } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
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
import CashflowCalculator from "@/components/tools/cashflow-calculator";
import GrowthSimulator from "@/components/tools/growth-simulator";
import SOPGenerator from "@/components/tools/sop-generator";
import CacLtvCalculator from "@/components/tools/cac-ltv-calculator";
import FunnelSimulator from "@/components/tools/funnel-simulator";
import ProductionTargetSimulator from "@/components/tools/production-target-simulator";
import L10Meeting from "@/components/tools/l10-meeting";
import PeopleAnalyzer from "@/components/tools/people-analyzer";

const ToDoTracker = dynamic(() => import("@/components/tools/todo-tracker"), { ssr: false });

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

export default function ToolsPage() {
  const t = useTranslations('ToolsPage');
  const tools = t.raw('tools') as { name: string; description: string; status: string; action: string }[];

  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 menit
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [savedToolData, setSavedToolData] = useState<Record<string, unknown> | null>(null);

  const [formData, setFormData] = useState({
    nama: "",
    namaBisnis: "",
    sektor: "",
    whatsapp: "",
    tantangan: ""
  });

  // 1. Logika Autentikasi
  useEffect(() => {
    const checkUser = async () => {
      setIsLoadingAuth(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUser(user);
        setHasAccess(true); // Bypass formulir untuk Partner
      }
      setIsLoadingAuth(false);
    };

    checkUser();
  }, []);

  // Timer Logic (Hanya untuk Guest)
  useEffect(() => {
    if (user) return; // Matikan timer jika user Pro/Login

    let timer: NodeJS.Timeout;
    if (hasAccess && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimeUp(true);
    }
    return () => clearInterval(timer);
  }, [hasAccess, timeLeft, user]);

  // 2. Logika Simpan Data (History)
  const saveToolState = async (toolName: string, stateData: Record<string, unknown>) => {
    if (!user) {
      alert(t('sessionEndAlert'));
      return;
    }

    setIsSyncing(true);
    try {
      const { error } = await supabase
        .from('user_tools_history')
        .upsert({
          user_id: user.id,
          tool_name: toolName,
          saved_state: stateData,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,tool_name'
        });

      if (error) throw error;
      console.log('Successfully saved tool state to cloud.');
    } catch (error) {
      console.error('Error saving tool state:', error);
    } finally {
      setTimeout(() => setIsSyncing(false), 800); // Simulasi visual sync
    }
  };

  // 3. Logika Ambil Data (Load)
  const loadToolState = async (toolName: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_tools_history')
        .select('saved_state')
        .eq('user_id', user.id)
        .eq('tool_name', toolName)
        .maybeSingle();

      if (error) throw error;
      return data?.saved_state || null;
    } catch (error) {
      console.error('Error loading tool state:', error);
      return null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      const { error } = await supabase
        .from('tool_data_history')
        .insert([
          { 
            nama: formData.nama, 
            whatsapp: formData.whatsapp,
            nama_bisnis: formData.namaBisnis,
            bidang_bisnis: formData.sektor,
            tantangan_utama: formData.tantangan
          }
        ]);

      if (error) throw error;
      setHasAccess(true);
    } catch (error) {
      console.error('Supabase Error:', error);
      const errorMessage = error instanceof Error ? error.message : t('form.genericError');
      setFormError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToolClick = async (toolName: string, status: string) => {
    if (status === "Pro") {
      alert(t('proToolAlert'));
      return;
    }
    
    // Load state jika Pro sebelum membuka alat
    if (user) {
      setIsSyncing(true);
      const savedData = await loadToolState(toolName);
      setSavedToolData(savedData);
      setIsSyncing(false);
    } else {
      setSavedToolData(null);
    }

    setActiveTool(toolName);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-700" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 pt-4 pb-20 min-h-screen font-[family-name:var(--font-inter)]">
      <div className={`mb-16 space-y-4 relative transition-all duration-500 ${activeTool ? 'opacity-0 h-0 overflow-hidden mb-0' : 'opacity-100'}`}>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-center font-[family-name:var(--font-plus-jakarta)] text-slate-950 dark:text-slate-50">{t('title')}</h1>
        <p className="text-slate-700 dark:text-slate-400 text-center max-w-2xl mx-auto text-lg font-normal">
          {t('subtitle')}
        </p>
        
        {hasAccess && (
          <div className="flex justify-center pt-4 gap-4">
            {user ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-slate-50 font-mono text-sm font-bold border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                {isSyncing ? (
                  <RefreshCcw size={16} className="text-blue-500 animate-spin" />
                ) : (
                  <Cloud size={16} className="text-blue-500" />
                )}
                {t('cloudSyncActive')}
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

      <div className="relative">
        {activeTool && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-12"
          >
            <button 
              onClick={() => {
                setActiveTool(null);
                setSavedToolData(null);
              }}
              className="inline-flex items-center gap-2 text-slate-950 dark:text-[#EEEEEE] hover:text-slate-950 dark:hover:text-slate-50 font-bold transition-colors group px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              {t('backToCatalog')}
            </button>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {activeTool ? (
            <motion.div
              key={activeTool}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {activeTool === "Cashflow Analysis" && (
                <CashflowCalculator 
                  user={user ?? undefined}
                  initialData={savedToolData as any}
                  onSave={(data) => saveToolState("Cashflow Analysis", data as any)} 
                  isSyncing={isSyncing} 
                />
              )}
              {activeTool === "Growth Simulator" && (
                <GrowthSimulator 
                  user={user ?? undefined}
                  initialData={savedToolData as any}
                  onSave={(data) => saveToolState("Growth Simulator", data as any)} 
                  isSyncing={isSyncing} 
                />
              )}
              {activeTool === "SOP Generator" && (
                <SOPGenerator 
                  user={user ?? undefined}
                  initialData={savedToolData as any}
                  onSave={(data) => saveToolState("SOP Generator", data as any)} 
                  isSyncing={isSyncing} 
                />
              )}
              {activeTool === "CAC vs LTV" && (
                <CacLtvCalculator 
                  user={user ?? undefined}
                  initialData={savedToolData as any}
                  onSave={(data) => saveToolState("CAC vs LTV", data as any)} 
                  isSyncing={isSyncing} 
                />
              )}
              {activeTool === "Funnel Simulator" && (
                <FunnelSimulator 
                  user={user ?? undefined}
                  initialData={savedToolData as any}
                  onSave={(data) => saveToolState("Funnel Simulator", data as any)} 
                  isSyncing={isSyncing} 
                />
              )}
              {activeTool === "Production Target Simulator" && (
                <ProductionTargetSimulator 
                  user={user ?? undefined}
                  initialData={savedToolData as any}
                  onSave={(data) => saveToolState("Production Target Simulator", data as any)} 
                  isSyncing={isSyncing} 
                />
              )}
              {activeTool === "Template L10 Meeting" && (
                <L10Meeting 
                  user={user ?? undefined}
                  initialData={savedToolData as any}
                  onSave={(data) => saveToolState("Template L10 Meeting", data as any)} 
                  isSyncing={isSyncing} 
                />
              )}
              {activeTool === "People Analyzer" && (
                <PeopleAnalyzer 
                  user={user ?? undefined}
                  initialData={savedToolData as any}
                  onSave={(data) => saveToolState("People Analyzer", data as any)} 
                  isSyncing={isSyncing} 
                />
              )}
              {activeTool === "To-Do Tracker" && (
                <ToDoTracker 
                  user={user ?? undefined}
                  initialData={savedToolData as any}
                  onSave={(data) => saveToolState("To-Do Tracker", data as any)} 
                  isSyncing={isSyncing} 
                />
              )}
            </motion.div>
          ) : (
            <>
              {isTimeUp && !user && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="max-w-2xl mx-auto text-center p-12 rounded-[2.5rem] bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 space-y-6 shadow-sm"
                >
                  <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-500">
                    <Clock size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-500 font-[family-name:var(--font-plus-jakarta)]">{t('sessionOver')}</h2>
                  <p className="text-amber-700 dark:text-amber-500/80 leading-relaxed font-medium">
                    {t('sessionOverMessage')}
                  </p>
                  <Link 
                    href="/kontak" 
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-950 font-bold transition-all hover:opacity-90 active:scale-95"
                  >
                    {t('contactTeam')} <ArrowRight size={18} />
                  </Link>
                </motion.div>
              )}

              {!hasAccess && !isTimeUp && (
                <motion.div 
                  key="form"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={containerVariants}
                  className="max-w-xl mx-auto mb-20 p-10 md:p-14 rounded-[2.5rem] bg-white/95 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative z-10 shadow-sm"
                >
                  <motion.div variants={itemVariants} className="text-center mb-12 space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto mb-4 text-slate-950 dark:text-slate-50 shadow-sm">
                      <Lock size={24} />
                    </div>
                    <h2 className="text-3xl font-bold font-[family-name:var(--font-plus-jakarta)] text-slate-950 dark:text-slate-50">{t('unlockAccess')}</h2>
                    <p className="text-slate-700 dark:text-slate-400 font-normal">{t('unlockAccessSubtitle')}</p>
                  </motion.div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label htmlFor="nama" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-700 ml-1">{t('form.fullName')}</label>
                      <input
                        id="nama"
                        type="text"
                        value={formData.nama}
                        onChange={handleInputChange}
                        placeholder={t('form.fullNamePlaceholder')}
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-slate-400 dark:focus:border-slate-500 outline-none transition-all font-medium"
                        required
                      />
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label htmlFor="namaBisnis" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-700 ml-1">{t('form.businessName')}</label>
                      <input
                        id="namaBisnis"
                        type="text"
                        value={formData.namaBisnis}
                        onChange={handleInputChange}
                        placeholder={t('form.businessNamePlaceholder')}
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-slate-400 dark:focus:border-slate-500 outline-none transition-all font-medium"
                        required
                      />
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2">
                      <label htmlFor="sektor" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-700 ml-1">{t('form.sector')}</label>
                      <input
                        id="sektor"
                        type="text"
                        value={formData.sektor}
                        onChange={handleInputChange}
                        placeholder={t('form.sectorPlaceholder')}
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-slate-400 dark:focus:border-slate-500 outline-none transition-all font-medium"
                        required
                      />
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2">
                      <label htmlFor="whatsapp" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-700 ml-1">{t('form.whatsapp')}</label>
                      <input
                        id="whatsapp"
                        type="tel"
                        value={formData.whatsapp}
                        onChange={handleInputChange}
                        placeholder={t('form.whatsappPlaceholder')}
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-slate-400 dark:focus:border-slate-500 outline-none transition-all font-medium"
                        required
                      />
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2">
                      <label htmlFor="tantangan" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-700 ml-1">{t('form.biggestChallenge')}</label>
                      <textarea
                        id="tantangan"
                        value={formData.tantangan}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder={t('form.biggestChallengePlaceholder')}
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-slate-400 dark:focus:border-slate-500 outline-none transition-all resize-none font-medium"
                        required
                      />
                    </motion.div>

                    {formError && (
                      <motion.div variants={itemVariants} className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 text-amber-600 dark:text-amber-500 text-sm font-medium shadow-sm">
                        {formError}
                      </motion.div>
                    )}

                    <motion.div variants={itemVariants} className="space-y-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-5 rounded-2xl bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-950 font-bold transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="animate-spin" size={24} />
                            {t('form.processing')}
                          </>
                        ) : (
                          <>{t('form.submitButton')} <ArrowRight size={20} /></>
                        )}
                      </button>
                      <p className="text-[11px] text-slate-700 text-center font-medium leading-relaxed px-4">
                        {t('form.submitDisclaimer')}
                      </p>
                    </motion.div>
                  </form>
                </motion.div>
              )}

              {/* TOOLS GRID */}
              {hasAccess && (
                <motion.div 
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {tools.map((tool, index) => (
                    <div 
                      key={index} 
                      onClick={() => handleToolClick(tool.name, tool.status)}
                      className={`p-10 rounded-[2rem] bg-white/90 dark:bg-slate-900/40 aksana-glass border border-slate-200 dark:border-slate-800 transition-all hover:shadow-2xl group relative cursor-pointer ${tool.status === 'Pro' ? 'grayscale-[0.5]' : ''}`}
                    >
                      {tool.status === 'Pro' && (
                        <div className="absolute top-8 right-8 px-3 py-1 rounded-full bg-slate-100/50 dark:bg-slate-50/10 border border-slate-200 dark:border-slate-700 shadow-sm">
                          <p className="text-[10px] font-black tracking-widest text-slate-700 uppercase flex items-center gap-1.5">
                            <ShieldCheck size={10} /> {t('proTag')}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-5 mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-950 dark:text-slate-50 group-hover:bg-slate-900 group-hover:text-slate-50 dark:group-hover:bg-slate-50 dark:group-hover:text-slate-950 transition-all duration-500 shadow-sm">
                          {toolIcons[tool.name]}
                        </div>
                        <h3 className="font-bold text-xl font-[family-name:var(--font-plus-jakarta)] text-slate-950 dark:text-slate-50">{tool.name}</h3>
                      </div>
                      <p className="text-slate-700 dark:text-slate-400 leading-relaxed mb-8 font-normal">
                        {tool.description}
                      </p>
                      <button className="w-full py-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-widest text-slate-950 dark:text-slate-50 group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-slate-50 dark:group-hover:text-slate-950 transition-all shadow-sm">
                        {tool.status === 'Pro' ? t('proAction') : tool.action}
                      </button>
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

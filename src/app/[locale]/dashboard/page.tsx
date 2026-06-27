"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { 
  Loader2, 
  LogOut, 
  DollarSign, 
  TrendingUp, 
  Building2,
  AlertCircle,
  ArrowRight,
  FileSignature,
  Megaphone,
  Filter,
  Package,
  Users,
  Settings,
  PieChart,
  CheckCircle2,
  BarChart3,
  UserCheck,
  ClipboardList
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ToolHistory {
  tool_name: string;
  saved_state: Record<string, unknown>;
}

interface UserData {
  full_name: string;
  role: string;
  companies: {
    name: string;
  } | null;
}

type TabType = 'finance' | 'ops' | 'marketing';

export default function DashboardPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [toolHistory, setToolHistory] = useState<ToolHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('finance');

  useEffect(() => {
    // Redirect to tools catalog as the main dashboard is now hidden
    router.push("/tools");

    const initDashboard = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      try {
        // Fetch Profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, role, companies(name)')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;
        if (profile) {
          const newUserData: UserData = {
            full_name: profile.full_name || '',
            role: profile.role || '',
            companies: profile.companies && profile.companies.length > 0 ? { name: profile.companies[0]?.name || '' } : null
          };
          setUserData(newUserData);
        }

        // Fetch Tools History - Ambil semua 9 alat
        const { data: history, error: historyError } = await supabase
          .from('user_tools_history')
          .select('tool_name, saved_state')
          .eq('user_id', session.user.id);

        if (historyError) throw historyError;
        setToolHistory(history || []);

      } catch (err: unknown) {
        console.error("Dashboard init error:", err);
        const errorMessage = err instanceof Error ? err.message : "Gagal memuat data dashboard. Silakan coba beberapa saat lagi.";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    initDashboard();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const getToolData = useCallback((name: string) => {
    return toolHistory?.find(h => h.tool_name === name)?.saved_state;
  }, [toolHistory]);

  // 1. Data Fetching (Fetch all 9 tools)
  const cashflowData = useMemo(() => getToolData('Cashflow Analysis'), [getToolData]);
  const growthData = useMemo(() => getToolData('Growth Simulator'), [getToolData]);
  const sopData = useMemo(() => getToolData('SOP Generator'), [getToolData]);
  const cacLtvData = useMemo(() => getToolData('CAC vs LTV'), [getToolData]);
  const funnelData = useMemo(() => getToolData('Funnel Simulator'), [getToolData]);
  const productionData = useMemo(() => getToolData('Production Target Simulator'), [getToolData]);
  const l10Data = useMemo(() => getToolData('Template L10 Meeting'), [getToolData]);
  const peopleData = useMemo(() => getToolData('People Analyzer'), [getToolData]);
  const todoData = useMemo(() => getToolData('Todo Tracker'), [getToolData]);

  // 3. Implementasi: useMemo untuk kalkulasi & Optional Chaining untuk keamanan
  
  // Finance & Growth Metrics
  const cashflowMetrics = useMemo(() => {
    if (!cashflowData?.records || !Array.isArray(cashflowData.records) || cashflowData.records.length === 0) {
      return cashflowData?.initialBalance || 0;
    }
    return cashflowData.records[cashflowData.records.length - 1]?.balance || 0;
  }, [cashflowData]);

  const growthMetrics = useMemo(() => {
    interface GrowthMetrics {
      leads?: number;
      conv?: number;
      trans?: number;
      sale?: number;
      margin?: number;
    }
    const calculateProfit = (metrics: GrowthMetrics | null) => {
      if (!metrics) return 0;
      const leads = metrics.leads || 0;
      const conv = metrics.conv || 0;
      const trans = metrics.trans || 0;
      const sale = metrics.sale || 0;
      const margin = metrics.margin || 0;

      const customers = Math.floor(leads * (conv / 100));
      const revenue = customers * trans * sale;
      return revenue * (margin / 100);
    };

    return {
      current: calculateProfit(growthData?.current as GrowthMetrics | null),
      target: calculateProfit(growthData?.target as GrowthMetrics | null)
    };
  }, [growthData]);

  const cacLtvMetrics = useMemo(() => {
    const data = cacLtvData;
    const adSpend = (data?.adSpend as number) || 0;
    const opsCost = (data?.opsCost as number) || 0;
    const newCustomers = (data?.newCustomers as number) || 1;
    const aov = (data?.aov as number) || 0;
    const frequency = (data?.frequency as number) || 0;
    const lifespan = (data?.lifespan as number) || 0;
    const margin = (data?.margin as number) || 0;

    const cac = (adSpend + opsCost) / (newCustomers || 1);
    const ltv = aov * frequency * lifespan * (margin / 100);
    const ratio = ltv / (cac || 1);

    return { cac, ltv, ratio };
  }, [cacLtvData]);

  // Ops & Team Metrics
  const l10Metrics = useMemo(() => {
    const data = l10Data;
    if (!data || !(data.ratings as any)) return { rating: 0, issues: 0 };
    
    const ratings = Object.entries(data.ratings as any)
      .filter(([idx]) => (data.attendance as any)?.[parseInt(idx)])
      .map(([, val]) => val as number);
    
    const ratingValue = ratings.length === 0 ? 0 : (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
    
    return { 
      rating: ratingValue, 
      issues: (data.idsSession as any)?.manualIssues?.length || 0
    };
  }, [l10Data]);

  const peopleMetrics = useMemo(() => {
    const members = (peopleData?.members as any[]) || [];
    if (members.length === 0) return { avgFit: 0, count: 0 };

    interface Member {
      values?: { [key: string]: string };
      gwc?: { get?: string; want?: string; capacity?: string };
    }
    
    const totalFit = members.reduce((acc: number, member: Member) => {
      const valuesCount = Object.values(member.values || {}).filter(v => v === '+').length;
      const gwcCount = [member.gwc?.get, member.gwc?.want, member.gwc?.capacity].filter(v => v === 'yes').length;
      return acc + (valuesCount + gwcCount);
    }, 0);

    const maxPoints = members.length * ( ((peopleData?.coreValues as any[])?.length || 0) + 3);
    return {
      avgFit: maxPoints > 0 ? (totalFit / maxPoints) * 100 : 0,
      count: members.length
    };
  }, [peopleData]);

  const todoMetrics = useMemo(() => {
    interface Task {
      status: string;
    }
    const tasks = (todoData?.tasks as any[]) || [];
    const completed = tasks.filter((t: Task) => t.status === 'done').length;
    return {
      total: tasks.length,
      completed,
      progress: tasks.length > 0 ? (completed / tasks.length) * 100 : 0
    };
  }, [todoData]);

  // Marketing & Production Metrics
  const funnelMetrics = useMemo(() => {
    const data = funnelData?.inputs as any;
    const impressions = ((data?.budget || 0) / (data?.cpm || 1)) * 1000;
    const clicks = impressions * ((data?.ctr || 0) / 100);
    const visitors = clicks * ((data?.visit || 0) / 100);
    const atcs = visitors * ((data?.atc || 0) / 100);
    const purchases = atcs * ((data?.checkout || 0) / 100);
    const revenue = purchases * (data?.aov || 0);
    const roas = revenue / (data?.budget || 1);

    return {
      impressions, clicks, visitors, atcs, purchases, revenue, roas
    };
  }, [funnelData]);

  const productionMetrics = useMemo(() => {
    const data = productionData as any;
    if (!data) return null;

    const salesArray = (data.salesInput || "")
      .split(',')
      .map((s: string) => parseFloat(s.trim()))
      .filter((n: number) => !isNaN(n));

    if (salesArray.length < 2) return null;

    const sum = salesArray.reduce((a: number, b: number) => a + b, 0);
    const meanMonthly = sum / salesArray.length;
    const varianceMonthly = salesArray.reduce((a: number, b: number) => a + Math.pow(b - meanMonthly, 2), 0) / (salesArray.length - 1);
    const stdDevMonthly = Math.sqrt(varianceMonthly);
    const avgDailySales = meanMonthly / 30;
    const stdDevDaily = stdDevMonthly / Math.sqrt(30);
    const zScore = data.category === 'magnet' ? 2.05 : 1.28;
    const safetyStock = zScore * stdDevDaily * Math.sqrt(data.leadTime || 0);
    const rop = (avgDailySales * (data.leadTime || 0)) + safetyStock;
    const targetProduction = Math.max(0, (rop + (avgDailySales * (data.leadTime || 0))) - (data.stock || 0));

    return {
      avgDailySales, safetyStock, rop, targetProduction,
      isAlert: (data.stock || 0) <= rop
    };
  }, [productionData]);

  // Executive Summary Panel (Total Cash, ROAS, Progres Tugas)
  const executiveSummary = useMemo(() => {
    return {
      totalRoas: funnelMetrics.roas || 0,
      totalCash: cashflowMetrics || 0,
      taskProgress: todoMetrics.progress || 0
    };
  }, [funnelMetrics.roas, cashflowMetrics, todoMetrics.progress]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('id-ID').format(Math.floor(val));
  };

  const tabVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.2 }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-700" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-10 min-h-screen font-[family-name:var(--font-inter)] space-y-10">
      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 flex items-center gap-3 text-amber-600 dark:text-amber-500 shadow-sm">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold tracking-tight font-[family-name:var(--font-plus-jakarta)]"
          >
            Dashboard <span className="text-slate-700 dark:text-slate-700">Aksana</span>
          </motion.h1>
          <div className="flex items-center gap-2 text-slate-950 dark:text-slate-50 font-medium text-sm">
            <Building2 size={16} />
            <span>{userData?.companies?.name || "Aksana Executive"}</span>
            <span className="mx-2 text-slate-300">•</span>
            <span className="text-emerald-500 font-bold uppercase text-[10px] tracking-widest">Partner Mode</span>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-black dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm aksana-glass"
        >
          <LogOut size={16} />
          Keluar Sesi
        </button>
      </div>

      {/* Executive Summary Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="p-6 rounded-[2rem] aksana-glass border border-black dark:border-slate-800 flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <DollarSign size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1">Total Cash</p>
            <h4 className="text-3xl font-bold font-[family-name:var(--font-plus-jakarta)]">{formatCurrency(executiveSummary.totalCash)}</h4>
          </div>
        </div>
        <div className="p-6 rounded-[2rem] aksana-glass border border-black dark:border-slate-800 flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1">Total ROAS</p>
            <h4 className="text-3xl font-bold font-[family-name:var(--font-plus-jakarta)]">{executiveSummary.totalRoas.toFixed(2)}x</h4>
          </div>
        </div>
        <div className="p-6 rounded-[2rem] aksana-glass border border-black dark:border-slate-800 flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1">Progres Tugas</p>
            <h4 className="text-3xl font-bold font-[family-name:var(--font-plus-jakarta)]">{executiveSummary.taskProgress.toFixed(0)}%</h4>
          </div>
        </div>
      </motion.div>

      {/* 2. Struktur Tab (Grouping 9 Alat) */}
      <div className="flex justify-center overflow-x-auto py-2">
        <div className="p-1.5 rounded-2xl bg-slate-100/50 dark:bg-slate-900/50 aksana-glass border border-black dark:border-slate-800 flex gap-1 shadow-sm">
          {[
            { id: 'finance', label: 'Finance & Growth', icon: PieChart },
            { id: 'ops', label: 'Ops & Team', icon: Settings },
            { id: 'marketing', label: 'Marketing & Production', icon: Megaphone },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeTab === tab.id 
                ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-md' 
                : 'text-slate-950 hover:text-slate-950 dark:hover:text-slate-300'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content with AnimatePresence */}
      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          {activeTab === 'finance' && (
            <motion.div 
              key="finance"
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {/* Tool 1: Cashflow Analysis */}
              <div className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900/40 aksana-glass border border-black dark:border-slate-800 space-y-8 relative overflow-hidden group shadow-sm">
                <div className="flex justify-between items-start relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <DollarSign size={24} />
                  </div>
                  <span className="text-[10px] font-black tracking-widest text-slate-700 uppercase">Cashflow Analysis</span>
                </div>
                <div className="space-y-1 relative z-10">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">Saldo Terakhir</p>
                  <h3 className="text-4xl font-bold font-[family-name:var(--font-plus-jakarta)]">
                    {formatCurrency(cashflowMetrics)}
                  </h3>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                  <DollarSign size={160} />
                </div>
              </div>

              {/* Tool 2: Growth Simulator */}
              <div className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900/40 aksana-glass border border-black dark:border-slate-800 space-y-8 relative overflow-hidden group shadow-sm">
                <div className="flex justify-between items-start relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <TrendingUp size={24} />
                  </div>
                  <span className="text-[10px] font-black tracking-widest text-slate-700 uppercase">Growth Simulator</span>
                </div>
                <div className="space-y-1 relative z-10">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">Target Profit Proyeksi</p>
                  <h3 className="text-4xl font-bold font-[family-name:var(--font-plus-jakarta)]">
                    {formatCurrency(growthMetrics.target)}
                  </h3>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                  <TrendingUp size={160} />
                </div>
              </div>

              {/* Tool 3: CAC vs LTV */}
              <div className="md:col-span-2 p-10 rounded-[2.5rem] bg-white dark:bg-slate-900/40 aksana-glass border border-black dark:border-slate-800 space-y-8 relative overflow-hidden group shadow-sm">
                <div className="flex justify-between items-start relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                    <BarChart3 size={24} />
                  </div>
                  <span className="text-[10px] font-black tracking-widest text-slate-700 uppercase">CAC vs LTV</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center relative z-10">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">LTV : CAC Ratio</p>
                    <div className="flex items-baseline gap-4">
                      <h3 className="text-5xl font-bold font-[family-name:var(--font-plus-jakarta)]">
                        {cacLtvMetrics.ratio.toFixed(1)}x
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        cacLtvMetrics.ratio > 3 ? 'bg-emerald-500/10 text-emerald-500' : 
                        cacLtvMetrics.ratio > 1.1 ? 'bg-amber-500/10 text-amber-500' : 
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {cacLtvMetrics.ratio > 3 ? 'SEHAT' : cacLtvMetrics.ratio > 1.1 ? 'WAJAR' : 'RUGI'}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                      <p className="text-[10px] font-black text-slate-700 uppercase">CAC</p>
                      <p className="text-lg font-bold">{formatCurrency(cacLtvMetrics.cac)}</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                      <p className="text-[10px] font-black text-slate-700 uppercase">LTV</p>
                      <p className="text-lg font-bold">{formatCurrency(cacLtvMetrics.ltv)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'ops' && (
            <motion.div 
              key="ops"
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {/* Tool 4: SOP Generator */}
              <div className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900/40 aksana-glass border border-black dark:border-slate-800 space-y-8 relative overflow-hidden group shadow-sm">
                <div className="flex justify-between items-start relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <FileSignature size={24} />
                  </div>
                  <span className="text-[10px] font-black tracking-widest text-slate-700 uppercase">SOP Generator</span>
                </div>
                <div className="space-y-4 relative z-10">
                  {sopData ? (
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">SOP Terakhir</p>
                        <h4 className="text-xl font-bold line-clamp-1">{Object.values((sopData?.formData as any) || {})[0] as string || "Untitled"}</h4>
                        <p className="text-[10px] text-slate-700 uppercase font-bold">Divisi: {sopData?.division as string}</p>
                      </div>
                      <Link href="/tools" className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 hover:bg-slate-900 dark:hover:bg-slate-50 hover:text-white dark:hover:text-slate-950 transition-all">
                        <ArrowRight size={20} />
                      </Link>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-700 italic">Belum ada SOP yang dibuat.</p>
                  )}
                </div>
              </div>

              {/* Tool 5: Template L10 Meeting */}
              <div className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900/40 aksana-glass border border-black dark:border-slate-800 space-y-8 relative overflow-hidden group shadow-sm">
                <div className="flex justify-between items-start relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                    <Users size={24} />
                  </div>
                  <span className="text-[10px] font-black tracking-widest text-slate-700 uppercase">L10 Meeting</span>
                </div>
                <div className="grid grid-cols-2 gap-4 relative z-10">
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                    <p className="text-[10px] font-black text-slate-700 uppercase">Rating Rapat</p>
                    <h4 className="text-3xl font-bold text-blue-600">{l10Metrics.rating}/10</h4>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                    <p className="text-[10px] font-black text-slate-700 uppercase">Isu Pending</p>
                    <h4 className="text-3xl font-bold text-rose-500">{l10Metrics.issues}</h4>
                  </div>
                </div>
              </div>

              {/* Tool 6: People Analyzer */}
              <div className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900/40 aksana-glass border border-black dark:border-slate-800 space-y-8 relative overflow-hidden group shadow-sm">
                <div className="flex justify-between items-start relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <UserCheck size={24} />
                  </div>
                  <span className="text-[10px] font-black tracking-widest text-slate-700 uppercase">People Analyzer</span>
                </div>
                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">Kesesuaian Budaya</p>
                      <h4 className="text-3xl font-bold">{peopleMetrics.avgFit.toFixed(0)}%</h4>
                    </div>
                    <p className="text-[10px] font-bold text-slate-700 uppercase">{peopleMetrics.count} Anggota Tim</p>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${peopleMetrics.avgFit}%` }}
                      className="h-full bg-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Tool 7: Todo Tracker */}
              <div className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900/40 aksana-glass border border-black dark:border-slate-800 space-y-8 relative overflow-hidden group shadow-sm">
                <div className="flex justify-between items-start relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <ClipboardList size={24} />
                  </div>
                  <span className="text-[10px] font-black tracking-widest text-slate-700 uppercase">Todo Tracker</span>
                </div>
                <div className="grid grid-cols-2 gap-4 relative z-10">
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                    <p className="text-[10px] font-black text-slate-700 uppercase">Selesai</p>
                    <h4 className="text-3xl font-bold text-emerald-500">{todoMetrics.completed}/{todoMetrics.total}</h4>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                    <p className="text-[10px] font-black text-slate-700 uppercase">Progres</p>
                    <h4 className="text-3xl font-bold text-indigo-500">{todoMetrics.progress.toFixed(0)}%</h4>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'marketing' && (
            <motion.div 
              key="marketing"
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-8"
            >
              {/* Tool 8: Funnel Simulator */}
              <div className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900/40 aksana-glass border border-black dark:border-slate-800 space-y-10 relative overflow-hidden group shadow-sm">
                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                      <Filter size={28} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold font-[family-name:var(--font-plus-jakarta)]">Funnel Simulator</h3>
                      <p className="text-[10px] font-black tracking-widest text-slate-700 uppercase">Arsitektur Konversi</p>
                    </div>
                  </div>
                  <div className="px-5 py-2.5 rounded-full border bg-emerald-500/10 border-emerald-500/20 text-emerald-500 text-sm font-black tracking-widest shadow-sm">
                    {funnelMetrics.roas.toFixed(2)}x ROAS
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 relative z-10">
                  {[
                    { label: 'Impresi', val: funnelMetrics.impressions },
                    { label: 'Klik', val: funnelMetrics.clicks },
                    { label: 'Visit', val: funnelMetrics.visitors },
                    { label: 'ATC', val: funnelMetrics.atcs },
                    { label: 'Sales', val: funnelMetrics.purchases },
                  ].map((step, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-700/50 space-y-1 shadow-sm">
                      <p className="text-[10px] font-black text-slate-700 uppercase">{step.label}</p>
                      <h4 className="text-xl font-bold font-mono">{formatNumber(step.val)}</h4>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tool 9: Production Target Simulator */}
              <div className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900/40 aksana-glass border border-black dark:border-slate-800 space-y-8 relative overflow-hidden group shadow-sm">
                <div className="flex justify-between items-start relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                    <Package size={24} />
                  </div>
                  <span className="text-[10px] font-black tracking-widest text-slate-700 uppercase">Production Simulator</span>
                </div>
                {productionMetrics ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                      <p className="text-[10px] font-black text-slate-700 uppercase">Target Produksi</p>
                      <h4 className="text-2xl font-bold">{formatNumber(productionMetrics.targetProduction)} Unit</h4>
                    </div>
                    <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                      <p className="text-[10px] font-black text-slate-700 uppercase">Re-order Point</p>
                      <h4 className="text-2xl font-bold">{formatNumber(productionMetrics.rop)} Unit</h4>
                    </div>
                    <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                      <p className="text-[10px] font-black text-slate-700 uppercase">Safety Stock</p>
                      <h4 className="text-2xl font-bold">{formatNumber(productionMetrics.safetyStock)} Unit</h4>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-700 italic relative z-10">Belum ada data produksi.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer / CTA */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-10 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800/30 border border-black dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm"
      >
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-xl font-bold font-[family-name:var(--font-plus-jakarta)]">Ruang Strategi & Simulasi</h3>
          <p className="text-sm text-slate-700 dark:text-slate-400 font-medium">Semua data disinkronkan otomatis dari sesi simulasi Anda.</p>
        </div>
        <Link 
          href="/tools"
          className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-950 font-bold transition-all hover:opacity-90 active:scale-95 group"
        >
          Buka Alat Simulasi <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </div>
  );
}

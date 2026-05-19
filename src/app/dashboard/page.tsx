"use client";

import React, { useEffect, useState } from "react";
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
  ShieldCheck,
  Zap,
  FileSignature,
  Download,
  BarChart3,
  Megaphone,
  Filter,
  Package,
  Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ToolHistory {
  tool_name: string;
  saved_state: any;
}

interface UserData {
  full_name: string;
  role: string;
  companies: {
    name: string;
  } | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [toolHistory, setToolHistory] = useState<ToolHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
        setUserData(profile as any);

        // Fetch Tools History
        const { data: history, error: historyError } = await supabase
          .from('user_tools_history')
          .select('tool_name, saved_state')
          .eq('user_id', session.user.id);

        if (historyError) throw historyError;
        setToolHistory(history || []);

      } catch (err: any) {
        console.error("Dashboard init error:", err);
        setError("Gagal memuat data dashboard. Silakan coba beberapa saat lagi.");
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

  const getToolData = (name: string) => {
    return toolHistory.find(h => h.tool_name === name)?.saved_state;
  };

  const cashflowData = getToolData('Cashflow Analysis');
  const growthData = getToolData('Growth Simulator');
  const sopData = getToolData('SOP Generator');
  const cacLtvData = getToolData('CAC vs LTV');
  const funnelData = getToolData('Funnel Simulator');
  const productionData = getToolData('Production Target Simulator');
  const l10Data = getToolData('Template L10 Meeting');

  const calculateL10Metrics = (data: any) => {
    if (!data || !data.ratings) return null;
    const ratings = Object.entries(data.ratings)
      .filter(([idx]) => data.attendance?.[parseInt(idx)])
      .map(([, val]) => val as number);
    
    if (ratings.length === 0) return 0;
    return (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
  };

  const calculateProductionMetrics = (data: any) => {
    if (!data) return null;

    const salesArray = (data.salesInput || "")
      .split(',')
      .map((s: string) => parseFloat(s.trim()))
      .filter((n: number) => !isNaN(n));

    if (salesArray.length < 2) return null;

    // Monthly Calculations
    const sum = salesArray.reduce((a: number, b: number) => a + b, 0);
    const meanMonthly = sum / salesArray.length;
    
    const varianceMonthly = salesArray.reduce((a: number, b: number) => a + Math.pow(b - meanMonthly, 2), 0) / (salesArray.length - 1);
    const stdDevMonthly = Math.sqrt(varianceMonthly);

    // Daily Calculations
    const avgDailySales = meanMonthly / 30;
    const stdDevDaily = stdDevMonthly / Math.sqrt(30);

    // Constants
    const zScore = data.category === 'magnet' ? 2.05 : 1.28;

    // Safety Stock & ROP
    const safetyStock = zScore * stdDevDaily * Math.sqrt(data.leadTime || 0);
    const rop = (avgDailySales * (data.leadTime || 0)) + safetyStock;

    // Target Production
    const targetProduction = Math.max(0, (rop + (avgDailySales * (data.leadTime || 0))) - (data.stock || 0));

    return {
      avgDailySales,
      safetyStock,
      rop,
      targetProduction,
      isAlert: (data.stock || 0) <= rop
    };
  };

  const calculateMarketingHealth = (data: any) => {
    const adSpend = data?.adSpend || 0;
    const opsCost = data?.opsCost || 0;
    const newCustomers = data?.newCustomers || 1;
    const aov = data?.aov || 0;
    const frequency = data?.frequency || 0;
    const lifespan = data?.lifespan || 0;
    const margin = data?.margin || 0;

    const cac = (adSpend + opsCost) / newCustomers;
    const ltv = aov * frequency * lifespan * (margin / 100);
    const ratio = ltv / (cac || 1);

    return { cac, ltv, ratio };
  };

  const calculateFunnelMetrics = (data: any) => {
    const impressions = ((data?.budget || 0) / (data?.cpm || 1)) * 1000;
    const clicks = impressions * ((data?.ctr || 0) / 100);
    const visitors = clicks * ((data?.visit || 0) / 100);
    const atcs = visitors * ((data?.atc || 0) / 100);
    const purchases = atcs * ((data?.checkout || 0) / 100);
    const revenue = purchases * (data?.aov || 0);
    const roas = revenue / (data?.budget || 1);

    return {
      impressions,
      clicks,
      visitors,
      atcs,
      purchases,
      revenue,
      roas
    };
  };

  const { cac, ltv, ratio } = calculateMarketingHealth(cacLtvData);
  const funnelMetrics = calculateFunnelMetrics(funnelData?.inputs);
  const prodMetrics = calculateProductionMetrics(productionData);
  const l10Rating = calculateL10Metrics(l10Data);

  const exportSOP = (data: any) => {
    if (!data || !data.formData) return;
    
    const divName = data.division || "SOP";
    const title = (Object.values(data.formData)[0] as string) || "Dokumen_SOP";
    
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${title}</title></head>
      <body>
        <h1 style='text-align:center;'>STANDARD OPERATING PROCEDURE</h1>
        <h2 style='text-align:center;'>Divisi: ${divName}</h2>
        <hr>
        <table border='1' style='width:100%; border-collapse:collapse;'>
          ${Object.entries(data.formData).map(([key, value]) => `
            <tr>
              <td style='padding:10px; background-color:#f3f4f6; font-weight:bold; width:30%;'>${key}</td>
              <td style='padding:10px;'>${(value as string).replace(/\n/g, '<br>')}</td>
            </tr>
          `).join('')}
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '_')}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Helper for Growth Calculation
  const calculateProfit = (metrics: any) => {
    if (!metrics) return 0;
    const leads = metrics.leads || 0;
    const conv = metrics.conv || 0;
    const trans = metrics.trans || 0;
    const sale = metrics.sale || 0;
    const margin = metrics.margin || 0;

    const customers = Math.floor(leads * (conv / 100));
    const revenue = customers * trans * sale;
    const profit = revenue * (margin / 100);
    return profit;
  };

  const currentProfit = calculateProfit(growthData?.current);
  const targetProfit = calculateProfit(growthData?.target);

  // Helper for Cashflow Health
  const getLastBalance = () => {
    if (!cashflowData?.records || cashflowData.records.length === 0) {
      return cashflowData?.initialBalance || 0;
    }
    return cashflowData.records[cashflowData.records.length - 1].balance;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('id-ID').format(Math.floor(val));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-20 min-h-screen font-[family-name:var(--font-inter)]">
      {error && (
        <div className="mb-8 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 flex items-center gap-3 text-amber-600 dark:text-amber-500">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold tracking-tight font-[family-name:var(--font-plus-jakarta)]"
          >
            Selamat Datang kembali, <span className="text-slate-400 dark:text-slate-500">{userData?.full_name?.split(' ')[0] || "Partner"}</span>
          </motion.h1>
          <div className="flex items-center gap-3">
            <div className="px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <Building2 size={14} className="text-slate-500" />
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-[0.2em]">
                {userData?.companies?.name || "Aksana Executive"}
              </span>
            </div>
            <div className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
              <ShieldCheck size={14} className="text-amber-500" />
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-[0.2em]">
                Partner Mode
              </span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm font-bold text-slate-600 dark:text-slate-400 shadow-sm"
        >
          <LogOut size={18} />
          Keluar Sesi
        </button>
      </div>

      {/* Executive Cockpit Grid */}
      <AnimatePresence>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-8"
        >
          {/* Pilar 1: Kesehatan Kas */}
          <motion.div 
            variants={itemVariants}
            className="p-10 rounded-3xl bg-white dark:bg-slate-900/40 aksana-glass border border-slate-100 dark:border-slate-800 shadow-xl space-y-8 relative overflow-hidden group"
          >
            <div className="flex justify-between items-start relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <DollarSign size={24} />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Kesehatan Kas</span>
                <div className="h-1 w-12 bg-emerald-500/20 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-emerald-500 w-2/3"></div>
                </div>
              </div>
            </div>
            <div className="space-y-1 relative z-10">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Saldo Terakhir</p>
              <h3 className="text-4xl font-bold font-[family-name:var(--font-plus-jakarta)]">
                {formatCurrency(getLastBalance())}
              </h3>
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic relative z-10">
              *Berdasarkan input simulasi Cashflow Analysis terbaru Anda.
            </p>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
              <DollarSign size={160} />
            </div>
          </motion.div>

          {/* Pilar 2: Proyeksi Growth */}
          <motion.div 
            variants={itemVariants}
            className="p-10 rounded-3xl bg-white dark:bg-slate-900/40 aksana-glass border border-slate-100 dark:border-slate-800 shadow-xl space-y-8 relative overflow-hidden group"
          >
            <div className="flex justify-between items-start relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <TrendingUp size={24} />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Proyeksi Growth</span>
                <div className="h-1 w-12 bg-blue-500/20 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-blue-500 w-3/4"></div>
                </div>
              </div>
            </div>
            <div className="space-y-1 relative z-10">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Target Profit</p>
              <h3 className="text-4xl font-bold font-[family-name:var(--font-plus-jakarta)]">
                {formatCurrency(targetProfit)}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 relative z-10 bg-emerald-500/10 w-fit px-2 py-0.5 rounded-full">
              <Zap size={10} /> TEROPTIMASI
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
              <TrendingUp size={160} />
            </div>
          </motion.div>

          {/* Pilar 3: SOP Monitor */}
          <motion.div 
            variants={itemVariants}
            className="p-10 rounded-3xl bg-white dark:bg-slate-900/40 aksana-glass border border-slate-100 dark:border-slate-800 shadow-xl space-y-8 relative overflow-hidden group"
          >
            <div className="flex justify-between items-start relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <FileSignature size={24} />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">SOP Monitor</span>
                <div className="h-1 w-12 bg-amber-500/20 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-amber-500 w-1/2"></div>
                </div>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              {!sopData ? (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-slate-500">Belum ada sistem SOP yang dibuat</p>
                  <Link 
                    href="/tools" 
                    className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-all shadow-lg"
                  >
                    Buat Sistem Operasional
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">SOP Terakhir</p>
                      <h3 className="text-2xl font-bold font-[family-name:var(--font-plus-jakarta)] line-clamp-1">
                        {Object.values(sopData?.formData || {})[0] as string || "Tanpa Nama"}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Divisi: {sopData?.division}
                      </p>
                    </div>
                    <button 
                      onClick={() => exportSOP(sopData)}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                      title="Download SOP"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                    <ShieldCheck size={10} className="text-emerald-500" /> 
                    Terbit: {sopData?.createdAt ? new Date(sopData.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                  </div>
                </div>
              )}
            </div>

            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
              <FileSignature size={160} />
            </div>
          </motion.div>

          {/* Pilar 4: Marketing Health */}
          <motion.div 
            variants={itemVariants}
            className="p-10 rounded-3xl bg-white dark:bg-slate-900/40 aksana-glass border border-slate-100 dark:border-slate-800 shadow-xl space-y-8 relative overflow-hidden group"
          >
            <div className="flex justify-between items-start relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                <Megaphone size={24} />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Efisiensi Iklan</span>
                <div className="h-1 w-12 bg-indigo-500/20 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${Math.min((ratio/5)*100, 100)}%` }}></div>
                </div>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              {!cacLtvData ? (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-slate-500">Belum ada data iklan</p>
                  <Link 
                    href="/tools" 
                    className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-all shadow-lg"
                  >
                    Analisis Iklan
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">LTV : CAC Ratio</p>
                    <div className="flex items-baseline gap-3">
                      <h3 className="text-4xl font-bold font-[family-name:var(--font-plus-jakarta)]">
                        {ratio.toFixed(1)}x
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        ratio > 3 ? 'bg-emerald-500/10 text-emerald-500' : 
                        ratio > 1.1 ? 'bg-amber-500/10 text-amber-500' : 
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {ratio > 3 ? 'SEHAT' : ratio > 1.1 ? 'WAJAR' : 'RUGI'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-bold text-slate-500">
                      CAC: <span className="text-slate-700 dark:text-slate-300">{formatCurrency(cac)}</span>
                    </p>
                    <p className="text-[10px] font-bold text-slate-500">
                      LTV: <span className="text-slate-700 dark:text-slate-300">{formatCurrency(ltv)}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
              <Megaphone size={160} />
            </div>
          </motion.div>

          {/* Pilar 5: Funnel Conversion Architecture */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-2 p-10 rounded-3xl bg-white dark:bg-slate-900/40 aksana-glass border border-slate-100 dark:border-slate-800 shadow-xl space-y-10 relative overflow-hidden group"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <Filter size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-[family-name:var(--font-plus-jakarta)]">Arsitektur Konversi Marketing (Funnel)</h3>
                  <p className="text-sm text-slate-500 font-medium">Visualisasi aliran trafik dan efisiensi konversi setiap tahap.</p>
                </div>
              </div>
              {funnelData && (
                <div className={`px-5 py-2.5 rounded-full border text-sm font-black tracking-widest ${
                  funnelMetrics.roas >= 3 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 
                  funnelMetrics.roas >= 1.5 ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 
                  'bg-rose-500/10 border-rose-500/20 text-rose-500'
                }`}>
                  {funnelMetrics.roas.toFixed(2)}x ROAS
                </div>
              )}
            </div>

            <div className="relative z-10">
              {!funnelData ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-6 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem]">
                  <p className="text-slate-500 font-medium max-w-xs">Belum ada simulasi funnel marketing yang disimpan</p>
                  <Link 
                    href="/tools" 
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 text-sm font-bold hover:opacity-90 transition-all shadow-xl active:scale-95"
                  >
                    Mulai Simulasi Funnel
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
                  {[
                    { label: 'Impresi', sub: 'Ads Reach', val: funnelMetrics.impressions, color: 'bg-slate-400/10 text-slate-400' },
                    { label: 'Klik Tautan', sub: `${funnelData.inputs?.ctr || 0}% CTR`, val: funnelMetrics.clicks, color: 'bg-blue-500/10 text-blue-500' },
                    { label: 'Kunjungan', sub: `${funnelData.inputs?.visit || 0}% Visit`, val: funnelMetrics.visitors, color: 'bg-indigo-500/10 text-indigo-500' },
                    { label: 'Add To Cart', sub: `${funnelData.inputs?.atc || 0}% ATC`, val: funnelMetrics.atcs, color: 'bg-violet-500/10 text-violet-500' },
                    { label: 'Sales', sub: `${funnelData.inputs?.checkout || 0}% CR`, val: funnelMetrics.purchases, color: 'bg-emerald-500/10 text-emerald-500' },
                  ].map((step, idx) => (
                    <div key={idx} className="relative group/step">
                      <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100/50 dark:border-slate-700/50 space-y-3 transition-all group-hover/step:bg-white dark:group-hover/step:bg-slate-800 shadow-sm">
                        <div className={`w-8 h-8 rounded-lg ${step.color} flex items-center justify-center text-[10px] font-black`}>
                          0{idx + 1}
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{step.label}</p>
                          <h4 className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">{formatNumber(step.val)}</h4>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded w-fit">{step.sub}</p>
                      </div>
                      {idx < 4 && (
                        <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-20 text-slate-200 dark:text-slate-700">
                          <ArrowRight size={16} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="absolute -right-12 -bottom-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
              <Package size={320} />
            </div>
          </motion.div>

          {/* Pilar 7: Executive Meeting Monitor (L10) */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-2 p-10 rounded-3xl bg-white dark:bg-slate-900/40 aksana-glass border border-slate-100 dark:border-slate-800 shadow-xl space-y-10 relative overflow-hidden group"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Users size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-[family-name:var(--font-plus-jakarta)]">Status Rapat Mingguan (L10)</h3>
                  <p className="text-sm text-slate-500 font-medium">Tim: <span className="text-slate-900 dark:text-slate-100 font-bold">{l10Data?.config?.companyName || "Belum Dikonfigurasi"}</span></p>
                </div>
              </div>
              {l10Data && (
                <div className="px-5 py-2.5 rounded-full border bg-blue-500/10 border-blue-500/20 text-blue-500 text-sm font-black tracking-widest uppercase">
                  {l10Rating && parseFloat(l10Rating as string) > 0 ? "✅ Selesai" : "⏳ Belum Dimulai"}
                </div>
              )}
            </div>

            <div className="relative z-10">
              {!l10Data ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-6 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem]">
                  <p className="text-slate-500 font-medium max-w-xs">Belum ada konfigurasi rapat mingguan yang disimpan</p>
                  <Link 
                    href="/tools" 
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 text-sm font-bold hover:opacity-90 transition-all shadow-xl active:scale-95"
                  >
                    Setup Rapat Sekarang
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-8 rounded-[2rem] bg-white/40 dark:bg-white/5 border border-white/20 space-y-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Skor Kualitas Rapat</p>
                    <div className="flex items-baseline gap-4">
                      <h4 className="text-6xl font-black text-blue-600">{l10Rating || "0.0"}</h4>
                      <span className="text-lg font-bold text-slate-400">/ 10</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium italic">* Rata-rata penilaian efektivitas dari seluruh peserta hadir.</p>
                  </div>
                  
                  <div className="flex flex-col justify-between py-2">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sesi Terakhir</p>
                        <p className="text-xl font-bold">{l10Data?.meetingDate || "-"}</p>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex flex-col">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Isu Terdeteksi</p>
                          <p className="text-lg font-bold text-rose-500">{l10Data?.idsSession?.manualIssues?.length || 0}</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 self-end mb-1" />
                        <div className="flex flex-col">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tugas Baru</p>
                          <p className="text-lg font-bold text-emerald-500">{l10Data?.todoList?.length || 0}</p>
                        </div>
                      </div>
                    </div>

                    <Link 
                      href="/tools" 
                      className="mt-6 inline-flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg text-sm"
                    >
                      Buka Sesi Rapat <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="absolute -right-12 -bottom-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
              <Users size={320} />
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Feature */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="p-12 rounded-[3rem] bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-8"
      >
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-2xl font-bold font-[family-name:var(--font-plus-jakarta)]">Lanjutkan Analisa Bisnis Anda</h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Masuk ke ruang simulasi untuk merancang strategi berikutnya.</p>
        </div>
        <Link 
          href="/tools"
          className="flex items-center gap-3 px-10 py-5 rounded-[2rem] bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 font-bold transition-all hover:opacity-90 active:scale-95 shadow-xl group text-lg"
        >
          Lanjutkan Simulasi <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </div>
  );
}

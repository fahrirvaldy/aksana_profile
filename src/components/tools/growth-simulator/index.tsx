"use client";

import React, { useState, useMemo } from "react";
import { 
  Users, 
  Percent, 
  RefreshCcw, 
  DollarSign, 
  TrendingUp,
  Save,
  Loader2,
  Zap,
  ArrowRight,
  Target,
  BarChart3,
  ShieldCheck,
  AlertTriangle,
  Info
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useTranslations } from 'next-intl';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Metrics {
  leads: number;
  conv: number;
  trans: number;
  sale: number;
  margin: number;
}

interface GrowthSimulatorInitialData {
  currency?: 'IDR' | 'USD';
  period?: 'Bulan' | 'Tahun';
  globalGrowth?: number;
  current?: Metrics;
  target?: Metrics;
  marketingCost?: number;
  fixedCost?: number;
}

interface GrowthSimulatorProps {
  user?: { id: string; [key: string]: unknown };
  onSave?: (data: GrowthSimulatorInitialData) => void;
  isSyncing?: boolean;
  initialData?: GrowthSimulatorInitialData;
}

export default function GrowthSimulator({ user, onSave, isSyncing, initialData }: GrowthSimulatorProps) {
  const t = useTranslations("Tools.Growth");

  // --- State ---
  const [currency, setCurrency] = useState<'IDR' | 'USD'>('IDR');
  const [period, setPeriod] = useState<'Bulan' | 'Tahun'>('Bulan');
  const [globalGrowth, setGlobalGrowth] = useState<number>(10);
  
  const [current, setCurrent] = useState<Metrics>({
    leads: 1000,
    conv: 10,
    trans: 2,
    sale: 500000,
    margin: 25
  });

  const [target, setTarget] = useState<Metrics>({
    leads: 1100,
    conv: 11,
    trans: 2.2,
    sale: 550000,
    margin: 27.5
  });

  const [marketingCost, setMarketingCost] = useState<number>(5000000);
  const [fixedCost, setFixedCost] = useState<number>(10000000);

  // --- Syncing ---
  const [prevInitialData, setPrevInitialData] = useState<GrowthSimulatorInitialData | undefined>(initialData);

  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData);
    if (initialData) {
      if (initialData.currency) setCurrency(initialData.currency);
      if (initialData.period) setPeriod(initialData.period);
      if (initialData.globalGrowth !== undefined) setGlobalGrowth(initialData.globalGrowth);
      if (initialData.current) setCurrent(initialData.current);
      if (initialData.target) setTarget(initialData.target);
      if (initialData.marketingCost !== undefined) setMarketingCost(initialData.marketingCost);
      if (initialData.fixedCost !== undefined) setFixedCost(initialData.fixedCost);
    }
  }

  const handleSave = (updatedData: Partial<GrowthSimulatorInitialData>) => {
    if (onSave) {
      onSave({
        currency,
        period,
        globalGrowth,
        current,
        target,
        marketingCost,
        fixedCost,
        ...updatedData
      });
    }
  };

  // --- Calculations ---
  const calculateDerived = (m: Metrics) => {
    const customers = Math.floor(m.leads * (m.conv / 100));
    const revenue = customers * m.trans * m.sale;
    const profit = revenue * (m.margin / 100);
    return { customers, revenue, profit };
  };

  const currentDerived = useMemo(() => calculateDerived(current), [current]);
  const targetDerived = useMemo(() => calculateDerived(target), [target]);

  const healthMetrics = useMemo(() => {
    const cac = marketingCost / (currentDerived.customers || 1);
    const ltv = (currentDerived.profit / (currentDerived.customers || 1)) * (period === 'Bulan' ? 12 : 1);
    const bepRevenue = fixedCost / (current.margin / 100 || 0.01);
    const ltvCacRatio = ltv / (cac || 1);

    return { cac, ltv, bepRevenue, ltvCacRatio };
  }, [currentDerived, marketingCost, fixedCost, period, current.margin]);

  const applyGlobalGrowth = (val: number) => {
    setGlobalGrowth(val);
    const multiplier = 1 + (val / 100);
    const newTarget = {
      leads: Math.round(current.leads * multiplier),
      conv: Number((current.conv * multiplier).toFixed(2)),
      trans: Number((current.trans * multiplier).toFixed(2)),
      sale: Math.round(current.sale * multiplier),
      margin: Number((current.margin * multiplier).toFixed(2))
    };
    setTarget(newTarget);
    handleSave({ globalGrowth: val, target: newTarget });
  };

  // --- Helpers ---
  const formatValue = (val: number, isCurrency = false, isPercent = false) => {
    if (isPercent) return `${val}%`;
    if (isCurrency) {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0
      }).format(val);
    }
    return val.toLocaleString('id-ID');
  };

  // --- Chart Configs ---
  const barChartData: ChartData<'bar'> = {
    labels: [t("fiveWays.current"), t("fiveWays.target")],
    datasets: [{
      label: 'Profit Proyeksi',
      data: [currentDerived.profit, targetDerived.profit],
      backgroundColor: ['#94a3b8', '#10b981'],
      borderRadius: 12,
      barThickness: 60,
    }]
  };

  const waterfallData: ChartData<'bar'> = {
    labels: ['Base', '+Leads', '+Conv', '+Trans', '+Sale', 'Target'],
    datasets: [{
      label: t("waterfall.label"),
      data: (function() {
        const base = currentDerived.profit;
        
        const step1 = calculateDerived({ ...current, leads: target.leads }).profit;
        const step2 = calculateDerived({ ...current, leads: target.leads, conv: target.conv }).profit;
        const step3 = calculateDerived({ ...current, leads: target.leads, conv: target.conv, trans: target.trans }).profit;
        const step4 = calculateDerived({ ...current, leads: target.leads, conv: target.conv, trans: target.trans, sale: target.sale }).profit;
        const final = targetDerived.profit;

        return [
          [0, base],
          [base, step1],
          [step1, step2],
          [step2, step3],
          [step3, step4],
          [0, final]
        ] as [number, number][];
      })(),
      backgroundColor: (context) => {
        const index = context.dataIndex;
        if (index === 0) return '#64748b';
        if (index === 5) return '#10b981';
        return 'rgba(16, 185, 129, 0.4)';
      },
      borderRadius: 8,
    }]
  };

  const commonOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const val = context.raw as number | [number, number];
            if (Array.isArray(val)) return formatValue(val[1] - val[0], true);
            return formatValue(val as number, true);
          }
        }
      }
    },
    scales: {
      y: { grid: { display: false }, ticks: { display: false }, border: { display: false } },
      x: { grid: { display: false }, border: { display: false } }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-700">
      {/* LEFT COLUMN: INPUTS */}
      <div className="lg:col-span-7 space-y-8">
        {/* Global Controls */}
        <div className="p-8 rounded-xl bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 space-y-6 aksana-glass shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <Zap size={16} className="text-amber-500" /> {t("global.title")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-normal">{t("global.subtitle")}</p>
            </div>
            <div className="flex items-center gap-2 bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 p-1.5 rounded-xl shadow-sm">
              {['IDR', 'USD'].map(cur => (
                <button
                  key={cur}
                  onClick={() => { setCurrency(cur as 'IDR' | 'USD'); handleSave({ currency: cur as 'IDR' | 'USD' }); }}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${currency === cur ? "bg-black text-white dark:bg-slate-900 shadow-sm dark:text-white" : "text-slate-600 dark:text-slate-300"}`}
                >
                  {cur}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 ml-1">{t("global.growth")}</label>
              <div className="relative">
                <RefreshCcw className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300" size={18} />
                <input
                  type="number"
                  value={globalGrowth}
                  onChange={(e) => applyGlobalGrowth(Number(e.target.value))}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:border-emerald-500 outline-none transition-all font-bold text-lg placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 ml-1">{t("global.period")}</label>
              <div className="flex gap-2">
                {(['Bulan', 'Tahun'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => { setPeriod(p); handleSave({ period: p }); }}
                    className={`flex-1 py-4 rounded-xl font-bold transition-all border ${
                      period === p ? "bg-black text-white border-transparent" : "bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700"
                    }`}
                  >
                    {t("global.per", { period: p })}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 5-Ways Simulator Table */}
        <div className="p-8 rounded-xl bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 space-y-6 aksana-glass shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Target size={18} /> {t("fiveWays.title")}
            </h3>
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 px-4">
              <span>{t("fiveWays.current")}</span>
              <span className="text-emerald-500">{t("fiveWays.target")}</span>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { id: 'leads', label: t("fiveWays.leads"), icon: <Users size={18} />, key: 'leads' as keyof Metrics },
              { id: 'conv', label: t("fiveWays.conv"), icon: <Percent size={18} />, key: 'conv' as keyof Metrics, isPercent: true },
              { id: 'trans', label: t("fiveWays.trans"), icon: <RefreshCcw size={18} />, key: 'trans' as keyof Metrics },
              { id: 'sale', label: t("fiveWays.sale"), icon: <DollarSign size={18} />, key: 'sale' as keyof Metrics, isCurrency: true },
              { id: 'margin', label: t("fiveWays.margin"), icon: <BarChart3 size={18} />, key: 'margin' as keyof Metrics, isPercent: true },
            ].map((item, idx) => (
              <div key={item.id} className="relative">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 hover:border-slate-300 transition-all shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm aksana-glass">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{item.label}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={current[item.key]}
                      onChange={(e) => {
                        const next = { ...current, [item.key]: Number(e.target.value) };
                        setCurrent(next);
                        handleSave({ current: next });
                      }}
                      className="w-20 md:w-28 px-3 py-2 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 text-right font-medium outline-none"
                    />
                    <ArrowRight size={14} className="text-slate-600 dark:text-slate-300" />
                    <input
                      type="number"
                      value={target[item.key]}
                      onChange={(e) => {
                        const next = { ...target, [item.key]: Number(e.target.value) };
                        setTarget(next);
                        handleSave({ target: next });
                      }}
                      className="w-20 md:w-28 px-3 py-2 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 text-right font-black outline-none"
                    />
                  </div>
                </div>
                {idx < 4 && (
                  <div className="absolute -bottom-3 left-8 z-10 text-black dark:text-slate-950 bg-white dark:bg-slate-900 px-1 font-black text-[10px] aksana-glass">
                    {idx === 0 ? "×" : idx === 1 ? "=" : idx === 2 ? "×" : "×"}
                  </div>
                )}
                {idx === 1 && (
                  <div className="py-2 px-12 flex items-center gap-2 text-[10px] font-bold text-black dark:text-slate-400 uppercase italic">
                    <Users size={12} /> {formatValue(currentDerived.customers)} {t("fiveWays.customers")} → <span className="text-emerald-600 dark:text-emerald-400">{formatValue(targetDerived.customers)} {t("fiveWays.customers")}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Additional Costs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-xl bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 space-y-4 aksana-glass shadow-sm">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <TrendingUp size={14} className="text-blue-500" /> {t("costs.marketing", { period })}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300 font-bold">Rp</span>
              <input
                type="number"
                value={marketingCost}
                onChange={(e) => { setMarketingCost(Number(e.target.value)); handleSave({ marketingCost: Number(e.target.value) }); }}
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 outline-none font-black text-xl placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
          </div>
          <div className="p-8 rounded-xl bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 space-y-4 aksana-glass shadow-sm">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <RefreshCcw size={14} className="text-purple-500" /> {t("costs.fixed", { period })}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300 font-bold">Rp</span>
              <input
                type="number"
                value={fixedCost}
                onChange={(e) => { setFixedCost(Number(e.target.value)); handleSave({ fixedCost: Number(e.target.value) }); }}
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 outline-none font-black text-xl placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: VISUALS */}
      <div className="lg:col-span-5 space-y-8">
        {/* Results Overview */}
        <div className="p-10 rounded-[3rem] bg-black text-white space-y-8 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white">{t("results.title")}</span>
              <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5 shadow-sm">
                <TrendingUp size={12} /> {t("results.growth", { percent: (((targetDerived.profit - currentDerived.profit) / (currentDerived.profit || 1)) * 100).toFixed(1) })}
              </div>
            </div>
            
            <div className="space-y-1">
              <h2 className="text-5xl font-black tracking-tighter">{formatValue(targetDerived.profit, true)}</h2>
              <p className="text-slate-700 dark:text-slate-400 text-xs font-medium italic">{t("results.current", { val: formatValue(currentDerived.profit, true) })}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1 shadow-sm">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-700 dark:text-slate-400">{t("results.revenue")}</p>
                <p className="text-sm font-black">{formatValue(targetDerived.revenue, true)}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1 shadow-sm">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-700 dark:text-slate-400">{t("results.profitIncrease")}</p>
                <p className="text-sm font-black text-emerald-400">+{formatValue(targetDerived.profit - currentDerived.profit, true)}</p>
              </div>
            </div>
          </div>

          <div className="h-48 w-full">
            <Bar data={barChartData} options={commonOptions} />
          </div>

          {user && (
            <button
              onClick={() => handleSave({})}
              disabled={isSyncing}
              className="w-full py-5 rounded-2xl bg-white text-black font-black flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-xl disabled:opacity-50"
            >
              {isSyncing ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> {t("results.save")}</>}
            </button>
          )}
        </div>

        {/* Waterfall Chart */}
        <div className="p-8 rounded-xl bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 space-y-6 aksana-glass shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">{t("waterfall.title")}</h3>
            <Info size={14} className="text-slate-600 dark:text-slate-300" />
          </div>
          <div className="h-56 w-full">
            <Bar data={waterfallData} options={commonOptions} />
          </div>
        </div>

        {/* Health & BEP Cards */}
        <div className="grid grid-cols-1 gap-6">
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-black dark:border-slate-800 space-y-6 aksana-glass shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-slate-400">{t("health.efficiency")}</h3>
              {healthMetrics.ltvCacRatio > 3 ? (
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full text-[10px] font-black">
                  <ShieldCheck size={12} /> {t("health.status.healthy")}
                </div>
              ) : healthMetrics.ltvCacRatio > 1.5 ? (
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full text-[10px] font-black">
                  <Info size={12} /> {t("health.status.fair")}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full text-[10px] font-black">
                  <AlertTriangle size={12} /> {t("health.status.loss")}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[9px] font-bold uppercase text-black dark:text-slate-400 tracking-tighter">{t("health.cac")}</p>
                <p className="text-lg font-black text-black dark:text-white">{formatValue(healthMetrics.cac, true)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-bold uppercase text-black dark:text-slate-400 tracking-tighter">{t("health.ltv")}</p>
                <p className="text-lg font-black text-black dark:text-white">{formatValue(healthMetrics.ltv, true)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase">
                <span className="text-black dark:text-slate-400">{t("health.ratio")}</span>
                <span className={healthMetrics.ltvCacRatio > 3 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>{healthMetrics.ltvCacRatio.toFixed(1)}x</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (healthMetrics.ltvCacRatio / 5) * 100)}%` }}
                  className={`h-full ${healthMetrics.ltvCacRatio > 3 ? "bg-emerald-500" : healthMetrics.ltvCacRatio > 1.5 ? "bg-amber-500" : "bg-rose-500"}`}
                />
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-black dark:border-slate-800 space-y-6 aksana-glass shadow-sm">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-slate-400">{t("bep.title")}</h3>
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold uppercase text-black dark:text-slate-400">{t("bep.revenue")}</p>
                  <p className="text-2xl font-black text-black dark:text-white">{formatValue(healthMetrics.bepRevenue, true)}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[9px] font-bold uppercase text-black dark:text-slate-400">{t("bep.statusLabel")}</p>
                  <p className={`text-sm font-black ${currentDerived.revenue >= healthMetrics.bepRevenue ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                    {currentDerived.revenue >= healthMetrics.bepRevenue ? t("bep.status.above") : t("bep.status.below")}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (currentDerived.revenue / healthMetrics.bepRevenue) * 100)}%` }}
                    className="h-full bg-black dark:bg-white"
                  />
                  {currentDerived.revenue < healthMetrics.bepRevenue && (
                    <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black uppercase text-black mix-blend-difference">
                      {t("bep.progress")}
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-black dark:text-slate-400 italic font-normal">
                  {currentDerived.revenue >= healthMetrics.bepRevenue 
                    ? t("bep.success")
                    : t("bep.needed", { val: formatValue(healthMetrics.bepRevenue - currentDerived.revenue, true) })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

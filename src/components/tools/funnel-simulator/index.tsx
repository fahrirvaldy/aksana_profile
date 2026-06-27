"use client";

import { User } from "@supabase/supabase-js";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { 
  Filter, 
  Zap, 
  Target, 
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  RefreshCcw,
  BarChart3,
  Info,
  Download
} from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
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

// --- Interfaces ---
interface FunnelInputs {
  budget: number;
  aov: number;
  cpm: number;
  ctr: number;
  visit: number;
  atc: number;
  checkout: number;
}

interface Profiling {
  industry: string;
  channel: string;
}

interface FunnelSimulatorInitialData {
  inputs?: FunnelInputs;
  profiling?: Profiling;
}

interface FunnelSimulatorProps {
  user?: User;
  onSave?: (data: FunnelSimulatorInitialData) => void;
  isSyncing?: boolean;
  initialData?: FunnelSimulatorInitialData;
}

// --- Constants ---
const industryBase: Record<string, Partial<FunnelInputs>> = {
  fashion: { cpm: 45000, ctr: 1.2, visit: 70, atc: 4, checkout: 40 },
  beauty: { cpm: 55000, ctr: 0.8, visit: 65, atc: 3.5, checkout: 35 },
  gadget: { cpm: 35000, ctr: 0.5, visit: 60, atc: 2, checkout: 30 },
  fnb: { cpm: 25000, ctr: 1.5, visit: 80, atc: 6, checkout: 50 },
};

const channelModifier: Record<string, Partial<FunnelInputs>> = {
  marketplace: { visit: 95, atc: 8, checkout: 60 },
  website: { visit: 75, atc: 4, checkout: 40 },
  whatsapp: { visit: 85, atc: 12, checkout: 70 },
};

export default function FunnelSimulator({ onSave, isSyncing, initialData }: FunnelSimulatorProps) {
  const t = useTranslations("Tools.Funnel");

  // --- State ---
  const [inputs, setInputs] = useState<FunnelInputs>(initialData?.inputs || {
    budget: 10000000,
    aov: 250000,
    cpm: 40000,
    ctr: 1.0,
    visit: 70,
    atc: 4,
    checkout: 40
  });

  const [profiling, setProfiling] = useState<Profiling>(initialData?.profiling || {
    industry: 'fashion',
    channel: 'website'
  });

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevInitialData = useRef<FunnelSimulatorInitialData | undefined>();

  useEffect(() => {
    // This effect synchronizes the component's internal state 
    // when the initialData prop changes from the parent.
    if (initialData && initialData !== prevInitialData.current) {
      if (initialData.inputs) setInputs(initialData.inputs);
      if (initialData.profiling) setProfiling(initialData.profiling);
      prevInitialData.current = initialData;
    }
  }, [initialData]);

  // Debounced Auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSave) {
        onSave({ inputs, profiling });
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [inputs, profiling, onSave]);

  // --- Core Mathematics ---
  const results = useMemo(() => {
    const impressions = (inputs.budget / inputs.cpm) * 1000;
    const clicks = impressions * (inputs.ctr / 100);
    const visitors = clicks * (inputs.visit / 100);
    const atcs = visitors * (inputs.atc / 100);
    const purchases = atcs * (inputs.checkout / 100);
    const revenue = purchases * inputs.aov;
    const profit = revenue - inputs.budget;
    const roas = inputs.budget > 0 ? revenue / inputs.budget : 0;
    const cpa = purchases > 0 ? inputs.budget / purchases : 0;

    return {
      impressions,
      clicks,
      visitors,
      atcs,
      purchases,
      revenue,
      profit,
      roas,
      cpa
    };
  }, [inputs]);

  // --- Benchmark Comparison (AI Diagnostic) ---
  const diagnostic = useMemo(() => {
    const base = industryBase[profiling.industry] || industryBase.fashion;
    const mod = channelModifier[profiling.channel] || channelModifier.website;
    
    // Combine base and mod for benchmark
    const benchmark = {
      ctr: base.ctr || 1,
      visit: mod.visit || 70,
      atc: mod.atc || 4,
      checkout: mod.checkout || 40
    };

    const leaks = [];
    if (inputs.ctr < benchmark.ctr) leaks.push({ label: "Click-Through Rate (CTR)", diff: benchmark.ctr - inputs.ctr, severity: 'high' });
    if (inputs.visit < benchmark.visit) leaks.push({ label: "Visit Rate (LP/Marketplace)", diff: benchmark.visit - inputs.visit, severity: 'medium' });
    if (inputs.atc < benchmark.atc) leaks.push({ label: "Add to Cart (ATC) Rate", diff: benchmark.atc - inputs.atc, severity: 'high' });
    if (inputs.checkout < benchmark.checkout) leaks.push({ label: "Checkout/Conversion Rate", diff: benchmark.checkout - inputs.checkout, severity: 'medium' });

    leaks.sort((a, b) => (b.diff) - (a.diff));
    const biggestLeak = leaks[0];

    let recommendation = t("recommendations.default");
    if (biggestLeak) {
      if (biggestLeak.label.includes("CTR")) recommendation = t("recommendations.ctr");
      else if (biggestLeak.label.includes("Visit")) recommendation = t("recommendations.visit");
      else if (biggestLeak.label.includes("ATC")) recommendation = t("recommendations.atc");
      else if (biggestLeak.label.includes("Checkout")) recommendation = t("recommendations.checkout");
    }

    return { biggestLeak, recommendation, benchmark };
  }, [inputs, profiling, t]);

  // --- Helpers ---
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('id-ID').format(Math.floor(val));
  };
  
  const exportToImage = () => {
    // This is a placeholder for the actual export logic.
    // In a real implementation, you would use a library like html2canvas or dom-to-image.
    console.log("Exporting to image...");
  };

  const applyIndustryStandard = () => {
    const base = industryBase[profiling.industry] || industryBase.fashion;
    const mod = channelModifier[profiling.channel] || channelModifier.website;
    
    setInputs(prev => ({
      ...prev,
      cpm: base.cpm || prev.cpm,
      ctr: base.ctr || prev.ctr,
      visit: mod.visit || prev.visit,
      atc: mod.atc || prev.atc,
      checkout: mod.checkout || prev.checkout
    }));
  };

  // --- Chart Data ---
  const chartData = {
    labels: [t("visual.steps.impressions"), t("visual.steps.clicks"), t("visual.steps.visit"), t("visual.steps.atc"), t("visual.steps.purchases")],
    datasets: [
      {
        label: 'Funnel Volume',
        data: [
          results.impressions,
          results.clicks,
          results.visitors,
          results.atcs,
          results.purchases
        ],
        backgroundColor: [
          'rgba(15, 23, 42, 0.1)',
          'rgba(15, 23, 42, 0.2)',
          'rgba(15, 23, 42, 0.4)',
          'rgba(15, 23, 42, 0.6)',
          'rgba(15, 23, 42, 0.9)',
        ],
        borderRadius: 8,
        barThickness: 32,
      },
    ],
  };

  const chartOptions: ChartOptions<'bar'> = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `Total: ${formatNumber(context.raw as number)}`
        }
      }
    },
    scales: {
      x: { display: false, grid: { display: false } },
      y: { 
        grid: { display: false },
        ticks: { 
          font: { weight: 'bold', family: 'var(--font-plus-jakarta)' },
          color: '#64748b'
        } 
      }
    }
  };

  return (
    <div ref={containerRef} className="p-8 space-y-8 animate-in fade-in duration-700 bg-[var(--background)]">
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold font-[family-name:var(--font-plus-jakarta)] text-black dark:text-white">{t("title")}</h2>
          <p className="text-black dark:text-slate-400 font-normal">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            data-export-ignore="true"
            onClick={exportToImage}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-950 text-xs font-bold hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isExporting ? (
              <RefreshCcw size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            {isExporting ? 'Exporting...' : t("export")}
          </button>

          {isSyncing && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-black dark:text-slate-400 text-xs font-bold">
              <RefreshCcw size={14} className="animate-spin" />
              {t("syncing")}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* KOLOM KIRI: INPUT & SETUP */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Card 1: Profiling Bisnis */}
          <div className="p-8 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl space-y-8 aksana-glass shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-950 flex items-center justify-center">
                <Target size={20} />
              </div>
              <h3 className="font-bold text-lg text-black dark:text-white">{t("profiling.title")}</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">{t("profiling.industry")}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['fashion', 'beauty', 'gadget', 'fnb'].map((ind) => (
                    <button
                      key={ind}
                      onClick={() => setProfiling(p => ({ ...p, industry: ind }))}
                      className={`px-4 py-3 rounded-xl border text-sm font-bold capitalize transition-all ${
                        profiling.industry === ind 
                        ? 'bg-slate-900 border-slate-900 text-white dark:bg-slate-50 dark:text-slate-950' 
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {ind === 'fnb' ? 'F&B' : ind}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">{t("profiling.channel")}</label>
                <div className="grid grid-cols-3 gap-3">
                  {['marketplace', 'website', 'whatsapp'].map((chan) => (
                    <button
                      key={chan}
                      onClick={() => setProfiling(p => ({ ...p, channel: chan }))}
                      className={`px-3 py-3 rounded-xl border text-[11px] font-black uppercase tracking-tighter transition-all ${
                        profiling.channel === chan 
                        ? 'bg-slate-900 border-slate-900 text-white dark:bg-slate-50 dark:text-slate-950' 
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {chan}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={applyIndustryStandard}
                className="w-full py-4 rounded-xl bg-white dark:bg-[#1E1E1E] text-black dark:text-slate-50 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700"
              >
                <Activity size={16} /> {t("profiling.applyStandard")}
              </button>
            </div>
          </div>

          {/* Card 2: Input Data */}
          <div className="p-8 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl space-y-8 aksana-glass shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#1E1E1E] text-black dark:text-slate-50 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                <Filter size={20} />
              </div>
              <h3 className="font-bold text-lg text-black dark:text-white">{t("inputs.title")}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 ml-1 dark:text-slate-300">{t("inputs.budget")}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300 font-bold text-sm">Rp</span>
                  <input
                    type="number"
                    value={inputs.budget}
                    onChange={(e) => setInputs(p => ({ ...p, budget: Number(e.target.value) }))}
                    placeholder={t("inputs.budget")}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:border-slate-400 outline-none transition-all font-bold placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 ml-1 dark:text-slate-300">{t("inputs.aov")}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300 font-bold text-sm">Rp</span>
                  <input
                    type="number"
                    value={inputs.aov}
                    onChange={(e) => setInputs(p => ({ ...p, aov: Number(e.target.value) }))}
                    placeholder={t("inputs.aov")}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:border-slate-400 outline-none transition-all font-bold placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 ml-1 dark:text-slate-300">{t("inputs.cpm")}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300 font-bold text-sm">Rp</span>
                  <input
                    type="number"
                    value={inputs.cpm}
                    onChange={(e) => setInputs(p => ({ ...p, cpm: Number(e.target.value) }))}
                    placeholder={t("inputs.cpm")}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:border-slate-400 outline-none transition-all font-bold placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 ml-1 dark:text-slate-300">{t("inputs.ctr")}</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.ctr}
                    onChange={(e) => setInputs(p => ({ ...p, ctr: Number(e.target.value) }))}
                    className="w-full px-4 py-4 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:border-slate-400 outline-none transition-all font-bold placeholder-slate-400 dark:placeholder-slate-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300 font-bold text-sm">%</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 ml-1 dark:text-slate-300">{t("inputs.visit")}</label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    value={inputs.visit}
                    onChange={(e) => setInputs(p => ({ ...p, visit: Number(e.target.value) }))}
                    className="w-full px-4 py-4 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:border-slate-400 outline-none transition-all font-bold placeholder-slate-400 dark:placeholder-slate-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300 font-bold text-sm">%</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 ml-1 dark:text-slate-300">{t("inputs.atc")}</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.atc}
                    onChange={(e) => setInputs(p => ({ ...p, atc: Number(e.target.value) }))}
                    className="w-full px-4 py-4 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:border-slate-400 outline-none transition-all font-bold placeholder-slate-400 dark:placeholder-slate-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300 font-bold text-sm">%</span>
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 ml-1 dark:text-slate-300">{t("inputs.checkout")}</label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    value={inputs.checkout}
                    onChange={(e) => setInputs(p => ({ ...p, checkout: Number(e.target.value) }))}
                    className="w-full px-4 py-4 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:border-slate-400 outline-none transition-all font-bold text-center placeholder-slate-400 dark:placeholder-slate-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300 font-bold text-sm">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: VISUALISASI & HASIL */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Grid Metrik Utama */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-xl border transition-all ${
              results.roas >= 3 ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-900/20' : 
              results.roas >= 1.5 ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-900/20' :
              'bg-rose-50 border-rose-200 dark:bg-rose-900/10 dark:border-rose-900/20'
            }`}>
              <div className="flex flex-col items-center text-center space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">{t("results.roas")}</p>
                <h4 className={`text-4xl font-black ${
                  results.roas >= 3 ? 'text-emerald-700' : 
                  results.roas >= 1.5 ? 'text-blue-700' :
                  'text-rose-700'
                }`}>{results.roas.toFixed(2)}x</h4>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                  results.roas >= 3 ? 'bg-emerald-200/50 text-emerald-800' : 
                  results.roas >= 1.5 ? 'bg-blue-200/50 text-blue-800' :
                  'bg-rose-200/50 text-rose-800'
                }`}>
                  {results.roas >= 3 ? t("results.status.profit") : results.roas >= 1.5 ? t("results.status.stable") : t("results.status.loss")}
                </div>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl aksana-glass shadow-sm">
              <div className="flex flex-col items-center text-center space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">{t("results.revenueProfit")}</p>
                <h4 className="text-xl font-black text-black dark:text-slate-50">{formatCurrency(results.revenue)}</h4>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <TrendingUp size={14} className={results.profit > 0 ? "text-emerald-500" : "text-rose-500"} />
                  {formatCurrency(results.profit)}
                </div>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl aksana-glass shadow-sm">
              <div className="flex flex-col items-center text-center space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">{t("results.cpaClosing")}</p>
                <h4 className="text-xl font-black text-black dark:text-slate-50">{formatCurrency(results.cpa)}</h4>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <Target size={14} className="text-blue-500" />
                  {formatNumber(results.purchases)} {t("results.sales")}
                </div>
              </div>
            </div>
          </div>

          {/* AI Diagnostic Report */}
          <div className="p-8 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl aksana-glass relative overflow-hidden group shadow-sm">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <BarChart3 size={120} />
            </div>
            
            <div className="relative space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center animate-pulse">
                  <Zap size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-none text-black dark:text-white">{t("diagnostic.title")}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-normal">{t("diagnostic.basedOn", { industry: profiling.industry })}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">{t("diagnostic.leakTitle")}</p>
                  {diagnostic.biggestLeak ? (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50/50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-900/20 shadow-sm">
                      <AlertCircle className="text-rose-600 mt-0.5" size={18} />
                      <div>
                        <p className="font-bold text-sm text-rose-800 dark:text-rose-400">{diagnostic.biggestLeak.label}</p>
                        <p className="text-xs text-rose-700/80 dark:text-rose-400/60 font-medium">-{t("diagnostic.leakBelow", { diff: diagnostic.biggestLeak.diff.toFixed(1) })}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/20 shadow-sm">
                      <CheckCircle2 className="text-emerald-600 mt-0.5" size={18} />
                      <div>
                        <p className="font-bold text-sm text-emerald-800 dark:text-emerald-400">{t("diagnostic.healthy")}</p>
                        <p className="text-xs text-emerald-700/80 dark:text-emerald-400/60 font-medium">{t("diagnostic.healthyDesc")}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">{t("diagnostic.recommendationTitle")}</p>
                  <p className="text-sm font-bold leading-relaxed text-black dark:text-slate-300 italic">
                    &quot;{diagnostic.recommendation}&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Funnel Visual */}
          <div className="p-8 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl space-y-8 aksana-glass shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#1E1E1E] text-black dark:text-slate-50 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                  <BarChart3 size={20} />
                </div>
                <h3 className="font-bold text-lg text-black dark:text-white">{t("visual.title")}</h3>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                <Info size={12} /> {t("visual.totalVolume")}
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 text-center">
              {[
                { label: t("visual.steps.impressions"), val: results.impressions },
                { label: t("visual.steps.clicks"), val: results.clicks },
                { label: t("visual.steps.visit"), val: results.visitors },
                { label: t("visual.steps.atc"), val: results.atcs },
                { label: t("visual.steps.purchases"), val: results.purchases },
              ].map((step, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-[8px] font-black uppercase text-slate-600 dark:text-slate-300 tracking-tighter truncate">{step.label}</p>
                  <p className="text-[10px] md:text-sm font-black text-black dark:text-slate-50">{formatNumber(step.val)}</p>
                </div>
              ))}
            </div>

            <div className="h-[300px] w-full">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
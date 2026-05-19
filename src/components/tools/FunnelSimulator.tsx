"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { 
  Filter, 
  Zap, 
  Target, 
  DollarSign, 
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  RefreshCcw,
  BarChart3,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  user?: { id: string; [key: string]: unknown };
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

export default function FunnelSimulator({ user, onSave, isSyncing, initialData }: FunnelSimulatorProps) {
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

  const [isSimulated, setIsSimulated] = useState<boolean>(false);

  // --- Syncing ---
  const [prevInitialData, setPrevInitialData] = useState<FunnelSimulatorInitialData | undefined>(initialData);

  useEffect(() => {
    if (initialData && initialData !== prevInitialData) {
      setPrevInitialData(initialData);
      if (initialData.inputs) setInputs(initialData.inputs);
      if (initialData.profiling) setProfiling(initialData.profiling);
    }
  }, [initialData, prevInitialData]);

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

    let recommendation = "Fokus pada optimalisasi konten kreatif untuk meningkatkan CTR.";
    if (biggestLeak) {
      if (biggestLeak.label.includes("CTR")) recommendation = "Konten iklan Anda kurang menarik. Coba gunakan hook yang lebih kuat atau visual yang lebih kontras.";
      else if (biggestLeak.label.includes("Visit")) recommendation = "Halaman pendaratan (LP) lambat atau tidak relevan dengan iklan. Periksa kecepatan loading dan konsistensi pesan.";
      else if (biggestLeak.label.includes("ATC")) recommendation = "Penawaran di halaman produk kurang meyakinkan. Tambahkan social proof atau perjelas benefit produk.";
      else if (biggestLeak.label.includes("Checkout")) recommendation = "Proses checkout terlalu rumit atau ongkir terlalu mahal. Pertimbangkan promo gratis ongkir atau simplifikasi form.";
    }

    return { biggestLeak, recommendation, benchmark };
  }, [inputs, profiling]);

  // --- Helpers ---
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('id-ID').format(Math.floor(val));
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
    setIsSimulated(true);
  };

  // --- Chart Data ---
  const chartData = {
    labels: ['Impresi', 'Klik', 'Kunjungan', 'ATC', 'Beli'],
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
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold font-[family-name:var(--font-plus-jakarta)]">Marketing Funnel Simulator</h2>
          <p className="text-slate-500 font-medium">Simulasikan aliran trafik dan potensi revenue bisnis Anda.</p>
        </div>
        <div className="flex items-center gap-3">
          {isSyncing && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold">
              <RefreshCcw size={14} className="animate-spin" />
              Syncing...
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* KOLOM KIRI: INPUT & SETUP */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Card 1: Profiling Bisnis */}
          <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-900 flex items-center justify-center">
                <Target size={20} />
              </div>
              <h3 className="font-bold text-lg">Profiling Bisnis</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Industri / Kategori</label>
                <div className="grid grid-cols-2 gap-3">
                  {['fashion', 'beauty', 'gadget', 'fnb'].map((ind) => (
                    <button
                      key={ind}
                      onClick={() => setProfiling(p => ({ ...p, industry: ind }))}
                      className={`px-4 py-3 rounded-xl border text-sm font-bold capitalize transition-all ${
                        profiling.industry === ind 
                        ? 'bg-slate-900 border-slate-900 text-white dark:bg-slate-50 dark:text-slate-900' 
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {ind === 'fnb' ? 'F&B' : ind}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Saluran Penjualan Utama</label>
                <div className="grid grid-cols-3 gap-3">
                  {['marketplace', 'website', 'whatsapp'].map((chan) => (
                    <button
                      key={chan}
                      onClick={() => setProfiling(p => ({ ...p, channel: chan }))}
                      className={`px-3 py-3 rounded-xl border text-[11px] font-black uppercase tracking-tighter transition-all ${
                        profiling.channel === chan 
                        ? 'bg-slate-900 border-slate-900 text-white dark:bg-slate-50 dark:text-slate-900' 
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {chan}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={applyIndustryStandard}
                className="w-full py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <Activity size={16} /> Terapkan Standar Industri
              </button>
            </div>
          </div>

          {/* Card 2: Input Data */}
          <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-50 flex items-center justify-center">
                <Filter size={20} />
              </div>
              <h3 className="font-bold text-lg">Input Parameter Funnel</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Marketing Budget</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rp</span>
                  <input
                    type="number"
                    value={inputs.budget}
                    onChange={(e) => setInputs(p => ({ ...p, budget: Number(e.target.value) }))}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:border-slate-400 outline-none transition-all font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">AOV (Rata-rata Order)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rp</span>
                  <input
                    type="number"
                    value={inputs.aov}
                    onChange={(e) => setInputs(p => ({ ...p, aov: Number(e.target.value) }))}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:border-slate-400 outline-none transition-all font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">CPM (Cost per 1k Imp)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rp</span>
                  <input
                    type="number"
                    value={inputs.cpm}
                    onChange={(e) => setInputs(p => ({ ...p, cpm: Number(e.target.value) }))}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:border-slate-400 outline-none transition-all font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">CTR (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.ctr}
                    onChange={(e) => setInputs(p => ({ ...p, ctr: Number(e.target.value) }))}
                    className="w-full px-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:border-slate-400 outline-none transition-all font-bold"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">%</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Visit Rate (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    value={inputs.visit}
                    onChange={(e) => setInputs(p => ({ ...p, visit: Number(e.target.value) }))}
                    className="w-full px-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:border-slate-400 outline-none transition-all font-bold"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">%</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">ATC Rate (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.atc}
                    onChange={(e) => setInputs(p => ({ ...p, atc: Number(e.target.value) }))}
                    className="w-full px-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:border-slate-400 outline-none transition-all font-bold"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">%</span>
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Checkout / Closing Rate (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    value={inputs.checkout}
                    onChange={(e) => setInputs(p => ({ ...p, checkout: Number(e.target.value) }))}
                    className="w-full px-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:border-slate-400 outline-none transition-all font-bold text-center"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: VISUALISASI & HASIL */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Grid Metrik Utama */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-[2rem] border transition-all ${
              results.roas >= 3 ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/20' : 
              results.roas >= 1.5 ? 'bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/20' :
              'bg-rose-50 border-rose-100 dark:bg-rose-900/10 dark:border-rose-900/20'
            }`}>
              <div className="flex flex-col items-center text-center space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">ROAS</p>
                <h4 className={`text-4xl font-black ${
                  results.roas >= 3 ? 'text-emerald-600' : 
                  results.roas >= 1.5 ? 'text-blue-600' :
                  'text-rose-600'
                }`}>{results.roas.toFixed(2)}x</h4>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                  results.roas >= 3 ? 'bg-emerald-200/50 text-emerald-700' : 
                  results.roas >= 1.5 ? 'bg-blue-200/50 text-blue-700' :
                  'bg-rose-200/50 text-rose-700'
                }`}>
                  {results.roas >= 3 ? 'Sangat Profit' : results.roas >= 1.5 ? 'Stabil' : 'Rugi'}
                </div>
              </div>
            </div>

            <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-lg">
              <div className="flex flex-col items-center text-center space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Revenue & Profit</p>
                <h4 className="text-xl font-black text-slate-900 dark:text-slate-50">{formatCurrency(results.revenue)}</h4>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                  <TrendingUp size={14} className={results.profit > 0 ? "text-emerald-500" : "text-rose-500"} />
                  {formatCurrency(results.profit)}
                </div>
              </div>
            </div>

            <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-lg">
              <div className="flex flex-col items-center text-center space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">CPA & Closing</p>
                <h4 className="text-xl font-black text-slate-900 dark:text-slate-50">{formatCurrency(results.cpa)}</h4>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                  <Target size={14} className="text-blue-500" />
                  {formatNumber(results.purchases)} Sales
                </div>
              </div>
            </div>
          </div>

          {/* AI Diagnostic Report */}
          <div className="p-8 rounded-[2rem] aksana-glass border border-white/20 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <BarChart3 size={120} />
            </div>
            
            <div className="relative space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center animate-pulse">
                  <Zap size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-none">AI Diagnostic Report</h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Berdasarkan benchmark industri {profiling.industry}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Titik Kebocoran Terbesar</p>
                  {diagnostic.biggestLeak ? (
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100/50 dark:border-rose-900/20">
                      <AlertCircle className="text-rose-500 mt-0.5" size={18} />
                      <div>
                        <p className="font-bold text-sm text-rose-700 dark:text-rose-400">{diagnostic.biggestLeak.label}</p>
                        <p className="text-xs text-rose-600/70 dark:text-rose-400/60 font-medium">-{diagnostic.biggestLeak.diff.toFixed(1)}% di bawah rata-rata</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-900/20">
                      <CheckCircle2 className="text-emerald-500 mt-0.5" size={18} />
                      <div>
                        <p className="font-bold text-sm text-emerald-700 dark:text-emerald-400">Funnel Sehat</p>
                        <p className="text-xs text-emerald-600/70 dark:text-emerald-400/60 font-medium">Performa di atas benchmark industri.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Rekomendasi Strategis AI</p>
                  <p className="text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-400 italic">
                    "{diagnostic.recommendation}"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Funnel Visual */}
          <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-50 flex items-center justify-center">
                  <BarChart3 size={20} />
                </div>
                <h3 className="font-bold text-lg">Funnel Visualization</h3>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <Info size={12} /> Total Volume
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 text-center">
              {[
                { label: 'Impresi', val: results.impressions },
                { label: 'Klik', val: results.clicks },
                { label: 'Visit', val: results.visitors },
                { label: 'ATC', val: results.atcs },
                { label: 'Beli', val: results.purchases },
              ].map((step, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-[8px] font-black uppercase text-slate-400 tracking-tighter truncate">{step.label}</p>
                  <p className="text-[10px] md:text-sm font-black text-slate-900 dark:text-slate-50">{formatNumber(step.val)}</p>
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

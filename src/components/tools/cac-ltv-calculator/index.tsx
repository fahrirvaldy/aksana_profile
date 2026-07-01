"use client";

import { User } from "@supabase/supabase-js";
import React, { useState, useMemo, useEffect } from "react";
import { 
  Megaphone, 
  Wallet, 
  BrainCircuit, 
  TrendingUp,
  Loader2,
  Info
} from "lucide-react";
import { 
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useTranslations } from 'next-intl';

ChartJS.register(ArcElement, Tooltip, Legend);

export interface CacLtvData {
  adSpend: number;
  opsCost: number;
  newCustomers: number;
  aov: number;
  frequency: number;
  lifespan: number;
  margin: number;
}

interface CacLtvCalculatorProps {
  user?: User;
  onSave?: (data: CacLtvData) => void;
  isSyncing?: boolean;
  initialData?: CacLtvData;
}

export default function CacLtvCalculator({ onSave, isSyncing, initialData }: CacLtvCalculatorProps) {
  const t = useTranslations("Tools.CacLtv");
  
  // --- States ---
  const [adSpend, setAdSpend] = useState<number>(0);
  const [opsCost, setOpsCost] = useState<number>(0);
  const [newCustomers, setNewCustomers] = useState<number>(0);
  const [aov, setAov] = useState<number>(0);
  const [frequency, setFrequency] = useState<number>(0);
  const [lifespan, setLifespan] = useState<number>(0);
  const [margin, setMargin] = useState<number>(0);

  // --- Syncing (Render-phase) ---
  const [prevInitialData, setPrevInitialData] = useState<CacLtvData | undefined>(initialData);
  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData);
    if (initialData) {
      setAdSpend(initialData.adSpend || 0);
      setOpsCost(initialData.opsCost || 0);
      setNewCustomers(initialData.newCustomers || 0);
      setAov(initialData.aov || 0);
      setFrequency(initialData.frequency || 0);
      setLifespan(initialData.lifespan || 0);
      setMargin(initialData.margin || 0);
    }
  }

  // --- Auto-save logic ---
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSave) {
        onSave({
          adSpend,
          opsCost,
          newCustomers,
          aov,
          frequency,
          lifespan,
          margin
        });
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [adSpend, opsCost, newCustomers, aov, frequency, lifespan, margin, onSave]);

  // --- Logic ---
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      maximumFractionDigits: 0 
    }).format(val);
  };

  const { cac, ltv, ratio } = useMemo(() => {
    const calculatedCac = (adSpend + opsCost) / (newCustomers || 1);
    const calculatedLtv = aov * frequency * lifespan * (margin / 100);
    const calculatedRatio = calculatedLtv / (calculatedCac || 1);
    return { 
      cac: calculatedCac, 
      ltv: calculatedLtv, 
      ratio: Number(calculatedRatio.toFixed(2)) 
    };
  }, [adSpend, opsCost, newCustomers, aov, frequency, lifespan, margin]);

  // --- Chart Data ---
  const chartData = {
    datasets: [{
      data: [ratio, ratio > 5 ? 0 : 5 - ratio],
      backgroundColor: [
        ratio < 1 ? '#ef4444' : ratio <= 3 ? '#f59e0b' : '#10b981',
        '#f1f5f9'
      ],
      borderWidth: 0,
      circumference: 180,
      rotation: -90,
    }]
  };

  const chartOptions = {
    cutout: '80%',
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  const getAiRecommendation = () => {
    if (ratio < 1) return { text: t("burnMoney"), color: "text-rose-500", bg: "bg-rose-500/10" };
    if (ratio < 3) return { text: t("healthyOps"), color: "text-amber-500", bg: "bg-amber-500/10" };
    return { text: t("scaleAds"), color: "text-emerald-500", bg: "bg-emerald-500/10" };
  };

  const recommendation = getAiRecommendation();

  return (
    <div className="w-full p-4 lg:p-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Kolom Kiri: Input */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Card 1: Parameter Iklan (CAC) */}
          <div className="p-8 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-6 aksana-glass">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                <Megaphone size={20} />
              </div>
              <h3 className="font-black uppercase tracking-widest text-xs text-slate-600 dark:text-slate-300">{t("title")}</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 ml-1">{t("adSpend")}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300 text-xs font-bold">Rp</span>
                  <input
                    type="number"
                    value={adSpend || ""}
                    onChange={(e) => setAdSpend(Number(e.target.value))}
                    placeholder="0"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:border-blue-500 outline-none transition-all font-medium text-sm placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 ml-1">{t("opsCost")}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300 text-xs font-bold">Rp</span>
                  <input
                    type="number"
                    value={opsCost || ""}
                    onChange={(e) => setOpsCost(Number(e.target.value))}
                    placeholder="0"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:border-blue-500 outline-none transition-all font-medium text-sm placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 ml-1">{t("newCustomers")}</label>
                <input
                  type="number"
                  value={newCustomers || ""}
                  onChange={(e) => setNewCustomers(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-6 py-4 rounded-2xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:border-blue-500 outline-none transition-all font-medium text-sm placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center shadow-sm">
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">{t("cacResult")}</span>
              <span className="text-lg font-black text-blue-500">{formatCurrency(cac)}</span>
            </div>
          </div>

          {/* Card 2: Potensi Pelanggan (LTV) */}
          <div className="p-8 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-6 aksana-glass">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
                <Wallet size={20} />
              </div>
              <h3 className="font-black uppercase tracking-widest text-xs text-slate-600 dark:text-slate-300">{t("ltvTitle")}</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 ml-1">{t("aov")}</label>
                <input
                  type="number"
                  value={aov || ""}
                  onChange={(e) => setAov(Number(e.target.value))}
                  placeholder={t("placeholders.aov")}
                  className="w-full px-4 py-3 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:border-emerald-500 outline-none transition-all text-sm font-medium placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 ml-1">{t("frequency")}</label>
                <input
                  type="number"
                  value={frequency || ""}
                  onChange={(e) => setFrequency(Number(e.target.value))}
                  placeholder={t("placeholders.frequency")}
                  className="w-full px-4 py-3 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:border-emerald-500 outline-none transition-all text-sm font-medium placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 ml-1">{t("lifespan")}</label>
                <input
                  type="number"
                  value={lifespan || ""}
                  onChange={(e) => setLifespan(Number(e.target.value))}
                  placeholder={t("placeholders.lifespan")}
                  className="w-full px-4 py-3 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:border-emerald-500 outline-none transition-all text-sm font-medium placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 ml-1">{t("margin")}</label>
                <input
                  type="number"
                  value={margin || ""}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  placeholder="0%"
                  className="w-full px-4 py-3 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:border-emerald-500 outline-none transition-all text-sm font-medium placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center shadow-sm">
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">{t("ltvResult")}</span>
              <span className="text-lg font-black text-emerald-500">{formatCurrency(ltv)}</span>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Hasil & Analisis */}
        <div className="lg:col-span-7 space-y-8">
          <div className="p-10 lg:p-16 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl space-y-12 relative overflow-hidden h-full flex flex-col justify-center aksana-glass shadow-sm">
            
            <div className="space-y-2 text-center">
              <h2 className="text-3xl font-black text-black dark:text-white uppercase">{t("healthRatio")}</h2>
              <p className="text-slate-600 dark:text-slate-300 font-normal italic">{t("analysis")}</p>
            </div>

            <div className="relative h-64 flex items-center justify-center">
              <div className="w-80 h-80 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3">
                <Doughnut data={chartData} options={chartOptions} />
              </div>
              <div className="relative z-10 text-center mt-12">
                <span className={`text-6xl font-black ${ratio < 1 ? "text-rose-500" : ratio <= 3 ? "text-amber-500" : "text-emerald-500"}`}>
                  {ratio}x
                </span>
                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest mt-2">{t("ratioLabel")}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl space-y-1 shadow-sm">
                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-[0.2em]">{t("totalCac")}</p>
                <p className="text-xl font-black text-blue-500">{formatCurrency(cac)}</p>
              </div>
              <div className="p-6 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl space-y-1 shadow-sm">
                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-[0.2em]">{t("netLtv")}</p>
                <p className="text-xl font-black text-emerald-500">{formatCurrency(ltv)}</p>
              </div>
            </div>

            <div className={`p-8 rounded-[2rem] border-2 ${recommendation.bg} border-white/20 dark:border-white/5 space-y-4`}>
              <div className="flex items-center gap-3">
                <BrainCircuit className={recommendation.color} size={24} />
                <h4 className={`text-xs font-black uppercase tracking-widest ${recommendation.color}`}>{t("aiRecommendation")}</h4>
              </div>
              <p className="text-lg font-bold text-black dark:text-slate-200 leading-relaxed">
                {recommendation.text}
              </p>
            </div>

            <div className="flex items-center justify-between pt-6">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                <TrendingUp size={14} className="text-emerald-500" />
                {t("realtime")}
              </div>
              {isSyncing && (
                <div className="flex items-center gap-2 text-[10px] font-bold text-blue-500 animate-pulse">
                  <Loader2 size={12} className="animate-spin" />
                  {t("syncing")}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
      
      {/* Help Section */}
      <div className="mt-12 p-8 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 text-xs leading-relaxed flex gap-6 items-start">
        <div className="p-3 bg-slate-900 dark:bg-white/5 rounded-2xl shrink-0">
          <Info size={24} className="text-white dark:text-slate-950" />
        </div>
        <div className="space-y-4">
          <p><strong className="text-black dark:text-slate-100">{t("whatIsLtvCac")}</strong> {t("ltvCacDescription")}</p>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <li><span className="text-rose-500 font-bold">&lt; 1:1</span> {t("loss")}</li>
            <li><span className="text-amber-500 font-bold">1:1 - 3:1</span> {t("stable")}</li>
            <li><span className="text-emerald-500 font-bold">&gt; 3:1</span> {t("veryHealthy")}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Doughnut } from 'react-chartjs-2';
import { BrainCircuit, TrendingUp, Loader2 } from "lucide-react";
import { formatCurrency } from "../utils/formatters";

interface ResultsPanelProps {
    t: any;
  ratio: number;
  cac: number;
  ltv: number;
  isSyncing?: boolean;
}

export const ResultsPanel = ({ t, ratio, cac, ltv, isSyncing }: ResultsPanelProps) => {
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
    <div className="space-y-8">
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
  );
}

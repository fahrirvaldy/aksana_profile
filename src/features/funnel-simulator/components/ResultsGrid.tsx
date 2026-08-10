
"use client";

import { TrendingUp, Target } from "lucide-react";
import { formatCurrency, formatNumber } from "../utils/formatters";

interface ResultsGridProps {
    t: (key: string, params?: Record<string, any>) => string;
  results: {
    roas: number;
    revenue: number;
    profit: number;
    cpa: number;
    purchases: number;
  };
}

export const ResultsGrid = ({ t, results }: ResultsGridProps) => {
  const getRoasColor = (roas: number) => {
    if (roas >= 3) return { text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-900/20', tagBg: 'bg-emerald-200/50 text-emerald-800' };
    if (roas >= 1.5) return { text: 'text-blue-700', bg: 'bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-900/20', tagBg: 'bg-blue-200/50 text-blue-800' };
    return { text: 'text-rose-700', bg: 'bg-rose-50 border-rose-200 dark:bg-rose-900/10 dark:border-rose-900/20', tagBg: 'bg-rose-200/50 text-rose-800' };
  };

  const roasStyle = getRoasColor(results.roas);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className={`p-6 rounded-xl border transition-all ${roasStyle.bg}`}>
        <div className="flex flex-col items-center text-center space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">{t("results.roas")}</p>
          <h4 className={`text-4xl font-black ${roasStyle.text}`}>{results.roas.toFixed(2)}x</h4>
          <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${roasStyle.tagBg}`}>
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
  );
};

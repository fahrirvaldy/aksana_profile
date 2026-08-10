
"use client";

import { User } from "@supabase/supabase-js";
import { Bar } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';
import { TrendingUp, Save, Loader2, Info } from "lucide-react";
import { formatValue } from "../utils/formatters";
import { Metrics } from "../types";

interface ResultsPanelProps {
    t: (key: string, params?: Record<string, any>) => string;
  currency: 'IDR' | 'USD';
  currentProfit: number;
  targetProfit: number;
  targetRevenue: number;
  isSyncing?: boolean;
  user?: User;
  handleSave: () => void;
  calculateDerived: (m: Metrics) => { profit: number; revenue: number; customers: number; };
  current: Metrics;
  target: Metrics;
}

export const ResultsPanel = (
  { t, currency, currentProfit, targetProfit, targetRevenue, isSyncing, user, handleSave, calculateDerived, current, target }: ResultsPanelProps
) => {

  const commonOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const val = context.raw as number | [number, number];
            if (Array.isArray(val)) return formatValue(val[1] - val[0], currency, true);
            return formatValue(val as number, currency, true);
          }
        }
      }
    },
    scales: {
      y: { grid: { display: false }, ticks: { display: false }, border: { display: false } },
      x: { grid: { display: false }, border: { display: false } }
    }
  };

  const barChartData: ChartData<'bar'> = {
    labels: [t("fiveWays.current"), t("fiveWays.target")],
    datasets: [{
      label: 'Profit Proyeksi',
      data: [currentProfit, targetProfit],
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
        const base = currentProfit;
        const step1 = calculateDerived({ ...current, leads: target.leads }).profit;
        const step2 = calculateDerived({ ...current, leads: target.leads, conv: target.conv }).profit;
        const step3 = calculateDerived({ ...current, leads: target.leads, conv: target.conv, trans: target.trans }).profit;
        const step4 = calculateDerived({ ...current, leads: target.leads, conv: target.conv, trans: target.trans, sale: target.sale }).profit;
        const final = targetProfit;

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

  return (
    <div className="space-y-8">
      <div className="p-10 rounded-[3rem] bg-black text-white space-y-8 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="relative space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white">{t("results.title")}</span>
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5 shadow-sm">
              <TrendingUp size={12} /> {t("results.growth", { percent: (((targetProfit - currentProfit) / (currentProfit || 1)) * 100).toFixed(1) })}
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-5xl font-black tracking-tighter">{formatValue(targetProfit, currency, true)}</h2>
            <p className="text-slate-700 dark:text-slate-400 text-xs font-medium italic">{t("results.current", { val: formatValue(currentProfit, currency, true) })}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1 shadow-sm">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-700 dark:text-slate-400">{t("results.revenue")}</p>
              <p className="text-sm font-black">{formatValue(targetRevenue, currency, true)}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1 shadow-sm">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-700 dark:text-slate-400">{t("results.profitIncrease")}</p>
              <p className="text-sm font-black text-emerald-400">+{formatValue(targetProfit - currentProfit, currency, true)}</p>
            </div>
          </div>
        </div>
        <div className="h-48 w-full">
          <Bar data={barChartData} options={commonOptions} />
        </div>
        {user && (
          <button
            onClick={handleSave}
            disabled={isSyncing}
            className="w-full py-5 rounded-2xl bg-white text-black font-black flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-xl disabled:opacity-50"
          >
            {isSyncing ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> {t("results.save")}</>}
          </button>
        )}
      </div>
      <div className="p-8 rounded-xl bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 space-y-6 aksana-glass shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">{t("waterfall.title")}</h3>
          <Info size={14} className="text-slate-600 dark:text-slate-300" />
        </div>
        <div className="h-56 w-full">
          <Bar data={waterfallData} options={commonOptions} />
        </div>
      </div>
    </div>
  );
};

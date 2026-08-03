
"use client";

import { Bar } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';
import { BarChart3, Info } from "lucide-react";
import { formatNumber } from "../utils/formatters";

interface FunnelChartProps {
  t: (key: string) => string;
  results: {
    impressions: number;
    clicks: number;
    visitors: number;
    atcs: number;
    purchases: number;
  };
}

export const FunnelChart = ({ t, results }: FunnelChartProps) => {
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
  );
}

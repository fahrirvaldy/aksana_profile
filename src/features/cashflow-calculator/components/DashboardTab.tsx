
"use client";

import { DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';
import { formatCurrency } from "../utils/formatCurrency";
import { Record, PeriodType } from "../types";

interface DashboardTabProps {
    t: any;
  metrics: {
    avgNetFlow: number;
    opsRatio: number;
    runway: number;
    score: number;
    finalBalance: number;
  };
  records: Record[];
  initialBalance: number;
  periodType: PeriodType;
}

export const DashboardTab = ({ t, metrics, records, initialBalance, periodType }: DashboardTabProps) => {
  const chartData = {
    labels: ['Awal', ...records.map(r => r.name)],
    datasets: [
      {
        label: 'Saldo Kas',
        data: [initialBalance, ...records.map(r => r.balance)],
        fill: true,
        borderColor: '#0f172a',
        backgroundColor: 'rgba(15, 23, 42, 0.05)',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#0f172a',
      }
    ]
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: { display: false },
      },
      x: {
        grid: { display: false },
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Health Score Circle */}
        <div className="md:col-span-1 p-8 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center space-y-4 aksana-glass shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">{t("dashboard.healthScore")}</span>
          <div className="relative w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle className="text-black/5 dark:text-slate-950" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
              <circle
                className={metrics.score > 70 ? "text-emerald-500" : metrics.score > 40 ? "text-amber-500" : "text-rose-500"}
                strokeWidth="8"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * metrics.score) / 100}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="40" cx="50" cy="50"
                style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-3xl font-black text-black dark:text-white">{Math.round(metrics.score)}</span>
              <span className="text-[8px] font-bold uppercase text-slate-600 dark:text-slate-400">{t("dashboard.points")}</span>
            </div>
          </div>
          <div className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase ${
            metrics.score > 70 ? "bg-emerald-100 text-emerald-700" : metrics.score > 40 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
          }`}>
            {metrics.score > 70 ? t("dashboard.status.healthy") : metrics.score > 40 ? t("dashboard.status.warning") : t("dashboard.status.critical")}
          </div>
        </div>

        {/* Metric Cards */}
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-8 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 aksana-glass shadow-sm">
            <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-fit text-black dark:text-white"><DollarSign size={20} /></div>
            <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">{t("dashboard.finalBalance")}</p>
            <h3 className="text-2xl font-black text-black dark:text-white">{formatCurrency(metrics.finalBalance)}</h3>
          </div>
          <div className="p-8 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 aksana-glass shadow-sm">
            <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-fit text-black dark:text-white"><TrendingUp size={20} /></div>
            <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">{t("dashboard.avgNetFlow")}</p>
            <h3 className={`text-2xl font-black ${metrics.avgNetFlow >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{formatCurrency(metrics.avgNetFlow)}</h3>
          </div>
          <div className="p-8 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 aksana-glass shadow-sm">
            <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-fit text-black dark:text-white"><Calendar size={20} /></div>
            <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">{t("dashboard.runway")}</p>
            <h3 className="text-2xl font-black text-black dark:text-white">
              {metrics.runway === Infinity ? "∞" : `${metrics.runway.toFixed(1)} ${t(`dashboard.runwayUnit.${periodType}`)}`}
            </h3>
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="p-8 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl space-y-6 aksana-glass shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-slate-600 dark:text-slate-300">{t("dashboard.chartTitle")}</h3>
        <div className="h-[300px] w-full">
          {records.length > 0 ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div className="h-full flex items-center justify-center text-slate-600 dark:text-slate-400 italic text-sm">{t("dashboard.chartPlaceholder")}</div>
          )}
        </div>
      </div>
    </div>
  );
}

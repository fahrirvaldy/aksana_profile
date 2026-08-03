
'use client';

import { useMemo, ReactNode } from 'react';

import { motion } from "framer-motion";
import { Line } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';
import { Package, AlertTriangle, CheckCircle2, Info, Loader2, Download } from "lucide-react";
import { formatThousand } from "../utils/formatters";

interface AnalysisReportProps {
  t: {
    (key: string, params?: any): string;
    rich(key: string, params?: any): React.ReactNode;
  };
  sku: string;
  isSyncing?: boolean;
  onDownload: () => void;
  results: any; // Simplified for brevity
  stock: number;
  leadTime: number;
}

export const AnalysisReport = ({ t, sku, isSyncing, onDownload, results, stock, leadTime }: AnalysisReportProps) => {

  const chartData = useMemo(() => {
    if (!results) return null;

    const labels: string[] = [];
    const stockProjection: number[] = [];
    const ropLine: number[] = [];
    const safetyStockLine: number[] = [];

    const duration = (leadTime || 0) + 2;
    for (let i = 0; i <= duration; i++) {
      labels.push(`H+${i}`);
      stockProjection.push(Math.max(0, stock - (results.avgDailySales * i)));
      ropLine.push(results.rop);
      safetyStockLine.push(results.safetyStock);
    }

    return {
      labels,
      datasets: [
        { label: t('analysis.projection'), data: stockProjection, borderColor: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.4 },
        { label: t('analysis.ropLegend'), data: ropLine, borderColor: '#EF4444', borderDash: [5, 5], pointRadius: 0, fill: false },
        { label: t('analysis.safetyStockLegend'), data: safetyStockLine, borderColor: '#F59E0B', borderDash: [5, 5], pointRadius: 0, fill: { target: 'origin', above: 'rgba(245, 158, 11, 0.05)' } }
      ]
    };
  }, [results, stock, leadTime, t]);

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1000 },
    plugins: { legend: { position: 'bottom' as const, labels: { usePointStyle: true, padding: 20 } }, tooltip: { mode: 'index' as const, intersect: false } },
    scales: { y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' } }, x: { grid: { display: false } } }
  };

  if (!results) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-50 h-full">
        <Package size={64} className="mb-4 text-slate-300" />
        <h3 className="text-xl font-medium">{t('analysis.waiting')}</h3>
        <p className="max-w-xs text-sm mt-2">{t('analysis.waitingDesc')}</p>
      </div>
    );
  }

  return (
    <div id="report-area" className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar bg-white dark:bg-[#1E1E1E]">
      {/* Action Banner */}
      <div className={`p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 transition-colors duration-300 border border-slate-200 dark:border-slate-800 ${
        results.isAlert 
          ? 'bg-rose-50 dark:bg-rose-900/20 border-l-8 border-l-rose-500' 
          : 'bg-emerald-50 dark:bg-emerald-900/20 border-l-8 border-l-emerald-500'
      }`}>
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className={`p-4 rounded-xl ${results.isAlert ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
            {results.isAlert ? <AlertTriangle size={32} /> : <CheckCircle2 size={32} />}
          </div>
          <div>
            <h4 className={`text-xl font-bold ${results.isAlert ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
              {results.isAlert ? t('analysis.alert') : t('analysis.safe')}
            </h4>
            <p className={`text-sm ${results.isAlert ? 'text-rose-600 dark:text-rose-500' : 'text-emerald-600 dark:text-emerald-500'}`}>
              {results.isAlert 
                ? t('analysis.alertDesc', { stock, rop: Math.ceil(results.rop) }) 
                : t('analysis.safeDesc')}
            </p>
          </div>
        </div>
        <div className="text-center md:text-right border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-4 md:pt-0 md:pl-8 shadow-sm">
          <p className="text-xs uppercase font-semibold text-slate-600 dark:text-slate-300 opacity-70 mb-1">{t('analysis.targetLabel')}</p>
          <p className="text-4xl font-black text-black dark:text-white">{formatThousand(results.targetProduction)} <span className="text-lg font-medium opacity-70">{t('analysis.pcs')}</span></p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-2">{t('analysis.avgSales')}</p>
          <p className="text-2xl font-bold text-black dark:text-white">{results.avgDailySales.toFixed(2)}</p>
          <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-1">{t('analysis.avgSalesUnit')}</p>
        </div>
        <div className="p-6 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-2">{t('analysis.safetyStock')}</p>
          <p className="text-2xl font-bold text-amber-600">{formatThousand(results.safetyStock)}</p>
          <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-1">{t('analysis.safetyStockDesc')}</p>
        </div>
        <div className="p-6 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-2">{t('analysis.rop')}</p>
          <p className="text-2xl font-bold text-rose-600">{formatThousand(results.rop)}</p>
          <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-1">{t('analysis.ropDesc')}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-lg text-black dark:text-white">{t('analysis.chartTitle')}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">{t('analysis.chartDesc')}</p>
          </div>
          <div className="flex flex-wrap gap-4 text-[10px] font-medium">
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300"><div className="w-2 h-2 rounded-full bg-blue-500"/> {t('analysis.projection')}</span>
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300"><div className="w-2 h-0.5 bg-rose-500 border-dashed shadow-sm"/> {t('analysis.ropLegend')}</span>
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300"><div className="w-2 h-0.5 bg-amber-500 border-dashed shadow-sm"/> {t('analysis.safetyStockLegend')}</span>
          </div>
        </div>
        <div className="h-[350px] w-full bg-white dark:bg-[#1E1E1E] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {chartData && <Line data={chartData} options={chartOptions} />}
        </div>
        
        <div className="bg-white dark:bg-[#1E1E1E] rounded-xl p-6 border border-slate-200 dark:border-slate-800 text-sm shadow-sm">
          <h4 className="font-semibold text-slate-600 dark:text-slate-300 mb-3 flex items-center gap-2">
            <Info size={16} />
            {t('analysis.explanation')}
          </h4>
          <ul className="space-y-2 text-slate-600 dark:text-slate-300 font-mono text-[11px] break-all">
            <li>{t.rich('analysis.explanationList.stdDevMonthly', { val: results.stdDevMonthly.toFixed(2), bold: (chunks: ReactNode) => <span className="font-semibold text-black dark:text-slate-100">{chunks}</span> })}</li>
            <li>{t.rich('analysis.explanationList.stdDevDaily', { val1: results.stdDevMonthly.toFixed(2), val2: results.stdDevDaily.toFixed(2), bold: (chunks: ReactNode) => <span className="font-semibold text-black dark:text-slate-100">{chunks}</span> })}</li>
            <li>{t.rich('analysis.explanationList.safetyStock', { z: results.zScore, lt: results.leadTime, res: formatThousand(results.safetyStock), bold: (chunks: ReactNode) => <span className="font-semibold text-black dark:text-slate-100">{chunks}</span>, highlight: (chunks: ReactNode) => <strong className="text-black dark:text-slate-100">{chunks}</strong> })}</li>
            <li>{t.rich('analysis.explanationList.rop', { res: formatThousand(results.rop), bold: (chunks: ReactNode) => <span className="font-semibold text-black dark:text-slate-100">{chunks}</span>, highlight: (chunks: ReactNode) => <strong className="text-black dark:text-slate-100">{chunks}</strong> })}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

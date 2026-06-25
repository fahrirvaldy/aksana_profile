"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  Box, 
  Clock, 
  TrendingDown,
  Info,
  Loader2,
  Download
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTranslations } from "next-intl";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export interface ProductionData {
  sku: string;
  category: 'magnet' | 'profit';
  salesInput: string;
  leadTime: number;
  stock: number;
}

interface ProductionTargetSimulatorProps {
  user?: { id: string; [key: string]: unknown };
  onSave?: (data: ProductionData) => void;
  isSyncing?: boolean;
  initialData?: ProductionData;
}

// --- Helpers ---
const formatDisplayNumber = (val: string) => {
  if (!val) return "";
  // Remove non-numeric except comma and dot
  const clean = val.replace(/[^\d,.]/g, "");
  // If it's a comma-separated list (salesInput), we don't want to auto-format the whole thing as one number
  // But the user asked for thousand separator like 1.000.000
  return clean;
};

const parseNumber = (val: string): number => {
  if (!val) return 0;
  // Handle Indonesian format (1.000.000 -> 1000000)
  const clean = val.replace(/\./g, "").replace(/,/g, ".");
  return parseFloat(clean) || 0;
};

const formatThousand = (n: number) => {
  return Math.ceil(n).toLocaleString('id-ID');
};

export default function ProductionTargetSimulator({ 
  onSave, 
  isSyncing, 
  initialData 
}: ProductionTargetSimulatorProps) {
  const t = useTranslations("Tools.Production");
  // --- States ---
  const [sku, setSku] = useState<string>(initialData?.sku || "");
  const [category, setCategory] = useState<'magnet' | 'profit'>(initialData?.category || 'profit');
  const [salesInput, setSalesInput] = useState<string>(initialData?.salesInput || "");
  const [leadTime, setLeadTime] = useState<number>(initialData?.leadTime || 0);
  const [stock, setStock] = useState<number>(initialData?.stock || 0);
  const reportRef = useRef<HTMLDivElement>(null);

  // --- Syncing (Render-phase) ---
  const [prevInitialData, setPrevInitialData] = useState<ProductionData | undefined>(initialData);
  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData);
    if (initialData) {
      setSku(initialData.sku || "");
      setCategory(initialData.category || 'profit');
      setSalesInput(initialData.salesInput || "");
      setLeadTime(initialData.leadTime || 0);
      setStock(initialData.stock || 0);
    }
  }

  // --- Auto-save logic ---
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSave) {
        onSave({ sku, category, salesInput, leadTime, stock });
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [sku, category, salesInput, leadTime, stock, onSave]);

  // --- Core Mathematics ---
  const results = useMemo(() => {
    // Parse sales input: handle dots as thousand separators and commas as delimiters or decimals
    // For simplicity, if there are commas, we assume they are delimiters first.
    // If there's only one block with a comma, it might be a decimal.
    // But UMKM usually uses comma for list and dot for thousand.
    const parts = salesInput.split(/[,\n]/).map(s => s.trim()).filter(s => s !== "");
    const salesArray = parts.map(s => {
      const clean = s.replace(/\./g, "").replace(/,/g, ".");
      return parseFloat(clean);
    }).filter(n => !isNaN(n));

    if (salesArray.length < 2) return null;

    // Monthly Calculations
    const sum = salesArray.reduce((a, b) => a + b, 0);
    const meanMonthly = sum / salesArray.length;
    
    const varianceMonthly = salesArray.reduce((a, b) => a + Math.pow(b - meanMonthly, 2), 0) / (salesArray.length - 1);
    const stdDevMonthly = Math.sqrt(varianceMonthly);

    // Daily Calculations
    const avgDailySales = meanMonthly / 30;
    const stdDevDaily = stdDevMonthly / Math.sqrt(30);

    // Constants
    const zScore = category === 'magnet' ? 2.05 : 1.28;

    // Safety Stock & ROP
    const safetyStock = zScore * stdDevDaily * Math.sqrt(leadTime || 1);
    const leadTimeDemand = avgDailySales * (leadTime || 1);
    const rop = leadTimeDemand + safetyStock;

    // Target Production
    const targetProduction = Math.max(0, (rop + leadTimeDemand) - stock);

    return {
      avgDailySales,
      stdDevMonthly,
      stdDevDaily,
      safetyStock,
      rop,
      targetProduction,
      zScore,
      leadTime: leadTime || 1,
      isAlert: stock <= rop
    };
  }, [salesInput, category, leadTime, stock]);

  // --- Chart Data ---
  const chartData = useMemo(() => {
    if (!results) return null;

    const labels = [];
    const stockProjection = [];
    const ropLine = [];
    const safetyStockLine = [];

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
        {
          label: t('analysis.projection'),
          data: stockProjection,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: t('analysis.ropLegend'),
          data: ropLine,
          borderColor: '#EF4444',
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false,
        },
        {
          label: t('analysis.safetyStockLegend'),
          data: safetyStockLine,
          borderColor: '#F59E0B',
          borderDash: [5, 5],
          pointRadius: 0,
          fill: {
            target: 'origin',
            above: 'rgba(245, 158, 11, 0.05)',
          }
        }
      ]
    };
  }, [results, stock, leadTime]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1000 },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    }
  };

  const downloadReport = async () => {
    const element = document.getElementById('report-area');
    if (!element) return;
    
    const btn = document.getElementById('btn-download');
    if (!btn) return;
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<span>⏳</span> <span class="hidden sm:inline">${t('analysis.processing')}</span>`;

    try {
        // Dynamic import: library hanya dimuat di browser saat tombol ditekan
        const domtoimage = (await import('dom-to-image-more')).default;
        
        const isDark = document.documentElement.classList.contains('dark');
        
        const dataUrl = await domtoimage.toPng(element, {
            quality: 1.0,
            bgcolor: isDark ? '#0f172a' : '#fbfbfd',
        });

        const link = document.createElement('a');
        const cleanSkuName = sku.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() || t('analysis.untitled').replace(/\s+/g, '-').toLowerCase();
        link.download = `${t('analysis.reportFilename')}${cleanSkuName}.png`;
        link.href = dataUrl;
        link.click();
    } catch (err) {
        console.error(t('analysis.errorTitle'), err);
        alert(t('analysis.errorAlert'));
    } finally {
        btn.innerHTML = originalHTML;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Kolom Kiri: Input & Parameter */}
      <div className="lg:col-span-4 space-y-6">
        {/* Card 1: Identitas Produk */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600">
              <Package size={20} />
            </div>
            <h3 className="font-semibold text-lg">{t('identity.title')}</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1.5 ml-1 text-slate-600 dark:text-slate-300">{t('identity.sku')}</label>
              <input 
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder={t('identity.placeholderSku')}
                className="w-full px-4 py-3 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:ring-2 focus:ring-blue-500 transition-all outline-none placeholder-slate-400 dark:placeholder-slate-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1.5 ml-1 flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                {t('identity.category')}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setCategory('magnet')}
                  className={`py-3 rounded-xl border transition-all text-sm font-bold ${
                    category === 'magnet' 
                      ? 'bg-slate-900 border-slate-900 text-white dark:bg-slate-50 dark:text-slate-950' 
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E1E1E] text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {t('identity.magnet')}
                </button>
                <button
                  onClick={() => setCategory('profit')}
                  className={`py-3 rounded-xl border transition-all text-sm font-bold ${
                    category === 'profit' 
                      ? 'bg-slate-900 border-slate-900 text-white dark:bg-slate-50 dark:text-slate-950' 
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E1E1E] text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {t('identity.profit')}
                </button>
              </div>
              <div className="mt-3 p-3 bg-white dark:bg-[#1E1E1E] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xs text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
                  {category === 'magnet' ? t('identity.magnetDesc') : t('identity.profitDesc')}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Data Lapangan */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-black text-white rounded-lg">
              <TrendingDown size={20} />
            </div>
            <h3 className="font-bold text-lg text-black dark:text-white">{t('data.title')}</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1.5 ml-1 text-slate-600 dark:text-slate-300">{t('data.sales')}</label>
              <textarea 
                value={salesInput}
                onChange={(e) => setSalesInput(e.target.value)}
                placeholder={t('data.placeholderSales')}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:ring-2 focus:ring-black transition-all outline-none placeholder-slate-400 dark:placeholder-slate-500 resize-none font-mono text-sm font-semibold"
              />
              <p className="text-[10px] text-slate-600 dark:text-slate-300 font-normal mt-1 ml-1">{t('data.salesNote')}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1.5 ml-1 text-slate-600 dark:text-slate-300">{t('data.leadTime')}</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                  <input 
                    type="text"
                    value={leadTime ? leadTime.toLocaleString('id-ID') : ""}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\./g, "");
                      if (/^\d*$/.test(val)) {
                        setLeadTime(val === "" ? 0 : parseInt(val));
                      }
                    }}
                    placeholder={t('data.placeholderLeadTime')}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:ring-2 focus:ring-black transition-all outline-none placeholder-slate-400 dark:placeholder-slate-500 font-semibold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5 ml-1 text-slate-600 dark:text-slate-300">{t('data.stock')}</label>
                <div className="relative">
                  <Box className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                  <input 
                    type="text"
                    value={stock ? stock.toLocaleString('id-ID') : ""}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\./g, "");
                      if (/^\d*$/.test(val)) {
                        setStock(val === "" ? 0 : parseInt(val));
                      }
                    }}
                    placeholder={t('data.placeholderStock')}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:ring-2 focus:ring-black transition-all outline-none placeholder-slate-400 dark:placeholder-slate-500 font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Kolom Kanan: Dashboard Analisis */}
      <div className="lg:col-span-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl h-full overflow-hidden flex flex-col shadow-sm"
        >
          {/* Header Laporan */}
          <div className="p-8 pb-4 border-b border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">{t('analysis.subtitle')}</p>
                <h2 className="text-3xl font-bold">{sku || t('analysis.untitled')}</h2>
              </div>
              <div className="flex items-center gap-3">
                {isSyncing && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-full text-blue-600 text-xs font-medium">
                    <Loader2 size={12} className="animate-spin" />
                    {t('analysis.sync')}
                  </div>
                )}
                <button 
                  id="btn-download"
                  onClick={downloadReport}
                  disabled={!results}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-full text-sm font-medium transition-colors shadow-sm"
                >
                  <Download size={16} />
                  <span>{t('analysis.export')}</span>
                </button>
              </div>
            </div>
          </div>

          {!results ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-50">
              <Package size={64} className="mb-4 text-slate-300" />
              <h3 className="text-xl font-medium">{t('analysis.waiting')}</h3>
              <p className="max-w-xs text-sm mt-2">{t('analysis.waitingDesc')}</p>
            </div>
          ) : (
            <div id="report-area" ref={reportRef} className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar bg-white dark:bg-[#1E1E1E]">
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
                
                {/* Logic Logs (Penjelasan Perhitungan) */}
                <div className="bg-white dark:bg-[#1E1E1E] rounded-xl p-6 border border-slate-200 dark:border-slate-800 text-sm shadow-sm">
                  <h4 className="font-semibold text-slate-600 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <Info size={16} />
                    {t('analysis.explanation')}
                  </h4>
                  <ul className="space-y-2 text-slate-600 dark:text-slate-300 font-mono text-[11px] break-all">
                    <li>
                      {t.rich('analysis.explanationList.stdDevMonthly', {
                        val: results.stdDevMonthly.toFixed(2),
                        bold: (chunks) => <span className="font-semibold text-black dark:text-slate-100">{chunks}</span>
                      })}
                    </li>
                    <li>
                      {t.rich('analysis.explanationList.stdDevDaily', {
                        val1: results.stdDevMonthly.toFixed(2),
                        val2: results.stdDevDaily.toFixed(2),
                        bold: (chunks) => <span className="font-semibold text-black dark:text-slate-100">{chunks}</span>
                      })}
                    </li>
                    <li>
                      {t.rich('analysis.explanationList.safetyStock', {
                        z: results.zScore,
                        lt: results.leadTime,
                        res: formatThousand(results.safetyStock),
                        bold: (chunks) => <span className="font-semibold text-black dark:text-slate-100">{chunks}</span>,
                        highlight: (chunks) => <strong className="text-black dark:text-slate-100">{chunks}</strong>
                      })}
                    </li>
                    <li>
                      {t.rich('analysis.explanationList.rop', {
                        res: formatThousand(results.rop),
                        bold: (chunks) => <span className="font-semibold text-black dark:text-slate-100">{chunks}</span>,
                        highlight: (chunks) => <strong className="text-black dark:text-slate-100">{chunks}</strong>
                      })}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

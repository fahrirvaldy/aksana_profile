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
          label: 'Proyeksi Stok',
          data: stockProjection,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Alarm Produksi (ROP)',
          data: ropLine,
          borderColor: '#EF4444',
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false,
        },
        {
          label: 'Safety Stock',
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
    btn.innerHTML = '<span>⏳</span> <span class="hidden sm:inline">Memproses...</span>';

    try {
        // Dynamic import: library hanya dimuat di browser saat tombol ditekan
        const domtoimage = (await import('dom-to-image-more')).default;
        
        const isDark = document.documentElement.classList.contains('dark');
        
        const dataUrl = await domtoimage.toPng(element, {
            quality: 1.0,
            bgcolor: isDark ? '#0f172a' : '#fbfbfd',
        });

        const link = document.createElement('a');
        const cleanSkuName = sku.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() || 'produk-tanpa-nama';
        link.download = `Laporan-Target-Produksi-${cleanSkuName}.png`;
        link.href = dataUrl;
        link.click();
    } catch (err) {
        console.error("Gagal membuat gambar PNG: ", err);
        alert("Terjadi kesalahan saat memproses gambar.");
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
          className="aksana-glass p-6 rounded-[2rem] shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600">
              <Package size={20} />
            </div>
            <h3 className="font-semibold text-lg">Identitas Produk</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 ml-1">Nama / SKU Produk</label>
              <input 
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Contoh: Hijab Voal Ultra"
                className="w-full px-4 py-3 rounded-xl border bg-white/50 dark:bg-black/50 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 ml-1 flex items-center gap-1.5">
                Kategori Strategis
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setCategory('magnet')}
                  className={`py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                    category === 'magnet' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  Produk Magnet 🔥
                </button>
                <button
                  onClick={() => setCategory('profit')}
                  className={`py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                    category === 'profit' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  Produk Profit 💰
                </button>
              </div>
              <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {category === 'magnet' ? (
                    <><strong>Produk Magnet:</strong> Harus selalu tersedia (Service Level 98%). Umumnya digunakan sebagai penarik pengunjung toko Anda.</>
                  ) : (
                    <><strong>Produk Profit:</strong> Fokus pada perputaran modal (Service Level 90%). Dapat ditoleransi jika sesekali habis demi efisiensi modal.</>
                  )}
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
          className="aksana-glass p-6 rounded-[2rem] shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600">
              <TrendingDown size={20} />
            </div>
            <h3 className="font-semibold text-lg">Data Lapangan</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 ml-1">Historis Penjualan Bulanan</label>
              <textarea 
                value={salesInput}
                onChange={(e) => setSalesInput(e.target.value)}
                placeholder="Contoh: 150, 180, 140, 210, 190, 250"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border bg-white/50 dark:bg-black/50 focus:ring-2 focus:ring-emerald-500 transition-all outline-none resize-none font-mono text-sm"
              />
              <p className="text-[10px] text-slate-400 mt-1 ml-1">* Pisahkan dengan koma. Bisa menggunakan titik sebagai pemisah ribuan.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 ml-1">Lead Time (Hari)</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text"
                    value={leadTime ? leadTime.toLocaleString('id-ID') : ""}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\./g, "");
                      if (/^\d*$/.test(val)) {
                        setLeadTime(val === "" ? 0 : parseInt(val));
                      }
                    }}
                    placeholder="7"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border bg-white/50 dark:bg-black/50 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 ml-1">Sisa Stok (Pcs)</label>
                <div className="relative">
                  <Box className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text"
                    value={stock ? stock.toLocaleString('id-ID') : ""}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\./g, "");
                      if (/^\d*$/.test(val)) {
                        setStock(val === "" ? 0 : parseInt(val));
                      }
                    }}
                    placeholder="50"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border bg-white/50 dark:bg-black/50 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
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
          className="aksana-glass h-full rounded-[2.5rem] overflow-hidden flex flex-col shadow-lg border-white/40"
        >
          {/* Header Laporan */}
          <div className="p-8 pb-4 border-b border-white/20">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Simulasi Target Produksi</p>
                <h2 className="text-3xl font-bold">{sku || "Untitled SKU"}</h2>
              </div>
              <div className="flex items-center gap-3">
                {isSyncing && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-full text-blue-600 text-xs font-medium">
                    <Loader2 size={12} className="animate-spin" />
                    Sync...
                  </div>
                )}
                <button 
                  id="btn-download"
                  onClick={downloadReport}
                  disabled={!results}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-full text-sm font-medium transition-colors shadow-sm"
                >
                  <Download size={16} />
                  <span>Unduh PNG</span>
                </button>
              </div>
            </div>
          </div>

          {!results ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-50">
              <Package size={64} className="mb-4 text-slate-300" />
              <h3 className="text-xl font-medium">Menunggu Data Valid</h3>
              <p className="max-w-xs text-sm mt-2">Masukkan setidaknya 2 data historis penjualan untuk memulai analisis.</p>
            </div>
          ) : (
            <div id="report-area" ref={reportRef} className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar bg-white dark:bg-slate-900">
              {/* Action Banner */}
              <div className={`p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 transition-colors duration-300 ${
                results.isAlert 
                  ? 'bg-rose-50 dark:bg-rose-900/20 border-l-8 border-rose-500' 
                  : 'bg-emerald-50 dark:bg-emerald-900/20 border-l-8 border-emerald-500'
              }`}>
                <div className="flex items-center gap-4 text-center md:text-left">
                  <div className={`p-4 rounded-2xl ${results.isAlert ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
                    {results.isAlert ? <AlertTriangle size={32} /> : <CheckCircle2 size={32} />}
                  </div>
                  <div>
                    <h4 className={`text-xl font-bold ${results.isAlert ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                      {results.isAlert ? "🚨 Waktunya Memproduksi!" : "✅ Stok Masih Aman"}
                    </h4>
                    <p className={`text-sm ${results.isAlert ? 'text-rose-600 dark:text-rose-500' : 'text-emerald-600 dark:text-emerald-500'}`}>
                      {results.isAlert 
                        ? `Sisa stok (${stock}) sudah di bawah Alarm Produksi (${Math.ceil(results.rop)}).` 
                        : "Jumlah stok masih mencukupi kebutuhan operasional."}
                    </p>
                  </div>
                </div>
                <div className="text-center md:text-right border-t md:border-t-0 md:border-l border-current/10 pt-4 md:pt-0 md:pl-8">
                  <p className="text-xs uppercase font-semibold opacity-70 mb-1">Target Produksi Sekarang</p>
                  <p className="text-4xl font-black">{formatThousand(results.targetProduction)} <span className="text-lg font-medium opacity-70">Pcs</span></p>
                </div>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Avg Sales / Hari</p>
                  <p className="text-2xl font-bold dark:text-white">{results.avgDailySales.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Pcs per hari</p>
                </div>
                <div className="p-6 bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Stok Jaga-jaga 🛡️</p>
                  <p className="text-2xl font-bold text-amber-600">{formatThousand(results.safetyStock)}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Batas aman sebelum stok habis</p>
                </div>
                <div className="p-6 bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Alarm Produksi 🔔</p>
                  <p className="text-2xl font-bold text-rose-600">{formatThousand(results.rop)}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Mulai produksi jika stok mencapai angka ini</p>
                </div>
              </div>

              {/* Chart */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-lg dark:text-white">Simulasi Pergerakan Stok</h4>
                    <p className="text-xs text-slate-500">Proyeksi sisa stok jika tidak memproduksi hari ini.</p>
                  </div>
                  <div className="flex flex-wrap gap-4 text-[10px] font-medium">
                    <span className="flex items-center gap-1 dark:text-slate-300"><div className="w-2 h-2 rounded-full bg-blue-500"/> Proyeksi</span>
                    <span className="flex items-center gap-1 dark:text-slate-300"><div className="w-2 h-0.5 bg-rose-500 border-dashed"/> Alarm (ROP)</span>
                    <span className="flex items-center gap-1 dark:text-slate-300"><div className="w-2 h-0.5 bg-amber-500 border-dashed"/> Safety Stock</span>
                  </div>
                </div>
                <div className="h-[350px] w-full bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
                  {chartData && <Line data={chartData} options={chartOptions} />}
                </div>
                
                {/* Logic Logs (Penjelasan Perhitungan) */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 text-sm">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                    <Info size={16} />
                    💡 Penjelasan Perhitungan:
                  </h4>
                  <ul className="space-y-2 text-slate-600 dark:text-slate-400 font-mono text-[11px] break-all">
                    <li>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Fluktuasi Bulanan (StdDev):</span> {results.stdDevMonthly.toFixed(2)}
                    </li>
                    <li>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Normalisasi Harian:</span> {results.stdDevMonthly.toFixed(2)} / √30 = {results.stdDevDaily.toFixed(2)}
                    </li>
                    <li>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Stok Jaga-jaga:</span> Z-Score({results.zScore}) × Fluktuasi Harian × √LeadTime({results.leadTime}) = <strong className="text-slate-800 dark:text-slate-200">{formatThousand(results.safetyStock)}</strong>
                    </li>
                    <li>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Alarm Produksi:</span> (Rata Harian × Lead Time) + Stok Jaga-jaga = <strong className="text-slate-800 dark:text-slate-200">{formatThousand(results.rop)}</strong>
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

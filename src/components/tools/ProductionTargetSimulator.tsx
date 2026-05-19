"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  Box, 
  Clock, 
  TrendingDown,
  Info,
  Loader2
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
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
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
    const salesArray = salesInput
      .split(',')
      .map(s => parseFloat(s.trim()))
      .filter(n => !isNaN(n));

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
    const rop = (avgDailySales * (leadTime || 1)) + safetyStock;

    // Target Production
    const targetProduction = Math.max(0, (rop + (avgDailySales * (leadTime || 1))) - stock);

    return {
      avgDailySales,
      safetyStock,
      rop,
      targetProduction,
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
          label: 'Reorder Point (ROP)',
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
          fill: false,
        }
      ]
    };
  }, [results, stock, leadTime]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
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
                <div className="group relative">
                  <Info size={14} className="text-slate-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    Magnet: Produk traffic (Service level tinggi 98%). <br/>
                    Profit: Produk margin (Service level 90%).
                  </div>
                </div>
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
                  Magnet (98%)
                </button>
                <button
                  onClick={() => setCategory('profit')}
                  className={`py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                    category === 'profit' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  Profit (90%)
                </button>
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
                placeholder="Contoh: 120, 145, 110, 160..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border bg-white/50 dark:bg-black/50 focus:ring-2 focus:ring-emerald-500 transition-all outline-none resize-none"
              />
              <p className="text-[10px] text-slate-400 mt-1 ml-1">* Masukkan total penjualan per bulan, pisahkan dengan koma.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 ml-1">Lead Time (Hari)</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="number"
                    value={leadTime || ""}
                    onChange={(e) => setLeadTime(Number(e.target.value))}
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
                    type="number"
                    value={stock || ""}
                    onChange={(e) => setStock(Number(e.target.value))}
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
              {isSyncing && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-full text-blue-600 text-xs font-medium">
                  <Loader2 size={12} className="animate-spin" />
                  Mensinkronkan...
                </div>
              )}
            </div>
          </div>

          {!results ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-50">
              <Package size={64} className="mb-4 text-slate-300" />
              <h3 className="text-xl font-medium">Menunggu Data Valid</h3>
              <p className="max-w-xs text-sm mt-2">Masukkan setidaknya 2 data historis penjualan untuk memulai analisis.</p>
            </div>
          ) : (
            <div className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
              {/* Action Banner */}
              <div className={`p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 ${
                results.isAlert 
                  ? 'bg-rose-500/10 border border-rose-200' 
                  : 'bg-emerald-500/10 border border-emerald-200'
              }`}>
                <div className="flex items-center gap-4 text-center md:text-left">
                  <div className={`p-4 rounded-2xl ${results.isAlert ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
                    {results.isAlert ? <AlertTriangle size={32} /> : <CheckCircle2 size={32} />}
                  </div>
                  <div>
                    <h4 className={`text-xl font-bold ${results.isAlert ? 'text-rose-700' : 'text-emerald-700'}`}>
                      {results.isAlert ? "Waktunya Memproduksi!" : "Stok Masih Aman"}
                    </h4>
                    <p className={`text-sm ${results.isAlert ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {results.isAlert 
                        ? "Sisa stok sudah di bawah Reorder Point (ROP)." 
                        : "Jumlah stok masih mencukupi kebutuhan operasional."}
                    </p>
                  </div>
                </div>
                <div className="text-center md:text-right border-t md:border-t-0 md:border-l border-current/10 pt-4 md:pt-0 md:pl-8">
                  <p className="text-xs uppercase font-semibold opacity-70 mb-1">Target Produksi</p>
                  <p className="text-4xl font-black">{Math.round(results.targetProduction)} <span className="text-lg font-medium opacity-70">Pcs</span></p>
                </div>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white/40 dark:bg-white/5 rounded-[2rem] border border-white/20">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Avg Sales / Hari</p>
                  <p className="text-2xl font-bold">{results.avgDailySales.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Estimasi pengeluaran stok</p>
                </div>
                <div className="p-6 bg-white/40 dark:bg-white/5 rounded-[2rem] border border-white/20">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Safety Stock</p>
                  <p className="text-2xl font-bold text-amber-600">{Math.round(results.safetyStock)}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Cadangan ketidakpastian</p>
                </div>
                <div className="p-6 bg-white/40 dark:bg-white/5 rounded-[2rem] border border-white/20">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Reorder Point</p>
                  <p className="text-2xl font-bold text-rose-600">{Math.round(results.rop)}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Batas aman stok sisa</p>
                </div>
              </div>

              {/* Chart */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-lg">Visualisasi Burndown</h4>
                  <div className="flex gap-4 text-[10px] font-medium">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"/> Stok</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-0.5 bg-rose-500 border-dashed"/> ROP</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-0.5 bg-amber-500 border-dashed"/> Safety</span>
                  </div>
                </div>
                <div className="h-[300px] w-full bg-white/30 dark:bg-black/20 p-4 rounded-3xl border border-white/20">
                  {chartData && <Line data={chartData} options={chartOptions} />}
                </div>
                <p className="text-xs text-slate-400 text-center italic">
                  * Grafik memproyeksikan sisa stok dari hari ini hingga H+{leadTime + 2} berdasarkan rata-rata harian.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

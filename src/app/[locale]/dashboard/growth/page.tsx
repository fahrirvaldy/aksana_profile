"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { 
  ArrowLeft,
  Zap,
  Users,
  Percent,
  History as HistoryIcon,
  DollarSign,
  BarChart,
  Loader2,
  Save,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface HistoryEntry {
  id: string;
  created_at: string;
  data_payload: any;
}

export default function GrowthSimulator() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [globalGrowth, setGlobalGrowth] = useState<number>(10);

  // Growth Factors State
  const [current, setCurrent] = useState({
    leads: 1000,
    conversion: 10,
    transactions: 2,
    avgSale: 500000,
    margin: 25,
    marketingCost: 5000000,
    fixedCosts: 10000000
  });

  const [target, setTarget] = useState({
    leads: 1100,
    conversion: 11,
    transactions: 2.2,
    avgSale: 550000,
    margin: 27.5
  });

  const fetchHistory = useCallback(async (cId: string) => {
    const { data, error } = await supabase
      .from('tool_data_history')
      .select('id, created_at, data_payload')
      .eq('company_id', cId)
      .eq('tool_id', 'growth-simulator')
      .order('created_at', { ascending: false })
      .limit(3);

    if (!error && data) setHistory(data as any);
  }, []);

  useEffect(() => {
    const initPage = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', session.user.id).single();
      if (profile?.company_id) {
        setCompanyId(profile.company_id);
        await fetchHistory(profile.company_id);
      }
      setIsLoading(false);
    };
    initPage();
  }, [router, fetchHistory]);

  const applyGlobalGrowth = (percent: number) => {
    const factor = 1 + (percent / 100);
    setTarget({
      leads: Number((current.leads * factor).toFixed(0)),
      conversion: Number((current.conversion * factor).toFixed(2)),
      transactions: Number((current.transactions * factor).toFixed(2)),
      avgSale: Number((current.avgSale * factor).toFixed(0)),
      margin: Number((current.margin * factor).toFixed(2)),
    });
  };

  // Calculations Logic
  const calculateResult = (data: any) => {
    const customers = data.leads * (data.conversion / 100);
    const revenue = customers * data.transactions * data.avgSale;
    const profit = revenue * (data.margin / 100);
    return { customers, revenue, profit };
  };

  const currRes = calculateResult(current);
  const targetRes = calculateResult({ ...current, ...target });

  // BEP / CAC / LTV
  const cac = current.marketingCost / (current.leads * (current.conversion / 100) || 1);
  const ltv = (current.avgSale * current.transactions * (current.margin / 100));
  const bep = current.fixedCosts / (current.margin / 100 || 0.01);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const chartData = {
    labels: ['Profit Saat Ini', 'Target Profit'],
    datasets: [
      {
        label: 'Proyeksi Keuntungan',
        data: [currRes.profit, targetRes.profit],
        backgroundColor: ['#64748b', '#0f172a'],
        borderRadius: 12,
      },
    ],
  };

  const handleSave = async () => {
    if (!companyId) return;
    setIsSaving(true);
    const { error } = await supabase.from('tool_data_history').insert([{
      company_id: companyId,
      tool_id: 'growth-simulator',
      data_payload: { current, target, results: { currRes, targetRes } }
    }]);
    if (!error) await fetchHistory(companyId);
    setIsSaving(false);
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[70vh]"><Loader2 className="animate-spin text-slate-700" size={40} /></div>;

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-slate-50 transition-colors mb-8 group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Kembali ke Dasbor
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Growth Simulator</h1>
          <p className="text-slate-700 dark:text-slate-400">Strategi 5-Ways untuk melipatgandakan profit bisnis Anda.</p>
        </div>
        <div className="flex items-center gap-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-black dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 px-3">
            <Zap size={16} className="text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider">Global Growth</span>
          </div>
          <input 
            type="number" 
            value={globalGrowth} 
            onChange={(e) => {
              const val = Number(e.target.value);
              setGlobalGrowth(val);
              applyGlobalGrowth(val);
            }}
            className="w-16 bg-white dark:bg-slate-900 border-none rounded-xl px-2 py-1 text-center font-bold outline-none"
          />
          <span className="pr-3 font-bold">%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Matrix */}
        <div className="lg:col-span-2 space-y-8">
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-black dark:border-slate-800 shadow-sm overflow-x-auto aksana-glass">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-slate-700 border-b border-black dark:border-slate-800 shadow-sm">
                  <th className="pb-4 font-semibold">Faktor Pertumbuhan</th>
                  <th className="pb-4 font-semibold">Saat Ini</th>
                  <th className="pb-4 font-semibold">Target Baru</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { key: 'leads', label: 'Leads (Calon)', icon: <Users size={14} /> },
                  { key: 'conversion', label: 'Konversi (%)', icon: <Percent size={14} />, suffix: '%' },
                  { key: 'transactions', label: 'Beli Ulang', icon: <HistoryIcon size={14} /> },
                  { key: 'avgSale', label: 'Rata Belanja', icon: <DollarSign size={14} />, isPrice: true },
                  { key: 'margin', label: 'Margin (%)', icon: <BarChart size={14} />, suffix: '%' },
                ].map((item) => (
                  <tr key={item.key} className="border-b border-slate-50 dark:border-slate-800/50 shadow-sm">
                    <td className="py-4 font-medium flex items-center gap-3">
                      <span className="text-slate-700">{item.icon}</span>
                      {item.label}
                    </td>
                    <td className="py-4">
                      <input 
                        type="number" 
                        value={(current as any)[item.key]} 
                        onChange={(e) => setCurrent({...current, [item.key]: Number(e.target.value)})}
                        className="w-24 bg-transparent border-none font-bold outline-none text-slate-700"
                      />
                    </td>
                    <td className="py-4">
                      <input 
                        type="number" 
                        value={(target as any)[item.key]} 
                        onChange={(e) => setTarget({...target, [item.key]: Number(e.target.value)})}
                        className="w-24 bg-slate-50 dark:bg-slate-800 rounded-lg px-2 py-1 font-bold outline-none text-slate-950 dark:text-slate-50"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Unit Economics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-black dark:border-slate-800 aksana-glass shadow-sm">
              <span className="text-[10px] uppercase tracking-widest text-slate-700">Biaya Pemasaran</span>
              <input 
                type="number" value={current.marketingCost} 
                onChange={(e) => setCurrent({...current, marketingCost: Number(e.target.value)})}
                className="block w-full mt-1 bg-transparent border-none font-bold text-lg outline-none"
              />
              <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 shadow-sm">
                <span className="text-xs text-slate-700">CAC: </span>
                <span className="text-sm font-bold">{formatCurrency(cac)}</span>
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-black dark:border-slate-800 aksana-glass shadow-sm">
              <span className="text-[10px] uppercase tracking-widest text-slate-700">Biaya Tetap</span>
              <input 
                type="number" value={current.fixedCosts} 
                onChange={(e) => setCurrent({...current, fixedCosts: Number(e.target.value)})}
                className="block w-full mt-1 bg-transparent border-none font-bold text-lg outline-none"
              />
              <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 shadow-sm">
                <span className="text-xs text-slate-700">LTV: </span>
                <span className="text-sm font-bold">{formatCurrency(ltv)}</span>
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-black dark:border-slate-800 shadow-sm">
              <span className="text-[10px] uppercase tracking-widest text-slate-700">Break Even Point</span>
              <div className="mt-1 font-bold text-lg">{formatCurrency(bep)}</div>
              <p className="text-[10px] text-slate-700 mt-4 italic">Minimal omzet untuk balik modal.</p>
            </div>
          </div>
        </div>

        {/* Results & Charts */}
        <div className="space-y-8">
          <div className="p-8 rounded-3xl bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-950 space-y-8">
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-slate-950">Proyeksi Profit Akhir</span>
              <div className="text-4xl font-bold tracking-tighter">{formatCurrency(targetRes.profit)}</div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <TrendingUp size={16} /> +{(((targetRes.profit - currRes.profit) / (currRes.profit || 1)) * 100).toFixed(1)}% Kenaikan
              </div>
            </div>

            <div className="h-48">
              <Bar 
                data={chartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { display: false }, x: { grid: { display: false }, ticks: { color: '#94a3b8' } } }
                }} 
              />
            </div>

            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-4 rounded-2xl bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-50 font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 aksana-glass"
            >
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Simpan Strategi</>}
            </button>
          </div>

          {/* Radical Humanism Message */}
          {(!current.leads || !current.conversion) && (
            <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 text-amber-600 dark:text-amber-500 text-sm font-medium leading-relaxed shadow-sm">
              Masukkan angka bisnis Anda untuk menemukan potensi keuntungan yang tersembunyi.
            </div>
          )}

          {/* History */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-widest px-2">
              <HistoryIcon size={14} /> Riwayat Simulasi
            </div>
            <div className="space-y-3">
              {history.map((entry) => (
                <div key={entry.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-black dark:border-slate-800 flex justify-between items-center aksana-glass shadow-sm">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-700">{new Date(entry.created_at).toLocaleDateString('id-ID')}</p>
                    <p className="font-bold text-sm">{formatCurrency(entry.data_payload.results.targetRes.profit)}</p>
                  </div>
                  <div className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600">
                    Target
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

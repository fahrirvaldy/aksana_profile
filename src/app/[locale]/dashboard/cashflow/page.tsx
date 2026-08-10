"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { 
  Loader2, 
  Save, 
  History as HistoryIcon, 
  TrendingUp, 
  TrendingDown, 
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

interface HistoryEntry {
  id: string;
  created_at: string;
  data_payload: {
    pemasukan: number;
    pengeluaran: number;
    pajak: number;
    hasil_akhir: number;
  };
}

export default function CashflowPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Form State
  const [pemasukan, setPemasukan] = useState<number | "">("");
  const [pengeluaran, setPengeluaran] = useState<number | "">("");
  const [pajak, setPajak] = useState<number | "">(0);

  const fetchHistory = useCallback(async (profileId: string) => {
    const { data, error } = await supabase
      .from('user_tools_history')
      .select('id, created_at, saved_state')
      .eq('profile_id', profileId)
      .eq('tool_slug', 'cashflow-analysis')
      .order('created_at', { ascending: false })
      .limit(3);

    if (!error && data) {
      setHistory(data.map((h: { id: string; created_at: string; saved_state: Record<string, unknown>; }) => ({ ...h, data_payload: h.saved_state as { pemasukan: number; pengeluaran: number; pajak: number; hasil_akhir: number; } })));
    }
  }, []);

  useEffect(() => {
    const initPage = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      setProfileId(session.user.id);
      await fetchHistory(session.user.id);
      setIsLoading(false);
    };

    initPage();
  }, [router, fetchHistory]);

  // Calculations
  const rawPemasukan = Number(pemasukan) || 0;
  const rawPengeluaran = Number(pengeluaran) || 0;
  const rawPajak = Number(pajak) || 0;
  
  const totalPajakVal = (rawPemasukan * rawPajak) / 100;
  const arusKasBersih = rawPemasukan - rawPengeluaran - totalPajakVal;

  const handleSave = async () => {
    if (!profileId || rawPemasukan === 0) return;
    
    setIsSaving(true);
    const { error } = await supabase
      .from('user_tools_history')
      .upsert([
        {
          profile_id: profileId,
          tool_slug: 'cashflow-analysis',
          saved_state: {
            pemasukan: rawPemasukan,
            pengeluaran: rawPengeluaran,
            pajak: rawPajak,
            hasil_akhir: arusKasBersih
          }
        }
      ], { onConflict: 'profile_id, tool_slug' });

    if (!error) {
      await fetchHistory(profileId);
    }
    setIsSaving(false);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="animate-spin text-slate-700" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-8 pt-4 pb-12">
      <Link href="/tools" className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-slate-50 transition-colors mb-8 group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Kembali ke Katalog
      </Link>

      <div className="mb-12 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Cashflow Analysis</h1>
        <p className="text-slate-700 dark:text-slate-400">Proyeksikan kesehatan finansial bisnis Anda dengan presisi.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Form Section */}
        <div className="space-y-8">
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-black dark:border-slate-800 shadow-sm space-y-6 aksana-glass">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">Pemasukan Bulanan</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 font-medium">Rp</span>
                <input
                  type="number"
                  value={pemasukan}
                  onChange={(e) => setPemasukan(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="0"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-black dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-slate-400 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">Pengeluaran Tetap</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 font-medium">Rp</span>
                <input
                  type="number"
                  value={pengeluaran}
                  onChange={(e) => setPengeluaran(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="0"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-black dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-slate-400 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">Pajak (%)</label>
              <input
                type="number"
                value={pajak}
                onChange={(e) => setPajak(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="0"
                className="w-full px-4 py-3 rounded-xl border border-black dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-slate-400 outline-none transition-all"
              />
            </div>

            {(!pemasukan || !pengeluaran) && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 text-amber-600 dark:text-amber-500 text-sm font-medium shadow-sm">
                Mari masukkan angka untuk melihat proyeksi arus kas Anda.
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={isSaving || !pemasukan}
              className="w-full py-4 rounded-xl bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-950 font-bold transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Simpan Analisis ini</>}
            </button>
          </div>
        </div>

        {/* Result Section */}
        <div className="space-y-8">
          <div className="p-8 rounded-3xl bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-950 space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-700 dark:text-slate-700">Arus Kas Bersih</h3>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold tracking-tighter">
                {formatCurrency(arusKasBersih)}
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                {arusKasBersih >= 0 ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <TrendingUp size={16} /> Surplus Finansial
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-1">
                    <TrendingDown size={16} /> Defisit Finansial
                  </span>
                )}
              </div>
            </div>
            
            <div className="pt-6 border-t border-slate-800 dark:border-slate-200 grid grid-cols-2 gap-4 shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-slate-950">Estimasi Pajak</span>
                <p className="font-bold">{formatCurrency(totalPajakVal)}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-slate-950">Margin Bersih</span>
                <p className="font-bold">{rawPemasukan > 0 ? ((arusKasBersih / rawPemasukan) * 100).toFixed(1) : 0}%</p>
              </div>
            </div>
          </div>

          {/* History Preview */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-widest px-2">
              <HistoryIcon size={14} /> 3 Riwayat Terakhir
            </div>
            <div className="space-y-3">
              {history.length > 0 ? (
                history.map((entry) => (
                  <div key={entry.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-black dark:border-slate-800 flex justify-between items-center group hover:border-slate-300 dark:hover:border-slate-700 transition-colors aksana-glass shadow-sm">
                    <div className="space-y-1">
                      <p className="text-xs text-slate-700">{new Date(entry.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      <p className="font-bold text-sm">{formatCurrency(entry.data_payload.hasil_akhir)}</p>
                    </div>
                    <div className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700">
                      IN: {formatCurrency(entry.data_payload.pemasukan)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-700 text-sm italic shadow-sm">
                  Belum ada riwayat tersimpan.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

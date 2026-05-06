"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { 
  Loader2, 
  LogOut, 
  LayoutDashboard, 
  BarChart3, 
  TrendingUp, 
  History,
  Building2,
  AlertCircle
} from "lucide-react";

interface UserData {
  full_name: string;
  role: string;
  companies: {
    name: string;
  } | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('full_name, role, companies(name)')
          .eq('id', session.user.id)
          .single();

        if (fetchError) {
          console.error("Fetch error:", fetchError);
          setError("Profil belum dikonfigurasi. Silakan hubungi admin.");
        } else {
          setUserData(data as any);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Terjadi kesalahan saat memuat data.");
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="animate-spin text-slate-400" size={40} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      {/* Profile Error Alert (Amber) */}
      {error && (
        <div className="mb-8 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 flex items-center gap-3 text-amber-600 dark:text-amber-500">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Selamat Datang, {userData?.full_name || "User"}
          </h1>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <Building2 size={14} className="text-slate-500" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                {userData?.companies?.name || "Personal Account"}
              </span>
            </div>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-400 capitalize">
              Role: {userData?.role || "Guest"}
            </span>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors text-sm font-medium text-slate-600 dark:text-slate-400"
        >
          <LogOut size={18} />
          Keluar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Tools */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center gap-3 mb-6">
              <LayoutDashboard size={20} className="text-slate-400" />
              <h2 className="text-xl font-bold">Tools Aktif Anda</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link 
                href="/dashboard/cashflow"
                className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:scale-[1.01] transition-all duration-500 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-slate-50 mb-6 group-hover:bg-slate-900 group-hover:text-slate-50 dark:group-hover:bg-slate-50 dark:group-hover:text-slate-900 transition-all duration-500">
                  <BarChart3 size={24} />
                </div>
                <h3 className="font-bold mb-3 text-lg text-slate-900 dark:text-slate-50 tracking-tight">Cashflow Analysis</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Analisis arus kas mendalam untuk stabilitas bisnis jangka panjang.
                </p>
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-50 transition-colors uppercase tracking-widest">
                  Buka Analisis
                </span>
              </Link>

              <Link 
                href="/dashboard/growth"
                className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:scale-[1.01] transition-all duration-500 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-slate-50 mb-6 group-hover:bg-slate-900 group-hover:text-slate-50 dark:group-hover:bg-slate-50 dark:group-hover:text-slate-900 transition-all duration-500">
                  <TrendingUp size={24} />
                </div>
                <h3 className="font-bold mb-3 text-lg text-slate-900 dark:text-slate-50 tracking-tight">Growth Simulator</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Simulasikan strategi pertumbuhan dan lihat potensi ROI Anda.
                </p>
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-50 transition-colors uppercase tracking-widest">
                  Mulai Simulasi
                </span>
              </Link>
            </div>
          </section>

          {/* History Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <History size={20} className="text-slate-400" />
              <h2 className="text-xl font-bold">Riwayat Aktivitas</h2>
            </div>
            <div className="p-12 rounded-2xl bg-slate-50/50 dark:bg-slate-950/50 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600">
                <History size={24} />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                Belum ada riwayat simulasi tersimpan.
              </p>
              <p className="text-xs text-slate-400 max-w-xs">
                Hasil analisis dari tools yang Anda gunakan akan muncul secara otomatis di sini.
              </p>
            </div>
          </section>
        </div>

        {/* Sidebar: Summary/Account Info */}
        <div className="space-y-8">
          <div className="p-8 rounded-3xl bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-900 shadow-2xl space-y-8 relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <h3 className="font-bold text-xl tracking-tight">Ringkasan Akun</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-800 dark:border-slate-200">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Status Akses</span>
                  <span className="text-sm font-bold italic">Premium</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-800 dark:border-slate-200">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Tools Digunakan</span>
                  <span className="text-sm font-bold">0 / 12</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Validitas</span>
                  <span className="text-sm font-bold">Lifetime</span>
                </div>
              </div>
              <button className="w-full py-4 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 text-xs font-bold uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-xl">
                Upgrade Fitur
              </button>
            </div>
            {/* Subtle background decoration */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 dark:bg-black/5 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

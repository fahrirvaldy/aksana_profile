"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { 
  AppWindow, 
  Calculator, 
  ClipboardList, 
  Database, 
  FileText, 
  LineChart, 
  Mail, 
  Settings, 
  Users,
  Loader2,
  Clock,
  ArrowRight,
  Lock
} from "lucide-react";
import Link from "next/link";

const tools = [
  { name: "Project Tracker", description: "Kelola proyek dengan efisiensi tinggi.", icon: <ClipboardList size={24} /> },
  { name: "CRM Lite", description: "Manajemen hubungan pelanggan yang sederhana.", icon: <Users size={24} /> },
  { name: "Budget Calc", description: "Kalkulator anggaran bisnis presisi.", icon: <Calculator size={24} /> },
  { name: "Data Vault", description: "Penyimpanan data aman dan terenkripsi.", icon: <Database size={24} /> },
  { name: "Doc Generator", description: "Buat dokumen profesional secara otomatis.", icon: <FileText size={24} /> },
  { name: "Email Automator", description: "Otomatisasi kampanye email bisnis.", icon: <Mail size={24} /> },
  { name: "SEO Analyzer", description: "Analisis performa web dalam sekejap.", icon: <LineChart size={24} /> },
  { name: "Admin Dashboard", description: "Panel kendali pusat untuk operasional.", icon: <AppWindow size={24} /> },
  { name: "Config Engine", description: "Pengaturan sistem yang fleksibel.", icon: <Settings size={24} /> },
];

export default function ToolsPage() {
  const [hasAccess, setHasAccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 menit
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    businessChallenge: ""
  });

  // Timer Logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (hasAccess && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && hasAccess) {
      setHasAccess(false);
      setIsTimeUp(true);
    }
    return () => clearInterval(timer);
  }, [hasAccess, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .insert([
          { 
            full_name: formData.fullName, 
            phone_number: formData.phone,
            business_challenge: formData.businessChallenge,
            role: 'guest'
          }
        ]);

      if (error) throw error;
      setHasAccess(true);
    } catch (error: any) {
      setFormError(error.message || "Gagal membuka akses. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-20 min-h-screen">
      <div className="mb-16 space-y-4 relative">
        <h1 className="text-4xl font-bold tracking-tight text-center">Tools Katalog</h1>
        <p className="text-slate-500 dark:text-slate-400 text-center max-w-2xl mx-auto">
          Koleksi instrumen digital kami yang dirancang untuk mempercepat pertumbuhan bisnis Anda.
        </p>
        
        {hasAccess && (
          <div className="flex justify-center pt-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50 font-mono text-sm font-bold border border-slate-200 dark:border-slate-700">
              <Clock size={16} className="text-slate-400" />
              Sisa Waktu Akses: {formatTime(timeLeft)}
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        {/* TIME'S UP UI */}
        {isTimeUp && (
          <div className="max-w-2xl mx-auto text-center p-12 rounded-3xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 space-y-6">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-500">
              <Clock size={32} />
            </div>
            <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-500">Sesi Selesai</h2>
            <p className="text-amber-700 dark:text-amber-500/80 leading-relaxed">
              Sesi uji coba Anda telah selesai. Mari tingkatkan akses Anda untuk menyimpan hasil analisis ini secara permanen.
            </p>
            <Link 
              href="/kontak" 
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-amber-600 text-white font-bold transition-all hover:bg-amber-700 active:scale-95"
            >
              Hubungi Tim Aksana <ArrowRight size={18} />
            </Link>
          </div>
        )}

        {/* GATE UI (Lead Gen Form) */}
        {!hasAccess && !isTimeUp && (
          <div className="max-w-xl mx-auto mb-20 p-8 md:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl relative z-10">
            <div className="text-center mb-8 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-900 dark:text-slate-50">
                <Lock size={20} />
              </div>
              <h2 className="text-2xl font-bold">Buka Akses Tools</h2>
              <p className="text-sm text-slate-500">Isi data singkat untuk mendapatkan akses uji coba 5 menit.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wider text-slate-400">Nama Lengkap / Usaha</label>
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Contoh: Aksana Lab"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-slate-400 outline-none transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-slate-400">Nomor WhatsApp</label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="0812..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-slate-400 outline-none transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="businessChallenge" className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tantangan Bisnis Terbesar</label>
                <textarea
                  id="businessChallenge"
                  value={formData.businessChallenge}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Ceritakan kendala bisnis Anda..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-slate-400 outline-none transition-all resize-none"
                  required
                />
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 text-amber-600 dark:text-amber-500 text-xs font-medium">
                  {formError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-xl bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-900 font-bold transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Buka Tools Sekarang"}
              </button>
            </form>
          </div>
        )}

        {/* TOOLS GRID (Blurred if no access) */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-700 ${!hasAccess || isTimeUp ? 'opacity-20 blur-sm pointer-events-none scale-[0.98]' : 'opacity-100 blur-0'}`}>
          {tools.map((tool, index) => (
            <div 
              key={index} 
              className="p-8 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 transition-all hover:shadow-2xl group"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-slate-50 group-hover:bg-slate-900 group-hover:text-slate-50 dark:group-hover:bg-slate-50 dark:group-hover:text-slate-900 transition-all duration-500">
                  {tool.icon}
                </div>
                <h3 className="font-bold text-lg">{tool.name}</h3>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                {tool.description}
              </p>
              <button className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white dark:hover:bg-slate-50 dark:hover:text-slate-900 transition-all">
                Gunakan Tool
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

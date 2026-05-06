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
import { motion } from "framer-motion";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nama: "",
    namaBisnis: "",
    sektor: "",
    whatsapp: "",
    tantangan: ""
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
    setIsSubmitting(true);
    setFormError(null);

    try {
      const { error } = await supabase
        .from('tool_data_history')
        .insert([
          { 
            nama: formData.nama, 
            whatsapp: formData.whatsapp,
            nama_bisnis: formData.namaBisnis,
            bidang_bisnis: formData.sektor,
            tantangan_utama: formData.tantangan
          }
        ]);

      if (error) throw error;
      
      // Transisi Halaman: Berhasil insert, buka akses tools
      setHasAccess(true);
    } catch (error) {
      console.error('Supabase Error:', error);
      const errorMessage = error instanceof Error ? error.message : "Gagal memproses data. Silakan coba lagi.";
      setFormError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-20 min-h-screen font-[family-name:var(--font-inter)]">
      <div className="mb-16 space-y-4 relative">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-center font-[family-name:var(--font-plus-jakarta)]">Tools Katalog</h1>
        <p className="text-slate-500 dark:text-slate-400 text-center max-w-2xl mx-auto text-lg">
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
          <div className="max-w-2xl mx-auto text-center p-12 rounded-[2.5rem] bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 space-y-6">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-500">
              <Clock size={32} />
            </div>
            <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-500 font-[family-name:var(--font-plus-jakarta)]">Sesi Selesai</h2>
            <p className="text-amber-700 dark:text-amber-500/80 leading-relaxed font-medium">
              Sesi uji coba Anda telah selesai. Mari tingkatkan akses Anda untuk menyimpan hasil analisis ini secara permanen.
            </p>
            <Link 
              href="/kontak" 
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 font-bold transition-all hover:opacity-90 active:scale-95"
            >
              Hubungi Tim Aksana <ArrowRight size={18} />
            </Link>
          </div>
        )}

        {/* GATE UI (Lead Gen Form) */}
        {!hasAccess && !isTimeUp && (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-xl mx-auto mb-20 p-10 md:p-14 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl relative z-10"
          >
            <motion.div variants={itemVariants} className="text-center mb-12 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-900 dark:text-slate-50">
                <Lock size={24} />
              </div>
              <h2 className="text-3xl font-bold font-[family-name:var(--font-plus-jakarta)]">Buka Akses Tools</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Isi data singkat untuk mendapatkan akses uji coba eksklusif.</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <motion.div variants={itemVariants} className="space-y-2">
                <label htmlFor="nama" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Nama Lengkap</label>
                <input
                  id="nama"
                  type="text"
                  value={formData.nama}
                  onChange={handleInputChange}
                  placeholder="Bagaimana kami harus menyapa Anda?"
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-slate-400 dark:focus:border-slate-500 outline-none transition-all font-medium"
                  required
                />
              </motion.div>
              
              <motion.div variants={itemVariants} className="space-y-2">
                <label htmlFor="namaBisnis" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Nama Bisnis</label>
                <input
                  id="namaBisnis"
                  type="text"
                  value={formData.namaBisnis}
                  onChange={handleInputChange}
                  placeholder="Nama perusahaan atau brand Anda"
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-slate-400 dark:focus:border-slate-500 outline-none transition-all font-medium"
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <label htmlFor="sektor" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Sektor Bisnis</label>
                <input
                  id="sektor"
                  type="text"
                  value={formData.sektor}
                  onChange={handleInputChange}
                  placeholder="Misal: Manufaktur, F&B, Jasa, dll"
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-slate-400 dark:focus:border-slate-500 outline-none transition-all font-medium"
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <label htmlFor="whatsapp" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Nomor WhatsApp</label>
                <input
                  id="whatsapp"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  placeholder="628xxxxxxxxxx"
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-slate-400 dark:focus:border-slate-500 outline-none transition-all font-medium"
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <label htmlFor="tantangan" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Tantangan Terbesar</label>
                <textarea
                  id="tantangan"
                  value={formData.tantangan}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Ceritakan sedikit kendala bisnis yang ingin Anda tuntaskan..."
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-slate-400 dark:focus:border-slate-500 outline-none transition-all resize-none font-medium"
                  required
                />
              </motion.div>

              {formError && (
                <motion.div variants={itemVariants} className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 text-amber-600 dark:text-amber-500 text-sm font-medium">
                  {formError}
                </motion.div>
              )}

              <motion.div variants={itemVariants} className="space-y-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 rounded-2xl bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-900 font-bold transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={24} />
                      Memproses...
                    </>
                  ) : (
                    <>Mulai Analisa Bisnis <ArrowRight size={20} /></>
                  )}
                </button>
                <p className="text-[11px] text-slate-400 text-center font-medium leading-relaxed px-4">
                  Dengan menekan tombol, Anda akan mendapatkan akses ke simulasi eksklusif Aksana.
                </p>
              </motion.div>
            </form>
          </motion.div>
        )}

        {/* TOOLS GRID (Blurred if no access) */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-1000 ${!hasAccess || isTimeUp ? 'opacity-20 blur-xl pointer-events-none scale-[0.98]' : 'opacity-100 blur-0'}`}>
          {tools.map((tool, index) => (
            <div 
              key={index} 
              className="p-10 rounded-[2rem] bg-white dark:bg-slate-900/40 aksana-glass border border-slate-100 dark:border-slate-800 transition-all hover:shadow-2xl group"
            >
              <div className="flex items-center gap-5 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-slate-50 group-hover:bg-slate-900 group-hover:text-slate-50 dark:group-hover:bg-slate-50 dark:group-hover:text-slate-900 transition-all duration-500">
                  {tool.icon}
                </div>
                <h3 className="font-bold text-xl font-[family-name:var(--font-plus-jakarta)]">{tool.name}</h3>
              </div>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-8 font-medium">
                {tool.description}
              </p>
              <button className="w-full py-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white dark:hover:bg-slate-50 dark:hover:text-slate-900 transition-all">
                Gunakan Tool
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

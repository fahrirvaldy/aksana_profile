"use client";

import React, { useState } from "react";
import { 
  FileSignature, 
  Wand2, 
  AlertTriangle, 
  Download, 
  ChevronLeft,
  Building2,
  Users2,
  BadgeDollarSign,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SOPData {
  division: string;
  formData: Record<string, string>;
  status: 'draft' | 'reviewed' | 'final';
  createdAt: string;
}

interface SOPGeneratorProps {
  user?: { id: string; [key: string]: unknown };
  onSave?: (data: SOPData) => void;
  isSyncing?: boolean;
  initialData?: SOPData;
}

const DIVISIONS = [
  { id: 'ops', name: 'Operasional', icon: <Truck size={24} />, description: 'Produksi, Logistik, & Layanan' },
  { id: 'fin', name: 'Keuangan', icon: <BadgeDollarSign size={24} />, description: 'Payroll, Arus Kas, & Pajak' },
  { id: 'mkt', name: 'Pemasaran', icon: <Users2 size={24} />, description: 'Sales, Branding, & Sosmed' },
  { id: 'hrd', name: 'SDM / HRD', icon: <Building2 size={24} />, description: 'Rekrutmen & Kedisiplinan' },
];

const FORM_SCHEMAS: Record<string, { label: string; placeholder: string; type: 'text' | 'textarea' }[]> = {
  ops: [
    { label: 'Nama Proses / Alur Kerja', placeholder: 'Misal: Prosedur Pengiriman Barang', type: 'text' },
    { label: 'Penanggung Jawab Utama', placeholder: 'Misal: Manager Gudang', type: 'text' },
    { label: 'Alat & Bahan yang Dibutuhkan', placeholder: 'Sebutkan tools atau software...', type: 'textarea' },
    { label: 'Langkah-langkah Kerja (Urutan)', placeholder: '1. Terima order...\n2. Packing...\n3. Kirim...', type: 'textarea' },
  ],
  fin: [
    { label: 'Nama Prosedur Keuangan', placeholder: 'Misal: Pengajuan Reimbursement', type: 'text' },
    { label: 'Otorisator (Pemberi Izin)', placeholder: 'Misal: CFO atau Finance Lead', type: 'text' },
    { label: 'Batas Waktu Proses (SLA)', placeholder: 'Misal: Maksimal 2x24 Jam', type: 'text' },
    { label: 'Dokumen Pendukung Wajib', placeholder: 'Kwitansi asli, Invoice, dll...', type: 'textarea' },
  ],
  mkt: [
    { label: 'Nama Campaign / Aktivitas', placeholder: 'Misal: Posting Konten Instagram', type: 'text' },
    { label: 'Target Audiens', placeholder: 'Siapa yang dituju?', type: 'text' },
    { label: 'Langkah Kreatif & Eksekusi', placeholder: 'Brainstorming -> Desain -> Approval...', type: 'textarea' },
    { label: 'Metrik Keberhasilan', placeholder: 'Jumlah leads, engagement rate, dll...', type: 'textarea' },
  ],
  hrd: [
    { label: 'Nama Kebijakan / SOP', placeholder: 'Misal: Onboarding Karyawan Baru', type: 'text' },
    { label: 'Departemen Terkait', placeholder: 'Seluruh divisi atau spesifik...', type: 'text' },
    { label: 'Tahapan Proses', placeholder: 'Siapkan laptop -> TTD Kontrak -> Training...', type: 'textarea' },
    { label: 'Sanksi Jika Melanggar (Opsional)', placeholder: 'Peringatan tertulis, dll...', type: 'textarea' },
  ],
};

export default function SOPGenerator({ onSave, isSyncing, initialData }: SOPGeneratorProps) {
  const [step, setStep] = useState(1);
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Render-phase sync
  const [prevInitialData, setPrevInitialData] = useState<SOPData | undefined>(initialData);
  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData);
    if (initialData) {
      const divId = DIVISIONS.find(d => d.name === initialData.division)?.id || null;
      setSelectedDivision(divId);
      setFormData(initialData.formData);
      setStep(4); // Langsung ke preview jika sudah ada data
    }
  }

  const handleSave = (status: SOPData['status']) => {
    if (onSave && selectedDivision) {
      const divName = DIVISIONS.find(d => d.id === selectedDivision)?.name || "";
      onSave({
        division: divName,
        formData,
        status,
        createdAt: new Date().toISOString()
      });
    }
  };

  const handleAiReview = () => {
    setIsAiLoading(true);
    setTimeout(() => {
      setIsAiLoading(false);
      setStep(3);
    }, 2000);
  };

  const exportToWord = () => {
    const divName = DIVISIONS.find(d => d.id === selectedDivision)?.name || "SOP";
    const title = formData[FORM_SCHEMAS[selectedDivision!][0].label] || "Dokumen_SOP";
    
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${title}</title></head>
      <body>
        <h1 style='text-align:center;'>STANDARD OPERATING PROCEDURE</h1>
        <h2 style='text-align:center;'>Divisi: ${divName}</h2>
        <hr>
        <table border='1' style='width:100%; border-collapse:collapse;'>
          ${Object.entries(formData).map(([key, value]) => `
            <tr>
              <td style='padding:10px; background-color:#f3f4f6; font-weight:bold; width:30%;'>${key}</td>
              <td style='padding:10px;'>${value.replace(/\n/g, '<br>')}</td>
            </tr>
          `).join('')}
        </table>
        <br>
        <h3>Analisis Risiko AI (Risk Analysis)</h3>
        <p>Berdasarkan draf, AI merekomendasikan pengecekan ganda pada langkah kritis untuk menghindari human error.</p>
        <h3>Key Performance Indicators (KPI)</h3>
        <ul>
          <li>Akurasi Proses: 98%</li>
          <li>SLA Pemenuhan: < 24 Jam</li>
        </ul>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '_')}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Progress Header */}
      <div className="flex justify-between items-center px-4">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
              step >= s ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-400"
            }`}>
              {step > s ? <CheckCircle2 size={16} /> : s}
            </div>
            {s < 4 && <div className={`w-12 md:w-20 h-0.5 ${step > s ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="min-h-[500px]"
        >
          {/* STEP 1: PILIH DIVISI */}
          {step === 1 && (
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black tracking-tight dark:text-white">Pilih Divisi SOP</h2>
                <p className="text-slate-500 font-medium">AI akan menyesuaikan format input berdasarkan struktur divisi Anda.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DIVISIONS.map((div) => (
                  <button
                    key={div.id}
                    onClick={() => { setSelectedDivision(div.id); setStep(2); }}
                    className="p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-emerald-500 transition-all text-left flex items-start gap-6 group shadow-xl hover:shadow-emerald-500/5"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:bg-emerald-500/10 transition-all">
                      {div.icon}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">{div.name}</h3>
                      <p className="text-sm text-slate-500 font-medium">{div.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: INPUT FORM */}
          {step === 2 && selectedDivision && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <button onClick={() => setStep(1)} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800">
                  <ChevronLeft size={18} /> Kembali
                </button>
                <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase">
                  {DIVISIONS.find(d => d.id === selectedDivision)?.name} Division
                </div>
              </div>

              <div className="p-8 md:p-12 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl space-y-8">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black dark:text-white">Draft Rincian SOP</h3>
                  <p className="text-sm text-slate-500">Lengkapi data di bawah. AI akan membantu merapikan bahasanya nanti.</p>
                </div>

                <div className="space-y-6">
                  {FORM_SCHEMAS[selectedDivision].map((field) => (
                    <div key={field.label} className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{field.label}</label>
                      {field.type === 'text' ? (
                        <input
                          type="text"
                          value={formData[field.label] || ""}
                          onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })}
                          placeholder={field.placeholder}
                          className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 outline-none transition-all font-medium"
                        />
                      ) : (
                        <textarea
                          rows={4}
                          value={formData[field.label] || ""}
                          onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })}
                          placeholder={field.placeholder}
                          className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 outline-none transition-all font-medium resize-none"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleAiReview}
                  disabled={isAiLoading || !Object.values(formData).some(v => v.length > 0)}
                  className="w-full py-5 rounded-[1.5rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-xl disabled:opacity-50"
                >
                  {isAiLoading ? <Loader2 className="animate-spin" size={20} /> : <><Wand2 size={20} /> Generate with Aksana AI</>}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: AI REVIEW */}
          {step === 3 && (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                  <Wand2 className="text-emerald-500" size={32} />
                </div>
                <h2 className="text-3xl font-black dark:text-white">AI Analysis Completed</h2>
                <p className="text-slate-500 font-medium">Aksana AI telah menganalisis risiko dan metrik untuk SOP Anda.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center gap-3 text-amber-500">
                    <AlertTriangle size={24} />
                    <h4 className="font-black uppercase tracking-widest text-xs">Risk Analysis</h4>
                  </div>
                  <ul className="space-y-3">
                    <li className="text-sm text-slate-600 dark:text-slate-400 flex gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      Potensi keterlambatan koordinasi pada langkah ke-2 karena kurangnya checklist fisik.
                    </li>
                    <li className="text-sm text-slate-600 dark:text-slate-400 flex gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      Risiko human error tinggi pada input data manual. Rekomendasi: Gunakan validasi software.
                    </li>
                  </ul>
                </div>
                <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center gap-3 text-emerald-500">
                    <ShieldCheck size={24} />
                    <h4 className="font-black uppercase tracking-widest text-xs">Recommended KPIs</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Accuracy Rate</span>
                      <span className="text-sm font-black text-emerald-500">99.5%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">SLA Completion</span>
                      <span className="text-sm font-black text-emerald-500">&lt; 4 Hours</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className="flex-1 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 font-black text-slate-500 transition-all hover:bg-slate-50 dark:hover:bg-slate-800">
                  Edit Draft
                </button>
                <button onClick={() => setStep(4)} className="flex-[2] py-4 rounded-2xl bg-emerald-500 text-white font-black shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]">
                  Setujui & Rapikan Dokumen
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: FINAL DOCUMENT */}
          {step === 4 && selectedDivision && (
            <div className="space-y-8">
              <div className="p-8 md:p-16 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl space-y-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-1">
                    <h1 className="text-3xl font-black dark:text-white uppercase">SOP DOCUMENT</h1>
                    <p className="text-slate-500 font-black tracking-widest text-[10px]">STANDARD OPERATING PROCEDURE • AKSANA BUSINESS LAB</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <FileSignature className="text-slate-400" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-px bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                  {Object.entries(formData).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-1 md:grid-cols-3 bg-white dark:bg-slate-900">
                      <div className="p-6 bg-slate-50 dark:bg-slate-800/50 font-black text-[10px] uppercase tracking-widest text-slate-500 border-r border-slate-100 dark:border-slate-800">
                        {key}
                      </div>
                      <div className="p-6 md:col-span-2 text-sm text-slate-700 dark:text-slate-300 font-medium whitespace-pre-wrap">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-8 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Penyusun</h4>
                    <p className="text-sm font-black text-slate-800 dark:text-white">Aksana AI Business Intelligence</p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tanggal Terbit</h4>
                    <p className="text-sm font-black text-slate-800 dark:text-white">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <button 
                  onClick={() => { setStep(1); setFormData({}); setSelectedDivision(null); }} 
                  className="flex-1 py-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 font-black text-slate-400 hover:text-slate-800 transition-all"
                >
                  Buat SOP Baru
                </button>
                <button 
                  onClick={exportToWord}
                  className="flex-1 py-5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black flex items-center justify-center gap-3 transition-all hover:scale-[1.02] shadow-xl"
                >
                  <Download size={20} /> Export ke Word (.doc)
                </button>
                <button 
                  onClick={() => handleSave('final')}
                  disabled={isSyncing}
                  className="flex-1 py-5 rounded-2xl bg-emerald-500 text-white font-black flex items-center justify-center gap-3 transition-all hover:scale-[1.02] shadow-lg shadow-emerald-500/20"
                >
                  {isSyncing ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle2 size={20} /> Simpan ke Cloud</>}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

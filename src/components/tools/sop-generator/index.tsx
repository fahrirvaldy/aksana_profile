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
import { useTranslations } from "next-intl";

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

export default function SOPGenerator({ onSave, isSyncing, initialData }: SOPGeneratorProps) {
  const t = useTranslations("Tools.Sop");
  const [step, setStep] = useState(1);
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isAiLoading, setIsAiLoading] = useState(false);

  const DIVISIONS = [
    { id: 'ops', name: t('divisions.ops.name'), icon: <Truck size={24} />, description: t('divisions.ops.description') },
    { id: 'fin', name: t('divisions.fin.name'), icon: <BadgeDollarSign size={24} />, description: t('divisions.fin.description') },
    { id: 'mkt', name: t('divisions.mkt.name'), icon: <Users2 size={24} />, description: t('divisions.mkt.description') },
    { id: 'hrd', name: t('divisions.hrd.name'), icon: <Building2 size={24} />, description: t('divisions.hrd.description') },
  ];

  const rawSchemas = t.raw('schemas');
  const FORM_SCHEMAS: Record<string, { label: string; placeholder: string; type: 'text' | 'textarea' }[]> = {
    ops: (rawSchemas.ops as any[]).map((f, i) => ({ ...f, type: i >= 2 ? 'textarea' : 'text' })),
    fin: (rawSchemas.fin as any[]).map((f, i) => ({ ...f, type: i === 3 ? 'textarea' : 'text' })),
    mkt: (rawSchemas.mkt as any[]).map((f, i) => ({ ...f, type: i >= 2 ? 'textarea' : 'text' })),
    hrd: (rawSchemas.hrd as any[]).map((f, i) => ({ ...f, type: i >= 2 ? 'textarea' : 'text' })),
  };

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
    const title = formData[FORM_SCHEMAS[selectedDivision!][0].label] || t('export.filename');
    
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${title}</title></head>
      <body>
        <h1 style='text-align:center;'>${t('export.docTitle')}</h1>
        <h2 style='text-align:center;'>${t('export.divisi', { name: divName })}</h2>
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
        <h3>${t('export.riskAnalysis')}</h3>
        <p>${t('export.riskRecommendation')}</p>
        <h3>${t('export.kpiTitle')}</h3>
        <ul>
          <li>${t('export.accuracy')}</li>
          <li>${t('export.sla')}</li>
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
              step >= s ? "bg-emerald-500 text-white" : "bg-neutral-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400"
            }`}>
              {step > s ? <CheckCircle2 size={16} /> : s}
            </div>
            {s < 4 && <div className={`w-12 md:w-20 h-0.5 ${step > s ? "bg-emerald-500" : "bg-neutral-200 dark:bg-slate-800"}`} />}
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
                <h2 className="text-3xl font-black tracking-tight dark:text-white">{t('step1.title')}</h2>
                <p className="text-slate-600 dark:text-slate-300 font-normal">{t('step1.subtitle')}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DIVISIONS.map((div) => (
                  <button
                    key={div.id}
                    onClick={() => { setSelectedDivision(div.id); setStep(2); }}
                    className="p-8 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl hover:border-emerald-500 transition-all text-left flex items-start gap-6 group shadow-sm hover:shadow-emerald-500/5"
                  >
                    <div className="w-14 h-14 rounded-xl bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:bg-emerald-500/10 transition-all">
                      {div.icon}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-black text-black dark:text-slate-100 uppercase tracking-wide">{div.name}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 font-normal">{div.description}</p>
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
                <button onClick={() => setStep(1)} className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-slate-200">
                  <ChevronLeft size={18} /> {t('step2.back')}
                </button>
                <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase shadow-sm">
                  {t('step2.division', { name: DIVISIONS.find(d => d.id === selectedDivision)?.name || "" })}
                </div>
              </div>

              <div className="p-8 md:p-12 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl space-y-8 aksana-glass shadow-sm">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black dark:text-white">{t('step2.title')}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 font-normal">{t('step2.subtitle')}</p>
                </div>

                <div className="space-y-6">
                  {FORM_SCHEMAS[selectedDivision].map((field) => (
                    <div key={field.label} className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 ml-1">{field.label}</label>
                      {field.type === 'text' ? (
                        <input
                          type="text"
                          value={formData[field.label] || ""}
                          onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })}
                          placeholder={field.placeholder}
                          className="w-full px-6 py-4 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:border-emerald-500 outline-none transition-all font-semibold placeholder-slate-400 dark:placeholder-slate-500"
                        />
                      ) : (
                        <textarea
                          rows={4}
                          value={formData[field.label] || ""}
                          onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })}
                          placeholder={field.placeholder}
                          className="w-full px-6 py-4 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:border-emerald-500 outline-none transition-all font-semibold resize-none placeholder-slate-400 dark:placeholder-slate-500"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleAiReview}
                  disabled={isAiLoading || !Object.values(formData).some(v => v.length > 0)}
                  className="w-full py-5 rounded-xl bg-black dark:bg-white text-white dark:text-slate-950 font-black flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-xl disabled:opacity-50"
                >
                  {isAiLoading ? <Loader2 className="animate-spin" size={20} /> : <><Wand2 size={20} /> {t('step2.generate')}</>}
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
                <h2 className="text-3xl font-black dark:text-white">{t('step3.title')}</h2>
                <p className="text-slate-600 dark:text-slate-300 font-normal">{t('step3.subtitle')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 aksana-glass shadow-sm">
                  <div className="flex items-center gap-3 text-amber-500">
                    <AlertTriangle size={24} />
                    <h4 className="font-black uppercase tracking-widest text-xs">{t('step3.riskTitle')}</h4>
                  </div>
                  <ul className="space-y-3">
                    {(t.raw('step3.risks') as string[]).map((risk, i) => (
                      <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-8 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 aksana-glass shadow-sm">
                  <div className="flex items-center gap-3 text-emerald-500">
                    <ShieldCheck size={24} />
                    <h4 className="font-black uppercase tracking-widest text-xs">{t('step3.kpiTitle')}</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{t('step3.kpis.accuracy')}</span>
                      <span className="text-sm font-black text-emerald-500">99.5%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{t('step3.kpis.sla')}</span>
                      <span className="text-sm font-black text-emerald-500">&lt; 4 Hours</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className="flex-1 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 font-black text-slate-600 dark:text-slate-300 transition-all hover:bg-neutral-50 dark:hover:bg-slate-800">
                  {t('step3.edit')}
                </button>
                <button onClick={() => setStep(4)} className="flex-[2] py-4 rounded-xl bg-emerald-500 text-white font-black shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]">
                  {t('step3.approve')}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: FINAL DOCUMENT */}
          {step === 4 && selectedDivision && (
            <div className="space-y-8">
              <div className="p-8 md:p-16 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl space-y-12 relative overflow-hidden aksana-glass shadow-sm">
                <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-1">
                    <h1 className="text-3xl font-black dark:text-white uppercase">{t('step4.title')}</h1>
                    <p className="text-slate-600 dark:text-slate-300 font-black tracking-widest text-[10px]">{t('step4.subtitle')}</p>
                  </div>
                  <div className="p-4 bg-white dark:bg-[#1E1E1E] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <FileSignature className="text-slate-400 dark:text-slate-500" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-px bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm">
                  {Object.entries(formData).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-1 md:grid-cols-3 bg-white dark:bg-[#1E1E1E] aksana-glass">
                      <div className="p-6 bg-slate-50 dark:bg-[#1E1E1E]/50 font-black text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 shadow-sm">
                        {key}
                      </div>
                      <div className="p-6 md:col-span-2 text-sm text-black dark:text-slate-300 font-semibold whitespace-pre-wrap">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-12 shadow-sm">
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">{t('step4.author')}</h4>
                    <p className="text-sm font-black text-black dark:text-white">{t('step4.authorVal')}</p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">{t('step4.date')}</h4>
                    <p className="text-sm font-black text-black dark:text-white">{new Date().toLocaleDateString(t('step4.date') === 'Tanggal Terbit' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <button 
                  onClick={() => { setStep(1); setFormData({}); setSelectedDivision(null); }} 
                  className="flex-1 py-5 rounded-xl border-2 border-slate-200 dark:border-slate-800 font-black text-slate-600 dark:text-slate-300 hover:text-black transition-all"
                >
                  {t('step4.new')}
                </button>
                <button 
                  onClick={exportToWord}
                  className="flex-1 py-5 rounded-xl bg-black dark:bg-white text-white dark:text-slate-950 font-black flex items-center justify-center gap-3 transition-all hover:scale-[1.02]"
                >
                  <Download size={20} /> {t('step4.export')}
                </button>
                <button 
                  onClick={() => handleSave('final')}
                  disabled={isSyncing}
                  className="flex-1 py-5 rounded-xl bg-emerald-500 text-white font-black flex items-center justify-center gap-3 transition-all hover:scale-[1.02] shadow-lg shadow-emerald-500/20"
                >
                  {isSyncing ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle2 size={20} /> {t('step4.save')}</>}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

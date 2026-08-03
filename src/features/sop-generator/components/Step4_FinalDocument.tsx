
"use client";

import { FileSignature, Download, CheckCircle2, Loader2 } from "lucide-react";

interface Step4Props {
  t: (key: string, params?: any) => string;
  formData: Record<string, string>;
  onNew: () => void;
  onExport: () => void;
  onSave: () => void;
  isSyncing?: boolean;
}

export const Step4_FinalDocument = ({ t, formData, onNew, onExport, onSave, isSyncing }: Step4Props) => {
  return (
    <div className="space-y-8">
      <div className="p-6 md:p-8 md:p-16 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl space-y-12 relative overflow-hidden aksana-glass shadow-sm">
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
          onClick={onNew} 
          className="flex-1 py-5 rounded-xl border-2 border-slate-200 dark:border-slate-800 font-black text-slate-600 dark:text-slate-300 hover:text-black transition-all"
        >
          {t('step4.new')}
        </button>
        <button 
          onClick={onExport}
          className="flex-1 py-5 rounded-xl bg-black dark:bg-white text-white dark:text-slate-950 font-black flex items-center justify-center gap-3 transition-all hover:scale-[1.02]"
        >
          <Download size={20} /> {t('step4.export')}
        </button>
        <button 
          onClick={onSave}
          disabled={isSyncing}
          className="flex-1 py-5 rounded-xl bg-emerald-500 text-white font-black flex items-center justify-center gap-3 transition-all hover:scale-[1.02] shadow-lg shadow-emerald-500/20"
        >
          {isSyncing ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle2 size={20} /> {t('step4.save')}</>}
        </button>
      </div>
    </div>
  );
};

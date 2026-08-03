
"use client";

import { Wand2, AlertTriangle, ShieldCheck } from "lucide-react";

interface Step3Props {
  t: {
    (key: string): string;
    raw(key: string): string[];
  };
  onEdit: () => void;
  onApprove: () => void;
}

export const Step3_AiReview = ({ t, onEdit, onApprove }: Step3Props) => {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
          <Wand2 className="text-emerald-500" size={32} />
        </div>
        <h2 className="text-3xl font-black dark:text-white">{t('step3.title')}</h2>
        <p className="text-slate-600 dark:text-slate-300 font-normal">{t('step3.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 md:p-8 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 aksana-glass shadow-sm">
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
        <div className="p-6 md:p-8 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 aksana-glass shadow-sm">
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
        <button onClick={onEdit} className="flex-1 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 font-black text-slate-600 dark:text-slate-300 transition-all hover:bg-neutral-50 dark:hover:bg-slate-800">
          {t('step3.edit')}
        </button>
        <button onClick={onApprove} className="flex-[2] py-4 rounded-xl bg-emerald-500 text-white font-black shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]">
          {t('step3.approve')}
        </button>
      </div>
    </div>
  );
};


"use client";

import { ChevronLeft, Wand2, Loader2 } from "lucide-react";

interface FormField {
  label: string;
  placeholder: string;
  type: 'text' | 'textarea';
}

interface Step2Props {
  t: (key: string, params?: Record<string, any>) => string;
  onBack: () => void;
  divisionName: string;
  schema: FormField[];
  formData: Record<string, string>;
  setFormData: (data: Record<string, string>) => void;
  onAiReview: () => void;
  isAiLoading: boolean;
}

export const Step2_FormInput = (
  { t, onBack, divisionName, schema, formData, setFormData, onAiReview, isAiLoading }: Step2Props
) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-slate-200">
          <ChevronLeft size={18} /> {t('step2.back')}
        </button>
        <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase shadow-sm">
          {t('step2.division', { name: divisionName })}
        </div>
      </div>

      <div className="p-6 md:p-8 md:p-12 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl space-y-8 aksana-glass shadow-sm">
        <div className="space-y-2">
          <h3 className="text-2xl font-black dark:text-white">{t('step2.title')}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 font-normal">{t('step2.subtitle')}</p>
        </div>

        <div className="space-y-6">
          {schema.map((field) => (
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
          onClick={onAiReview}
          disabled={isAiLoading || !Object.values(formData).some(v => v.length > 0)}
          className="w-full py-5 rounded-xl bg-black dark:bg-white text-white dark:text-slate-950 font-black flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-xl disabled:opacity-50"
        >
          {isAiLoading ? <Loader2 className="animate-spin" size={20} /> : <><Wand2 size={20} /> {t('step2.generate')}</>}
        </button>
      </div>
    </div>
  );
};


"use client";

import { Zap, RefreshCcw } from "lucide-react";

interface GlobalControlsProps {
  t: (key: string, params?: any) => string;
  currency: 'IDR' | 'USD';
  setCurrency: (c: 'IDR' | 'USD') => void;
  period: 'Bulan' | 'Tahun';
  setPeriod: (p: 'Bulan' | 'Tahun') => void;
  globalGrowth: number;
  applyGlobalGrowth: (val: number) => void;
  handleSave: (data: any) => void;
}

export const GlobalControls = (
  { t, currency, setCurrency, period, setPeriod, globalGrowth, applyGlobalGrowth, handleSave }: GlobalControlsProps
) => {
  return (
    <div className="p-8 rounded-xl bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 space-y-6 aksana-glass shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 flex items-center gap-2">
            <Zap size={16} className="text-amber-500" /> {t("global.title")}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-normal">{t("global.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2 bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 p-1.5 rounded-xl shadow-sm">
          {['IDR', 'USD'].map(cur => (
            <button
              key={cur}
              onClick={() => { setCurrency(cur as 'IDR' | 'USD'); handleSave({ currency: cur as 'IDR' | 'USD' }); }}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${currency === cur ? "bg-black text-white dark:bg-slate-900 shadow-sm dark:text-white" : "text-slate-600 dark:text-slate-300"}`}
            >
              {cur}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 ml-1">{t("global.growth")}</label>
          <div className="relative">
            <RefreshCcw className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300" size={18} />
            <input
              type="number"
              value={globalGrowth}
              onChange={(e) => applyGlobalGrowth(Number(e.target.value))}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:border-emerald-500 outline-none transition-all font-bold text-lg placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 ml-1">{t("global.period")}</label>
          <div className="flex gap-2">
            {(['Bulan', 'Tahun'] as const).map(p => (
              <button
                key={p}
                onClick={() => { setPeriod(p); handleSave({ period: p }); }}
                className={`flex-1 py-4 rounded-xl font-bold transition-all border ${
                  period === p ? "bg-black text-white border-transparent" : "bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700"
                }`}
              >
                {t("global.per", { period: p })}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

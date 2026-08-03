
"use client";

import { TrendingUp, RefreshCcw } from "lucide-react";

interface CostInputsProps {
  t: (key: string, params?: any) => string;
  period: 'Bulan' | 'Tahun';
  marketingCost: number;
  setMarketingCost: (cost: number) => void;
  fixedCost: number;
  setFixedCost: (cost: number) => void;
  handleSave: (data: any) => void;
}

export const CostInputs = (
  { t, period, marketingCost, setMarketingCost, fixedCost, setFixedCost, handleSave }: CostInputsProps
) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-6">
      <div className="p-8 rounded-xl bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 space-y-4 aksana-glass shadow-sm">
        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 flex items-center gap-2">
          <TrendingUp size={14} className="text-blue-500" /> {t("costs.marketing", { period })}
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300 font-bold">Rp</span>
          <input
            type="number"
            value={marketingCost}
            onChange={(e) => { setMarketingCost(Number(e.target.value)); handleSave({ marketingCost: Number(e.target.value) }); }}
            className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 outline-none font-black text-xl placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>
      </div>
      <div className="p-8 rounded-xl bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 space-y-4 aksana-glass shadow-sm">
        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 flex items-center gap-2">
          <RefreshCcw size={14} className="text-purple-500" /> {t("costs.fixed", { period })}
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300 font-bold">Rp</span>
          <input
            type="number"
            value={fixedCost}
            onChange={(e) => { setFixedCost(Number(e.target.value)); handleSave({ fixedCost: Number(e.target.value) }); }}
            className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 outline-none font-black text-xl placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>
      </div>
    </div>
  );
};

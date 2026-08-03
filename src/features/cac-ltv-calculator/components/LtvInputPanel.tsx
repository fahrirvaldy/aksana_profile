
"use client";

import { Wallet } from "lucide-react";
import { formatCurrency } from "../utils/formatters";

interface LtvInputPanelProps {
  t: (key: string, params?: any) => string;
  aov: number;
  setAov: (value: number) => void;
  frequency: number;
  setFrequency: (value: number) => void;
  lifespan: number;
  setLifespan: (value: number) => void;
  margin: number;
  setMargin: (value: number) => void;
  ltv: number;
}

export const LtvInputPanel = (
  { t, aov, setAov, frequency, setFrequency, lifespan, setLifespan, margin, setMargin, ltv }: LtvInputPanelProps
) => {
  return (
    <div className="p-8 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-6 aksana-glass">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
          <Wallet size={20} />
        </div>
        <h3 className="font-black uppercase tracking-widest text-xs text-slate-600 dark:text-slate-300">{t("ltvTitle")}</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 ml-1">{t("aov")}</label>
          <input
            type="number"
            value={aov || ""}
            onChange={(e) => setAov(Number(e.target.value))}
            placeholder={t("placeholders.aov")}
            className="w-full px-4 py-3 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:border-emerald-500 outline-none transition-all text-sm font-medium placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 ml-1">{t("frequency")}</label>
          <input
            type="number"
            value={frequency || ""}
            onChange={(e) => setFrequency(Number(e.target.value))}
            placeholder={t("placeholders.frequency")}
            className="w-full px-4 py-3 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:border-emerald-500 outline-none transition-all text-sm font-medium placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 ml-1">{t("lifespan")}</label>
          <input
            type="number"
            value={lifespan || ""}
            onChange={(e) => setLifespan(Number(e.target.value))}
            placeholder={t("placeholders.lifespan")}
            className="w-full px-4 py-3 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:border-emerald-500 outline-none transition-all text-sm font-medium placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 ml-1">{t("margin")}</label>
          <input
            type="number"
            value={margin || ""}
            onChange={(e) => setMargin(Number(e.target.value))}
            placeholder="0%"
            className="w-full px-4 py-3 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:border-emerald-500 outline-none transition-all text-sm font-medium placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center shadow-sm">
        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">{t("ltvResult")}</span>
        <span className="text-lg font-black text-emerald-500">{formatCurrency(ltv)}</span>
      </div>
    </div>
  );
}


"use client";

import { Megaphone } from "lucide-react";
import { formatCurrency } from "../utils/formatters";

interface CacInputPanelProps {
  t: (key: string) => string;
  adSpend: number;
  setAdSpend: (value: number) => void;
  opsCost: number;
  setOpsCost: (value: number) => void;
  newCustomers: number;
  setNewCustomers: (value: number) => void;
  cac: number;
}

export const CacInputPanel = (
  { t, adSpend, setAdSpend, opsCost, setOpsCost, newCustomers, setNewCustomers, cac }: CacInputPanelProps
) => {
  return (
    <div className="p-8 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-6 aksana-glass">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
          <Megaphone size={20} />
        </div>
        <h3 className="font-black uppercase tracking-widest text-xs text-slate-600 dark:text-slate-300">{t("title")}</h3>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 ml-1">{t("adSpend")}</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300 text-xs font-bold">Rp</span>
            <input
              type="number"
              value={adSpend || ""}
              onChange={(e) => setAdSpend(Number(e.target.value))}
              placeholder="0"
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:border-blue-500 outline-none transition-all font-medium text-sm placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 ml-1">{t("opsCost")}</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300 text-xs font-bold">Rp</span>
            <input
              type="number"
              value={opsCost || ""}
              onChange={(e) => setOpsCost(Number(e.target.value))}
              placeholder="0"
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:border-blue-500 outline-none transition-all font-medium text-sm placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 ml-1">{t("newCustomers")}</label>
          <input
            type="number"
            value={newCustomers || ""}
            onChange={(e) => setNewCustomers(Number(e.target.value))}
            placeholder="0"
            className="w-full px-6 py-4 rounded-2xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:border-blue-500 outline-none transition-all font-medium text-sm placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center shadow-sm">
        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">{t("cacResult")}</span>
        <span className="text-lg font-black text-blue-500">{formatCurrency(cac)}</span>
      </div>
    </div>
  );
}


"use client";

import React from 'react';
import { Users, Percent, RefreshCcw, DollarSign, BarChart3, ArrowRight } from "lucide-react";
import { Metrics } from "../types";
import { formatValue } from '../utils/formatters';

interface SimulatorTableProps {
    t: (key: string, params?: Record<string, any>) => string;
  currency: 'IDR' | 'USD';
  current: Metrics;
  setCurrent: (m: Metrics) => void;
  target: Metrics;
  setTarget: (m: Metrics) => void;
  handleSave: (data: { current?: Metrics; target?: Metrics }) => void;
  currentDerived: { customers: number };
  targetDerived: { customers: number };
}

const metricItems = [
  { id: 'leads', label: "fiveWays.leads", icon: <Users size={18} />, key: 'leads' as keyof Metrics },
  { id: 'conv', label: "fiveWays.conv", icon: <Percent size={18} />, key: 'conv' as keyof Metrics, isPercent: true },
  { id: 'trans', label: "fiveWays.trans", icon: <RefreshCcw size={18} />, key: 'trans' as keyof Metrics },
  { id: 'sale', label: "fiveWays.sale", icon: <DollarSign size={18} />, key: 'sale' as keyof Metrics, isCurrency: true },
  { id: 'margin', label: "fiveWays.margin", icon: <BarChart3 size={18} />, key: 'margin' as keyof Metrics, isPercent: true },
];

export const SimulatorTable = (
  { t, currency, current, setCurrent, target, setTarget, handleSave, currentDerived, targetDerived }: SimulatorTableProps
) => {
  return (
    <div className="p-8 rounded-xl bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 space-y-6 aksana-glass shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 flex items-center gap-2">
          <Users size={18} /> {t("fiveWays.title")}
        </h3>
        <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 px-4">
          <span>{t("fiveWays.current")}</span>
          <span className="text-emerald-500">{t("fiveWays.target")}</span>
        </div>
      </div>

      <div className="space-y-4">
        {metricItems.map((item, idx) => (
          <div key={item.id} className="relative">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 hover:border-slate-300 transition-all shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm aksana-glass">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{t(item.label)}</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={current[item.key]}
                  onChange={(e) => {
                    const next = { ...current, [item.key]: Number(e.target.value) };
                    setCurrent(next);
                    handleSave({ current: next });
                  }}
                  className="w-20 md:w-28 px-3 py-2 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 text-right font-medium outline-none"
                />
                <ArrowRight size={14} className="text-slate-600 dark:text-slate-300" />
                <input
                  type="number"
                  value={target[item.key]}
                  onChange={(e) => {
                    const next = { ...target, [item.key]: Number(e.target.value) };
                    setTarget(next);
                    handleSave({ target: next });
                  }}
                  className="w-20 md:w-28 px-3 py-2 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 text-right font-black outline-none"
                />
              </div>
            </div>
            {idx < 4 && (
              <div className="absolute -bottom-3 left-8 z-10 text-black dark:text-slate-950 bg-white dark:bg-slate-900 px-1 font-black text-[10px] aksana-glass">
                {idx === 0 ? "×" : idx === 1 ? "=" : idx === 2 ? "×" : "×"}
              </div>
            )}
            {idx === 1 && (
              <div className="py-2 px-12 flex items-center gap-2 text-[10px] font-bold text-black dark:text-slate-400 uppercase italic">
                <Users size={12} /> {formatValue(currentDerived.customers, currency)} {t("fiveWays.customers")} → <span className="text-emerald-600 dark:text-emerald-400">{formatValue(targetDerived.customers, currency)} {t("fiveWays.customers")}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

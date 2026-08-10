
"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Info, AlertTriangle } from "lucide-react";
import { formatValue } from "../utils/formatters";

interface HealthPanelProps {
    t: (key: string, params?: Record<string, any>) => string;
  currency: 'IDR' | 'USD';
  healthMetrics: {
    cac: number;
    ltv: number;
    bepRevenue: number;
    ltvCacRatio: number;
  };
  currentRevenue: number;
}

export const HealthPanel = ({ t, currency, healthMetrics, currentRevenue }: HealthPanelProps) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-black dark:border-slate-800 space-y-6 aksana-glass shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-slate-400">{t("health.efficiency")}</h3>
          {healthMetrics.ltvCacRatio > 3 ? (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full text-[10px] font-black">
              <ShieldCheck size={12} /> {t("health.status.healthy")}
            </div>
          ) : healthMetrics.ltvCacRatio > 1.5 ? (
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full text-[10px] font-black">
              <Info size={12} /> {t("health.status.fair")}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full text-[10px] font-black">
              <AlertTriangle size={12} /> {t("health.status.loss")}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="space-y-1">
            <p className="text-[9px] font-bold uppercase text-black dark:text-slate-400 tracking-tighter">{t("health.cac")}</p>
            <p className="text-lg font-black text-black dark:text-white">{formatValue(healthMetrics.cac, currency, true)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-bold uppercase text-black dark:text-slate-400 tracking-tighter">{t("health.ltv")}</p>
            <p className="text-lg font-black text-black dark:text-white">{formatValue(healthMetrics.ltv, currency, true)}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-black uppercase">
            <span className="text-black dark:text-slate-400">{t("health.ratio")}</span>
            <span className={healthMetrics.ltvCacRatio > 3 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>{healthMetrics.ltvCacRatio.toFixed(1)}x</span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (healthMetrics.ltvCacRatio / 5) * 100)}%` }}
              className={`h-full ${healthMetrics.ltvCacRatio > 3 ? "bg-emerald-500" : healthMetrics.ltvCacRatio > 1.5 ? "bg-amber-500" : "bg-rose-500"}`}
            />
          </div>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-black dark:border-slate-800 space-y-6 aksana-glass shadow-sm">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-slate-400">{t("bep.title")}</h3>
        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <p className="text-[9px] font-bold uppercase text-black dark:text-slate-400">{t("bep.revenue")}</p>
              <p className="text-2xl font-black text-black dark:text-white">{formatValue(healthMetrics.bepRevenue, currency, true)}</p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-[9px] font-bold uppercase text-black dark:text-slate-400">{t("bep.statusLabel")}</p>
              <p className={`text-sm font-black ${currentRevenue >= healthMetrics.bepRevenue ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                {currentRevenue >= healthMetrics.bepRevenue ? t("bep.status.above") : t("bep.status.below")}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (currentRevenue / healthMetrics.bepRevenue) * 100)}%` }}
                className="h-full bg-black dark:bg-white"
              />
              {currentRevenue < healthMetrics.bepRevenue && (
                <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black uppercase text-black mix-blend-difference">
                  {t("bep.progress")}
                </div>
              )}
            </div>
            <p className="text-[10px] text-black dark:text-slate-400 italic font-normal">
              {currentRevenue >= healthMetrics.bepRevenue
                ? t("bep.success")
                : t("bep.needed", { val: formatValue(healthMetrics.bepRevenue - currentRevenue, currency, true) })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

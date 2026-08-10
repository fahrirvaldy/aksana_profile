
"use client";

import { Zap, AlertCircle, CheckCircle2, BarChart3 } from "lucide-react";
import { Profiling } from "../types";

interface DiagnosticReportProps {
    t: (key: string, params?: Record<string, any>) => string;
  profiling: Profiling;
  diagnostic: {
    biggestLeak: { label: string; diff: number } | undefined;
    recommendation: string;
  };
}

export const DiagnosticReport = ({ t, profiling, diagnostic }: DiagnosticReportProps) => {
  return (
    <div className="p-8 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl aksana-glass relative overflow-hidden group shadow-sm">
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
        <BarChart3 size={120} />
      </div>
      
      <div className="relative space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center animate-pulse">
            <Zap size={20} />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-none text-black dark:text-white">{t("diagnostic.title")}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-normal">{t("diagnostic.basedOn", { industry: profiling.industry })}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">{t("diagnostic.leakTitle")}</p>
            {diagnostic.biggestLeak ? (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50/50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-900/20 shadow-sm">
                <AlertCircle className="text-rose-600 mt-0.5" size={18} />
                <div>
                  <p className="font-bold text-sm text-rose-800 dark:text-rose-400">{diagnostic.biggestLeak.label}</p>
                  <p className="text-xs text-rose-700/80 dark:text-rose-400/60 font-medium">-{t("diagnostic.leakBelow", { diff: diagnostic.biggestLeak.diff.toFixed(1) })}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/20 shadow-sm">
                <CheckCircle2 className="text-emerald-600 mt-0.5" size={18} />
                <div>
                  <p className="font-bold text-sm text-emerald-800 dark:text-emerald-400">{t("diagnostic.healthy")}</p>
                  <p className="text-xs text-emerald-700/80 dark:text-emerald-400/60 font-medium">{t("diagnostic.healthyDesc")}</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">{t("diagnostic.recommendationTitle")}</p>
            <p className="text-sm font-bold leading-relaxed text-black dark:text-slate-300 italic">
              &quot;{diagnostic.recommendation}&quot;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

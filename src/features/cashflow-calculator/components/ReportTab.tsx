
"use client";

import { BrainCircuit, AlertCircle, CheckCircle2 } from "lucide-react";
import { PeriodType } from "../types";

interface ReportTabProps {
  t: (key: string, params?: any) => string;
  metrics: {
    avgNetFlow: number;
    opsRatio: number;
    runway: number;
    score: number;
    finalBalance: number;
  };
  periodType: PeriodType;
}

export const ReportTab = ({ t, metrics, periodType }: ReportTabProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="p-10 rounded-[2.5rem] bg-black text-white space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <BrainCircuit size={150} />
        </div>
        <div className="relative space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white/50">{t("report.diagnosis")}</h3>

          <div className="space-y-4">
            <p className="text-2xl font-bold leading-tight">
              {metrics.score > 70
                ? t("report.status.solid")
                : metrics.score > 40
                ? t("report.status.risk")
                : t("report.status.critical")}
            </p>

            <div className="space-y-2 text-white/70 text-sm leading-relaxed">
              {metrics.opsRatio < 1 && (
                <div className="flex gap-2 items-start text-rose-300 bg-rose-400/10 p-3 rounded-xl border border-rose-400/20 shadow-sm">
                  <AlertCircle size={18} className="shrink-0" />
                  <p><strong>{t("report.alerts.bleedingTitle")}</strong> {t("report.alerts.bleedingDesc")}</p>
                </div>
              )}
              {metrics.runway < 3 && metrics.runway !== Infinity && (
                <div className="flex gap-2 items-start text-amber-300 bg-amber-400/10 p-3 rounded-xl border border-amber-400/20 shadow-sm">
                  <AlertCircle size={18} className="shrink-0" />
                  <p><strong>{t("report.alerts.shortRunwayTitle")}</strong> {t("report.alerts.shortRunwayDesc")}</p>
                </div>
              )}
              {metrics.opsRatio >= 1.2 && (
                <div className="flex gap-2 items-start text-emerald-300 bg-emerald-400/10 p-3 rounded-xl border border-emerald-400/20 shadow-sm">
                  <CheckCircle2 size={18} className="shrink-0" />
                  <p><strong>{t("report.alerts.highEfficiencyTitle")}</strong> {t("report.alerts.highEfficiencyDesc")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-10 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl space-y-6 aksana-glass shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-slate-600 dark:text-slate-300">{t("report.actionPlan")}</h3>

        <div className="space-y-4">
          {[
            { condition: metrics.opsRatio < 1, task: t("report.tasks.audit") },
            { condition: metrics.opsRatio < 1.2, task: t("report.tasks.pricing") },
            { condition: metrics.runway < 3 && metrics.runway !== Infinity, task: t("report.tasks.safetyNet") },
            { condition: metrics.runway < 6, task: t("report.tasks.arPolicy") },
            { condition: metrics.score > 70, task: t("report.tasks.surplus") },
            { condition: true, task: t("report.tasks.update", { period: t(`dashboard.runwayUnit.${periodType}`).toLowerCase() }) }
          ].filter(item => item.condition).map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-700 group transition-all hover:border-black shadow-sm">
              <div className="w-6 h-6 rounded-full border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-black dark:bg-white scale-0 group-hover:scale-100 transition-transform"></div>
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{item.task}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

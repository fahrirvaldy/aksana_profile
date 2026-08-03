
"use client";

import { Target, Activity } from "lucide-react";
import { Profiling } from "../types";

interface ProfilingPanelProps {
  t: (key: string) => string;
  profiling: Profiling;
  setProfiling: React.Dispatch<React.SetStateAction<Profiling>>;
  onApplyStandard: () => void;
}

export const ProfilingPanel = ({ t, profiling, setProfiling, onApplyStandard }: ProfilingPanelProps) => {
  return (
    <div className="p-8 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl space-y-8 aksana-glass shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-950 flex items-center justify-center">
          <Target size={20} />
        </div>
        <h3 className="font-bold text-lg text-black dark:text-white">{t("profiling.title")}</h3>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">{t("profiling.industry")}</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {['fashion', 'beauty', 'gadget', 'fnb'].map((ind) => (
              <button
                key={ind}
                onClick={() => setProfiling(p => ({ ...p, industry: ind }))}
                className={`px-4 py-3 rounded-xl border text-sm font-bold capitalize transition-all ${
                  profiling.industry === ind 
                  ? 'bg-slate-900 border-slate-900 text-white dark:bg-slate-50 dark:text-slate-950' 
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {ind === 'fnb' ? 'F&B' : ind}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">{t("profiling.channel")}</label>
          <div className="grid grid-cols-3 gap-3">
            {['marketplace', 'website', 'whatsapp'].map((chan) => (
              <button
                key={chan}
                onClick={() => setProfiling(p => ({ ...p, channel: chan }))}
                className={`px-3 py-3 rounded-xl border text-[11px] font-black uppercase tracking-tighter transition-all ${
                  profiling.channel === chan 
                  ? 'bg-slate-900 border-slate-900 text-white dark:bg-slate-50 dark:text-slate-950' 
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {chan}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onApplyStandard}
          className="w-full py-4 rounded-xl bg-white dark:bg-[#1E1E1E] text-black dark:text-slate-50 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700"
        >
          <Activity size={16} /> {t("profiling.applyStandard")}
        </button>
      </div>
    </div>
  );
}

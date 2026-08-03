
"use client";

import { CheckCircle2 } from "lucide-react";

interface StepIndicatorProps {
  step: number;
}

export const StepIndicator = ({ step }: StepIndicatorProps) => {
  return (
    <div className="flex justify-between items-center px-4">
      {[1, 2, 3, 4].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
            step >= s ? "bg-emerald-500 text-white" : "bg-neutral-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400"
          }`}>
            {step > s ? <CheckCircle2 size={16} /> : s}
          </div>
          {s < 4 && <div className={`w-12 md:w-20 h-0.5 ${step > s ? "bg-emerald-500" : "bg-neutral-200 dark:bg-slate-800"}`} />}
        </div>
      ))}
    </div>
  );
};

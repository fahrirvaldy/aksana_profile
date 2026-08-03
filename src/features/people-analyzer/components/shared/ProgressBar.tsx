
"use client";

import { motion } from "framer-motion";

export const ProgressBar = ({ label, actual, required, colorClass = "bg-blue-500" }: { label: string, actual: number, required: number, colorClass?: string }) => {
  const isWarning = actual < required - 15;
  const barColor = isWarning ? "bg-amber-500" : colorClass;
  
  return (
    <div className="mb-6">
      <div className="flex justify-between text-xs mb-2">
        <span className="font-semibold text-slate-600 dark:text-slate-300">{label}</span>
        <span className="text-slate-600 dark:text-slate-200 font-mono">Aktual: {actual} / Standar: {required}</span>
      </div>
      <div className="relative h-3 bg-slate-100 dark:bg-[#121212] rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
        <div 
          className="absolute top-0 bottom-0 border-r-2 border-dashed border-slate-300 dark:border-slate-500 z-10 transition-all duration-500 shadow-sm" 
          style={{ left: `${required}%` }}
        />
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${actual}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`absolute top-0 left-0 bottom-0 ${barColor} rounded-full`}
        />
      </div>
    </div>
  );
};

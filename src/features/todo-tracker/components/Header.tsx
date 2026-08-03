
"use client";

import { useState } from 'react';
import { Layout, Download } from 'lucide-react';

interface HeaderProps {
  t: (key: string) => string;
  stats: { percentage: number };
  onDownload: () => void;
}

export const Header = ({ t, stats, onDownload }: HeaderProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = async () => {
    setIsExporting(true);
    await onDownload();
    setIsExporting(false);
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:p-8 mb-12">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3 font-[family-name:var(--font-plus-jakarta)]">
          <div className="p-3 bg-black dark:bg-slate-50 text-white dark:text-black rounded-2xl">
            <Layout size={28} />
          </div>
          {t('title')}
        </h1>
        <p className="text-slate-600 dark:text-slate-300 font-normal">{t('subtitle')}</p>
      </div>

      <div className="flex items-center gap-6">
        <button 
          data-export-ignore="true"
          onClick={handleDownload}
          disabled={isExporting}
          className="p-4 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all text-slate-600 dark:text-slate-300 aksana-glass"
          title={t('export')}
        >
          <Download size={20} />
        </button>

        <div className="p-6 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-6 shadow-sm aksana-glass">
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-1">{t('progress')}</p>
            <p className={`text-2xl font-black ${stats.percentage >= 90 ? 'text-emerald-500' : 'text-blue-500'}`}>
              {stats.percentage}%
            </p>
          </div>
          <div className="relative w-14 h-14">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle 
                cx="50" cy="50" r="40" 
                stroke="currentColor" strokeWidth="8" fill="transparent" 
                className="text-black/5 dark:text-slate-950" 
              />
              <circle 
                cx="50" cy="50" r="40" 
                stroke="currentColor" strokeWidth="8" fill="transparent" 
                strokeDasharray={251.2} 
                strokeDashoffset={251.2 - (251.2 * stats.percentage) / 100} 
                className={`${stats.percentage >= 90 ? 'text-emerald-500' : 'text-blue-500'} transition-all duration-1000`} 
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

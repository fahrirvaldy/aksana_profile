
"use client";

import { Download, RefreshCcw } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  t: (key: string) => string;
  isSyncing?: boolean;
  onExport: () => void;
}

export const Header = ({ t, isSyncing, onExport }: HeaderProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    onExport();
    setTimeout(() => setIsExporting(false), 1000);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h2 className="text-3xl font-bold font-[family-name:var(--font-plus-jakarta)] text-black dark:text-white">{t("title")}</h2>
        <p className="text-black dark:text-slate-400 font-normal">{t("subtitle")}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          data-export-ignore="true"
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-950 text-xs font-bold hover:opacity-90 transition-all disabled:opacity-50"
        >
          {isExporting ? (
            <RefreshCcw size={14} className="animate-spin" />
          ) : (
            <Download size={14} />
          )}
          {isExporting ? 'Exporting...' : t("export")}
        </button>

        {isSyncing && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-black dark:text-slate-400 text-xs font-bold">
            <RefreshCcw size={14} className="animate-spin" />
            {t("syncing")}
          </div>
        )}
      </div>
    </div>
  );
};

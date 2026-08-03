
"use client";

import { Loader2, Cloud, Save } from "lucide-react";
import { ToDoTrackerInitialData } from "../types";

interface SyncStatusProps {
  t: (key: string) => string;
  isSyncing?: boolean;
  onSave?: (data: ToDoTrackerInitialData) => void;
  getTodos: () => ToDoTrackerInitialData;
}

export const SyncStatus = ({ t, isSyncing, onSave, getTodos }: SyncStatusProps) => {
  return (
    <div className="fixed bottom-8 right-8 z-50">
      <div className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-full px-6 py-4 flex items-center gap-3 shadow-sm aksana-glass">
        {isSyncing ? (
          <Loader2 className="animate-spin text-blue-500" size={20} />
        ) : (
          <Cloud className="text-emerald-500" size={20} />
        )}
        <span className="text-sm font-bold text-slate-600 dark:text-[#EEEEEE]">
          {isSyncing ? t('sync.syncing') : t('sync.connected')}
        </span>
        {onSave && !isSyncing && (
           <button 
            onClick={() => onSave(getTodos())}
            className="ml-2 p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all text-black dark:text-slate-400 border border-slate-200 dark:border-slate-800"
            title={t('sync.save')}
          >
            <Save size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

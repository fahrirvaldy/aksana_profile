
"use client";

import { Save, Loader2 } from "lucide-react";

interface SaveButtonProps {
  t: (key: string) => string;
  isSyncing?: boolean;
  handleSave: () => void;
}

export const SaveButton = ({ t, isSyncing, handleSave }: SaveButtonProps) => {
  return (
    <div className="fixed bottom-8 right-8 z-50">
      <button
        onClick={handleSave}
        disabled={isSyncing}
        className="px-6 py-3 rounded-full bg-black dark:bg-slate-50 text-white dark:text-black font-bold shadow-2xl hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50 border border-white/20"
      >
        {isSyncing ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> {t("cloud.save")}</>}
      </button>
    </div>
  );
};


"use client";

import { History, LayoutDashboard, BrainCircuit } from "lucide-react";
import { TabType } from "../types";

interface CashflowTabsProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
    t: any;
}

export const CashflowTabs = ({ activeTab, setActiveTab, t }: CashflowTabsProps) => {
  return (
    <div className="flex justify-center p-1 bg-white dark:bg-[#1E1E1E] rounded-2xl w-fit mx-auto shadow-inner border border-slate-200 dark:border-slate-800">
      {(['input', 'dashboard', 'report'] as TabType[]).map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === tab
              ? "bg-black text-white dark:bg-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 hover:text-black dark:text-slate-400 dark:hover:text-slate-300"
          }`}
        >
          {tab === 'input' && <><History size={16} /> {t("tabs.input")}</>}
          {tab === 'dashboard' && <><LayoutDashboard size={16} /> {t("tabs.dashboard")}</>}
          {tab === 'report' && <><BrainCircuit size={16} /> {t("tabs.report")}</>}
        </button>
      ))}
    </div>
  );
};

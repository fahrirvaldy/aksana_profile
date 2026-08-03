
"use client";

import { User } from "@supabase/supabase-js";
import { useTranslations } from 'next-intl';
import { CacLtvData } from "./types";
import { useCacLtvCalculator } from "./hooks/useCacLtvCalculator";
import { CacInputPanel } from "./components/CacInputPanel";
import { LtvInputPanel } from "./components/LtvInputPanel";
import { ResultsPanel } from "./components/ResultsPanel";
import { Info } from 'lucide-react';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CacLtvCalculatorContainerProps {
  user?: User;
  onSave?: (data: CacLtvData) => void;
  isSyncing?: boolean;
  initialData?: CacLtvData;
}

export default function CacLtvCalculatorContainer({ onSave, isSyncing, initialData }: CacLtvCalculatorContainerProps) {
  const t = useTranslations("Tools.CacLtv");

  const {
    adSpend, setAdSpend,
    opsCost, setOpsCost,
    newCustomers, setNewCustomers,
    aov, setAov,
    frequency, setFrequency,
    lifespan, setLifespan,
    margin, setMargin,
    cac,
    ltv,
    ratio,
  } = useCacLtvCalculator({ initialData, onSave });

  return (
    <div className="w-full p-4 lg:p-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Kolom Kiri: Input */}
        <div className="lg:col-span-5 space-y-8">
          <CacInputPanel 
            t={t}
            adSpend={adSpend}
            setAdSpend={setAdSpend}
            opsCost={opsCost}
            setOpsCost={setOpsCost}
            newCustomers={newCustomers}
            setNewCustomers={setNewCustomers}
            cac={cac}
          />
          <LtvInputPanel 
            t={t}
            aov={aov}
            setAov={setAov}
            frequency={frequency}
            setFrequency={setFrequency}
            lifespan={lifespan}
            setLifespan={setLifespan}
            margin={margin}
            setMargin={setMargin}
            ltv={ltv}
          />
        </div>

        {/* Kolom Kanan: Hasil & Analisis */}
        <div className="lg:col-span-7 space-y-8">
          <ResultsPanel 
            t={t}
            ratio={ratio}
            cac={cac}
            ltv={ltv}
            isSyncing={isSyncing}
          />
        </div>

      </div>
      
      {/* Help Section */}
      <div className="mt-12 p-8 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 text-xs leading-relaxed flex gap-6 items-start">
        <div className="p-3 bg-slate-900 dark:bg-white/5 rounded-2xl shrink-0">
          <Info size={24} className="text-white dark:text-slate-950" />
        </div>
        <div className="space-y-4">
          <p><strong className="text-black dark:text-slate-100">{t("whatIsLtvCac")}</strong> {t("ltvCacDescription")}</p>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <li><span className="text-rose-500 font-bold">&lt; 1:1</span> {t("loss")}</li>
            <li><span className="text-amber-500 font-bold">1:1 - 3:1</span> {t("stable")}</li>
            <li><span className="text-emerald-500 font-bold">&gt; 3:1</span> {t("veryHealthy")}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

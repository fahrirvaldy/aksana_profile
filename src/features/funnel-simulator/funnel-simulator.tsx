
"use client";

import { User } from "@supabase/supabase-js";
import { useTranslations } from 'next-intl';
import { FunnelSimulatorInitialData } from "./types";
import { useFunnelSimulator } from "./hooks/useFunnelSimulator";
import { exportToImage } from "./utils/export";

import { Header } from "./components/Header";
import { ProfilingPanel } from "./components/ProfilingPanel";
import { InputsPanel } from "./components/InputsPanel";
import { ResultsGrid } from "./components/ResultsGrid";
import { DiagnosticReport } from "./components/DiagnosticReport";
import { FunnelChart } from "./components/FunnelChart";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface FunnelSimulatorContainerProps {
  user?: User;
  onSave?: (data: FunnelSimulatorInitialData) => void;
  isSyncing?: boolean;
  initialData?: FunnelSimulatorInitialData;
}

export default function FunnelSimulatorContainer({ onSave, isSyncing, initialData }: FunnelSimulatorContainerProps) {
  const t = useTranslations("Tools.Funnel");
  
  const {
    inputs, setInputs,
    profiling, setProfiling,
    results,
    diagnostic,
    applyIndustryStandard
  } = useFunnelSimulator({ initialData, onSave, t });

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700 bg-[var(--background)]">
      <Header t={t} isSyncing={isSyncing} onExport={exportToImage} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-8">
          <ProfilingPanel 
            t={t}
            profiling={profiling}
            setProfiling={setProfiling}
            onApplyStandard={applyIndustryStandard}
          />
          <InputsPanel 
            t={t}
            inputs={inputs}
            setInputs={setInputs}
          />
        </div>

        <div className="lg:col-span-7 space-y-8">
          <ResultsGrid t={t} results={results} />
          <DiagnosticReport t={t} profiling={profiling} diagnostic={diagnostic} />
          <FunnelChart t={t} results={results} />
        </div>
      </div>
    </div>
  );
}

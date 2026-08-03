
"use client";

import { User } from "@supabase/supabase-js";
import { useTranslations } from 'next-intl';
import { GrowthSimulatorInitialData } from "./types";
import { useGrowthSimulator } from "./hooks/useGrowthSimulator";
import { GlobalControls } from "./components/GlobalControls";
import { SimulatorTable } from "./components/SimulatorTable";
import { CostInputs } from "./components/CostInputs";
import { ResultsPanel } from "./components/ResultsPanel";
import { HealthPanel } from "./components/HealthPanel";

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

interface GrowthSimulatorContainerProps {
  user?: User;
  onSave?: (data: GrowthSimulatorInitialData) => void;
  isSyncing?: boolean;
  initialData?: GrowthSimulatorInitialData;
}

export default function GrowthSimulatorContainer({ user, onSave, isSyncing, initialData }: GrowthSimulatorContainerProps) {
  const t = useTranslations("Tools.Growth");

  const {
    currency, setCurrency,
    period, setPeriod,
    globalGrowth, 
    current, setCurrent,
    target, setTarget,
    marketingCost, setMarketingCost,
    fixedCost, setFixedCost,
    currentDerived,
    targetDerived,
    healthMetrics,
    handleSave,
    applyGlobalGrowth,
    calculateDerived
  } = useGrowthSimulator({ initialData, onSave });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-700">
      {/* LEFT COLUMN: INPUTS */}
      <div className="lg:col-span-7 space-y-8">
        <GlobalControls 
          t={t}
          currency={currency}
          setCurrency={setCurrency}
          period={period}
          setPeriod={setPeriod}
          globalGrowth={globalGrowth}
          applyGlobalGrowth={applyGlobalGrowth}
          handleSave={handleSave}
        />
        <SimulatorTable 
          t={t}
          currency={currency}
          current={current}
          setCurrent={setCurrent}
          target={target}
          setTarget={setTarget}
          handleSave={handleSave}
          currentDerived={currentDerived}
          targetDerived={targetDerived}
        />
        <CostInputs 
          t={t}
          period={period}
          marketingCost={marketingCost}
          setMarketingCost={setMarketingCost}
          fixedCost={fixedCost}
          setFixedCost={setFixedCost}
          handleSave={handleSave}
        />
      </div>

      {/* RIGHT COLUMN: VISUALS */}
      <div className="lg:col-span-5 space-y-8">
        <ResultsPanel 
          t={t}
          currency={currency}
          currentProfit={currentDerived.profit}
          targetProfit={targetDerived.profit}
          targetRevenue={targetDerived.revenue}
          isSyncing={isSyncing}
          user={user}
          handleSave={() => handleSave({}) }
          calculateDerived={calculateDerived}
          current={current}
          target={target}
        />
        <HealthPanel 
          t={t}
          currency={currency}
          healthMetrics={healthMetrics}
          currentRevenue={currentDerived.revenue}
        />
      </div>
    </div>
  );
}

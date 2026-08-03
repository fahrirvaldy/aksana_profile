
"use client";

import { User } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from 'next-intl';

// Local imports
import { CashflowCalculatorInitialData } from "./types";
import { useCashflowCalculator } from "./hooks/useCashflowCalculator";
import { CashflowTabs } from "./components/CashflowTabs";
import { InputTab } from "./components/InputTab";
import { DashboardTab } from "./components/DashboardTab";
import { ReportTab } from "./components/ReportTab";
import { SaveButton } from "./components/SaveButton";

// Register ChartJS components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CashflowCalculatorContainerProps {
  user?: User;
  onSave?: (data: CashflowCalculatorInitialData) => void;
  isSyncing?: boolean;
  initialData?: CashflowCalculatorInitialData;
}

export default function CashflowCalculatorContainer({ user, onSave, isSyncing, initialData }: CashflowCalculatorContainerProps) {
  const t = useTranslations("Tools.Cashflow");

  const {
    // State
    periodType,
    setPeriodType,
    initialBalance,
    setInitialBalance,
    initialBalanceSet,
    setInitialBalanceSet,
    records,
    activeTab,
    setActiveTab,
    entryName,
    setEntryName,
    inOps,
    setInOps,
    inNonOps,
    setInNonOps,
    outOps,
    setOutOps,
    outNonOps,
    setOutNonOps,
    // Logic
    handleSave,
    addRecord,
    deleteRecord,
    resetAll,
    // Metrics
    metrics
  } = useCashflowCalculator({ initialData, onSave });

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700">
      <CashflowTabs activeTab={activeTab} setActiveTab={setActiveTab} t={t} />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'input' && (
            <InputTab
              t={t}
              periodType={periodType}
              setPeriodType={setPeriodType}
              initialBalance={initialBalance}
              setInitialBalance={setInitialBalance}
              initialBalanceSet={initialBalanceSet}
              setInitialBalanceSet={setInitialBalanceSet}
              handleSave={handleSave}
              entryName={entryName}
              setEntryName={setEntryName}
              inOps={inOps}
              setInOps={setInOps}
              inNonOps={inNonOps}
              setInNonOps={setInNonOps}
              outOps={outOps}
              setOutOps={setOutOps}
              outNonOps={outNonOps}
              setOutNonOps={setOutNonOps}
              addRecord={addRecord}
              records={records}
              resetAll={() => resetAll(confirm, t("confirmReset"))}
              deleteRecord={deleteRecord}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardTab
              t={t}
              metrics={metrics}
              records={records}
              initialBalance={initialBalance}
              periodType={periodType}
            />
          )}

          {activeTab === 'report' && (
            <ReportTab
              t={t}
              metrics={metrics}
              periodType={periodType}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {user && (
        <SaveButton 
          t={t} 
          isSyncing={isSyncing} 
          handleSave={() => handleSave(records)} 
        />
      )}
    </div>
  );
}

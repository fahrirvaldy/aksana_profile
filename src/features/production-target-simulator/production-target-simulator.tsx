
"use client";

import { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ProductionData } from "./types";
import { useProductionSimulator } from "./hooks/useProductionSimulator";
import { downloadReport } from "./utils/exportReport";

import { ProductIdentityPanel } from "./components/ProductIdentityPanel";
import { FieldDataPanel } from "./components/FieldDataPanel";
import { AnalysisReport } from "./components/AnalysisReport";

import { Loader2, Download } from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface ProductionSimulatorContainerProps {
  user?: User;
  onSave?: (data: ProductionData) => void;
  isSyncing?: boolean;
  initialData?: ProductionData;
}

export default function ProductionTargetSimulatorContainer({ onSave, isSyncing, initialData }: ProductionSimulatorContainerProps) {
  const t = useTranslations("Tools.Production");

  const {
    sku, setSku,
    category, setCategory,
    salesInput, setSalesInput,
    leadTime, setLeadTime,
    stock, setStock,
    results
  } = useProductionSimulator({ initialData, onSave });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-700">
      <div className="lg:col-span-4 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <ProductIdentityPanel t={t} sku={sku} setSku={setSku} category={category} setCategory={setCategory} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <FieldDataPanel t={t} salesInput={salesInput} setSalesInput={setSalesInput} leadTime={leadTime} setLeadTime={setLeadTime} stock={stock} setStock={setStock} />
        </motion.div>
      </div>

      <div className="lg:col-span-8">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl h-full overflow-hidden flex flex-col shadow-sm">
          <div className="p-8 pb-4 border-b border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">{t('analysis.subtitle')}</p>
                <h2 className="text-3xl font-bold">{sku || t('analysis.untitled')}</h2>
              </div>
              <div className="flex items-center gap-3">
                {isSyncing && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-full text-blue-600 text-xs font-medium">
                    <Loader2 size={12} className="animate-spin" />
                    {t('analysis.sync')}
                  </div>
                )}
                <button 
                  id="btn-download"
                  onClick={() => downloadReport(sku, t)}
                  disabled={!results}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-full text-sm font-medium transition-colors shadow-sm"
                >
                  <Download size={16} />
                  <span>{t('analysis.export')}</span>
                </button>
              </div>
            </div>
          </div>
          <AnalysisReport t={t} sku={sku} isSyncing={isSyncing} onDownload={() => downloadReport(sku, t)} results={results} stock={stock} leadTime={leadTime} />
        </motion.div>
      </div>
    </div>
  );
}

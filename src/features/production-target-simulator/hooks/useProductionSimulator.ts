
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { ProductionData } from "../types";
import { calculateProductionResults } from "../domain";

interface ProductionSimulatorProps {
  initialData?: ProductionData;
  onSave?: (data: ProductionData) => void;
}

export const useProductionSimulator = ({ initialData, onSave }: ProductionSimulatorProps) => {
  const [sku, setSku] = useState<string>(initialData?.sku || "");
  const [category, setCategory] = useState<'magnet' | 'profit'>(initialData?.category || 'profit');
  const [salesInput, setSalesInput] = useState<string>(initialData?.salesInput || "");
  const [leadTime, setLeadTime] = useState<number>(initialData?.leadTime || 0);
  const [stock, setStock] = useState<number>(initialData?.stock || 0);

  const prevInitialData = useRef<ProductionData | undefined>(undefined);

  useEffect(() => {
    if (initialData && initialData !== prevInitialData.current) {
      setSku(initialData.sku || "");
      setCategory(initialData.category || 'profit');
      setSalesInput(initialData.salesInput || "");
      setLeadTime(initialData.leadTime || 0);
      setStock(initialData.stock || 0);
      prevInitialData.current = initialData;
    }
  }, [initialData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSave) {
        onSave({ sku, category, salesInput, leadTime, stock });
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [sku, category, salesInput, leadTime, stock, onSave]);

  const results = useMemo(() => calculateProductionResults(salesInput, category, leadTime, stock), [salesInput, category, leadTime, stock]);

  return {
    sku, setSku,
    category, setCategory,
    salesInput, setSalesInput,
    leadTime, setLeadTime,
    stock, setStock,
    results
  };
};

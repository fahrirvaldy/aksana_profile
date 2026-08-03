
"use client";

import { useState, useMemo } from "react";
import { calculateDerived, calculateHealthMetrics } from "../domain";
import { GrowthSimulatorInitialData, Metrics } from "../types";

interface GrowthSimulatorProps {
  initialData?: GrowthSimulatorInitialData;
  onSave?: (data: GrowthSimulatorInitialData) => void;
}

export const useGrowthSimulator = ({ initialData, onSave }: GrowthSimulatorProps) => {
  const [currency, setCurrency] = useState<'IDR' | 'USD'>('IDR');
  const [period, setPeriod] = useState<'Bulan' | 'Tahun'>('Bulan');
  const [globalGrowth, setGlobalGrowth] = useState<number>(10);
  
  const [current, setCurrent] = useState<Metrics>({
    leads: 1000,
    conv: 10,
    trans: 2,
    sale: 500000,
    margin: 25
  });

  const [target, setTarget] = useState<Metrics>({
    leads: 1100,
    conv: 11,
    trans: 2.2,
    sale: 550000,
    margin: 27.5
  });

  const [marketingCost, setMarketingCost] = useState<number>(5000000);
  const [fixedCost, setFixedCost] = useState<number>(10000000);

  const [prevInitialData, setPrevInitialData] = useState<GrowthSimulatorInitialData | undefined>(initialData);

  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData);
    if (initialData) {
      if (initialData.currency) setCurrency(initialData.currency);
      if (initialData.period) setPeriod(initialData.period);
      if (initialData.globalGrowth !== undefined) setGlobalGrowth(initialData.globalGrowth);
      if (initialData.current) setCurrent(initialData.current);
      if (initialData.target) setTarget(initialData.target);
      if (initialData.marketingCost !== undefined) setMarketingCost(initialData.marketingCost);
      if (initialData.fixedCost !== undefined) setFixedCost(initialData.fixedCost);
    }
  }

  const handleSave = (updatedData: Partial<GrowthSimulatorInitialData>) => {
    if (onSave) {
      onSave({
        currency,
        period,
        globalGrowth,
        current,
        target,
        marketingCost,
        fixedCost,
        ...updatedData
      });
    }
  };

  const currentDerived = useMemo(() => calculateDerived(current), [current]);
  const targetDerived = useMemo(() => calculateDerived(target), [target]);

  const healthMetrics = useMemo(() => calculateHealthMetrics(currentDerived, marketingCost, fixedCost, period, current.margin), [currentDerived, marketingCost, fixedCost, period, current.margin]);

  const applyGlobalGrowth = (val: number) => {
    setGlobalGrowth(val);
    const multiplier = 1 + (val / 100);
    const newTarget = {
      leads: Math.round(current.leads * multiplier),
      conv: Number((current.conv * multiplier).toFixed(2)),
      trans: Number((current.trans * multiplier).toFixed(2)),
      sale: Math.round(current.sale * multiplier),
      margin: Number((current.margin * multiplier).toFixed(2))
    };
    setTarget(newTarget);
    handleSave({ globalGrowth: val, target: newTarget });
  };

  return {
    // State
    currency, setCurrency,
    period, setPeriod,
    globalGrowth, setGlobalGrowth,
    current, setCurrent,
    target, setTarget,
    marketingCost, setMarketingCost,
    fixedCost, setFixedCost,
    // Derived State
    currentDerived,
    targetDerived,
    healthMetrics,
    // Actions
    handleSave,
    applyGlobalGrowth,
    calculateDerived
  };
}


"use client";

import { useState, useMemo, useEffect } from "react";
import { calculateCacLtv } from "../domain";
import { CacLtvData } from "../types";

interface CacLtvCalculatorProps {
  initialData?: CacLtvData;
  onSave?: (data: CacLtvData) => void;
}

export const useCacLtvCalculator = ({ initialData, onSave }: CacLtvCalculatorProps) => {
  const [adSpend, setAdSpend] = useState<number>(0);
  const [opsCost, setOpsCost] = useState<number>(0);
  const [newCustomers, setNewCustomers] = useState<number>(0);
  const [aov, setAov] = useState<number>(0);
  const [frequency, setFrequency] = useState<number>(0);
  const [lifespan, setLifespan] = useState<number>(0);
  const [margin, setMargin] = useState<number>(0);

  const [prevInitialData, setPrevInitialData] = useState<CacLtvData | undefined>(initialData);
  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData);
    if (initialData) {
      setAdSpend(initialData.adSpend || 0);
      setOpsCost(initialData.opsCost || 0);
      setNewCustomers(initialData.newCustomers || 0);
      setAov(initialData.aov || 0);
      setFrequency(initialData.frequency || 0);
      setLifespan(initialData.lifespan || 0);
      setMargin(initialData.margin || 0);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSave) {
        onSave({
          adSpend,
          opsCost,
          newCustomers,
          aov,
          frequency,
          lifespan,
          margin
        });
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [adSpend, opsCost, newCustomers, aov, frequency, lifespan, margin, onSave]);

  const { cac, ltv, ratio } = useMemo(() => calculateCacLtv(adSpend, opsCost, newCustomers, aov, frequency, lifespan, margin), [adSpend, opsCost, newCustomers, aov, frequency, lifespan, margin]);

  return {
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
  };
};

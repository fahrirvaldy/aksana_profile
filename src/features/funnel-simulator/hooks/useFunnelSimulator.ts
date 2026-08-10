
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { calculateResults, runDiagnostic } from "../domain";
import { industryBase, channelModifier } from "../constants";
import { FunnelSimulatorInitialData, FunnelInputs, Profiling } from "../types";

interface FunnelSimulatorProps {
  initialData?: FunnelSimulatorInitialData;
  onSave?: (data: FunnelSimulatorInitialData) => void;
    t: (key: string, params?: Record<string, any>) => string;
}

export const useFunnelSimulator = ({ initialData, onSave, t }: FunnelSimulatorProps) => {
  const [inputs, setInputs] = useState<FunnelInputs>(initialData?.inputs || {
    budget: 10000000,
    aov: 250000,
    cpm: 40000,
    ctr: 1.0,
    visit: 70,
    atc: 4,
    checkout: 40
  });

  const [profiling, setProfiling] = useState<Profiling>(initialData?.profiling || {
    industry: 'fashion',
    channel: 'website'
  });

  const prevInitialData = useRef<FunnelSimulatorInitialData | undefined>(undefined);

  useEffect(() => {
    if (initialData && initialData !== prevInitialData.current) {
      setTimeout(() => {
        if (initialData.inputs) setInputs(initialData.inputs);
        if (initialData.profiling) setProfiling(initialData.profiling);
      }, 0);
      prevInitialData.current = initialData;
    }
  }, [initialData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSave) {
        onSave({ inputs, profiling });
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [inputs, profiling, onSave]);

  const results = useMemo(() => calculateResults(inputs), [inputs]);

  const diagnostic = useMemo(() => {
    const { biggestLeak, recommendationKey } = runDiagnostic(inputs, profiling);
    const recommendation = t(recommendationKey);
    return { biggestLeak, recommendation };
  }, [inputs, profiling, t]);

  const applyIndustryStandard = () => {
    const base = industryBase[profiling.industry] || industryBase.fashion;
    const mod = channelModifier[profiling.channel] || channelModifier.website;
    setInputs(prev => ({
      ...prev,
      cpm: base.cpm || prev.cpm,
      ctr: base.ctr || prev.ctr,
      visit: mod.visit || prev.visit,
      atc: mod.atc || prev.atc,
      checkout: mod.checkout || prev.checkout
    }));
  };

  return {
    inputs, setInputs,
    profiling, setProfiling,
    results,
    diagnostic,
    applyIndustryStandard
  };
};

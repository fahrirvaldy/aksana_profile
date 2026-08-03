
"use client";

import { useState, useMemo } from "react";
import { User } from "@supabase/supabase-js";
import { calculateMetrics } from "../domain";
import { CashflowCalculatorInitialData, PeriodType, Record, TabType } from "../types";

interface CashflowCalculatorProps {
  user?: User;
  onSave?: (data: CashflowCalculatorInitialData) => void;
  isSyncing?: boolean;
  initialData?: CashflowCalculatorInitialData;
}

export const useCashflowCalculator = ({ initialData, onSave }: CashflowCalculatorProps) => {
  // --- State ---

  const [periodType, setPeriodType] = useState<PeriodType>('bulanan');
  const [initialBalance, setInitialBalance] = useState<number>(0);
  const [initialBalanceSet, setInitialBalanceSet] = useState<boolean>(false);
  const [records, setRecords] = useState<Record[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('input');

  // Input States
  const [entryName, setEntryName] = useState("");
  const [inOps, setInOps] = useState<number | "">("");
  const [inNonOps, setInNonOps] = useState<number | "">("");
  const [outOps, setOutOps] = useState<number | "">("");
  const [outNonOps, setOutNonOps] = useState<number | "">("");

  // --- Syncing ---

  const [prevInitialData, setPrevInitialData] = useState<CashflowCalculatorInitialData | undefined>(initialData);

  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData);
    if (initialData) {
      if (initialData.periodType) setPeriodType(initialData.periodType);
      if (initialData.initialBalance !== undefined) setInitialBalance(initialData.initialBalance);
      if (initialData.initialBalanceSet !== undefined) setInitialBalanceSet(initialData.initialBalanceSet);
      if (initialData.records) setRecords(initialData.records);
    }
  }

  const handleSave = (updatedRecords: Record[], updatedInitialBalanceSet?: boolean, updatedInitialBalance?: number) => {
    if (onSave) {
      onSave({
        periodType,
        initialBalance: updatedInitialBalance !== undefined ? updatedInitialBalance : initialBalance,
        initialBalanceSet: updatedInitialBalanceSet !== undefined ? updatedInitialBalanceSet : initialBalanceSet,
        records: updatedRecords
      });
    }
  };

  // --- Logic ---

  const addRecord = () => {
    const iOps = Number(inOps) || 0;
    const iNon = Number(inNonOps) || 0;
    const oOps = Number(outOps) || 0;
    const oNon = Number(outNonOps) || 0;

    const totalIn = iOps + iNon;
    const totalOut = oOps + oNon;
    const netFlow = totalIn - totalOut;
    
    const prevBalance = records.length > 0 ? records[records.length - 1].balance : initialBalance;
    const newBalance = prevBalance + netFlow;

    const newRecord: Record = {
      id: Date.now(),
      name: entryName || `Periode ${records.length + 1}`,
      inOps: iOps,
      inNonOps: iNon,
      outOps: oOps,
      outNonOps: oNon,
      totalIn,
      totalOut,
      netFlow,
      balance: newBalance
    };

    const newRecords = [...records, newRecord];
    setRecords(newRecords);
    handleSave(newRecords);

    // Reset fields
    setEntryName("");
    setInOps("");
    setInNonOps("");
    setOutOps("");
    setOutNonOps("");
  };

  const deleteRecord = (id: number) => {
    const filtered = records.filter(r => r.id !== id);
    // Recalculate balances
    let currentBal = initialBalance;
    const recalculated = filtered.map(r => {
      currentBal += r.netFlow;
      return { ...r, balance: currentBal };
    });
    setRecords(recalculated);
    handleSave(recalculated);
  };

  const resetAll = (confirmAction: (message: string) => boolean, confirmMessage: string) => {
    if (confirmAction(confirmMessage)) {
      setRecords([]);
      setInitialBalanceSet(false);
      setInitialBalance(0);
      handleSave([], false, 0);
    }
  };

  // --- Metrics ---

  const metrics = useMemo(() => calculateMetrics(records, initialBalance), [records, initialBalance]);

  return {
    // State
    periodType,
    setPeriodType,
    initialBalance,
    setInitialBalance,
    initialBalanceSet,
    setInitialBalanceSet,
    records,
    setRecords,
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
  };
};

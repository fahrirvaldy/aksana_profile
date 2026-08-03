
"use client";

import { useState, useEffect } from 'react';
import { User } from "@supabase/supabase-js";
import { getToolData, saveToolData } from "@/lib/supabase/tools";
import CashflowCalculatorContainer from "./cashflow-calculator";
import { CashflowCalculatorInitialData } from "./types";

interface Props {
  user?: User | null;
}

const TOOL_ID = "cashflow-calculator";

export default function CashflowDataContainer({ user }: Props) {
  const [initialData, setInitialData] = useState<CashflowCalculatorInitialData | undefined>(undefined);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setIsLoading(true);
        const data = await getToolData(user, TOOL_ID);
        setInitialData(data || {});
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleSave = async (data: CashflowCalculatorInitialData) => {
    if (user) {
      setIsSyncing(true);
      await saveToolData(user, TOOL_ID, data);
      setIsSyncing(false);
    }
  };

  if (!user) {
    // Jika tidak ada user, tampilkan versi offline tanpa data & simpan
    return <CashflowCalculatorContainer />;
  }

  if (isLoading) {
    return <div className="w-full h-96 flex items-center justify-center text-slate-400">Loading data...</div>;
  }

  return (
    <CashflowCalculatorContainer
      user={user}
      initialData={initialData}
      onSave={handleSave}
      isSyncing={isSyncing}
    />
  );
}

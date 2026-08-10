
"use client";

import { useState, useEffect } from 'react';
import { User } from "@supabase/supabase-js";
import { getToolData, saveToolData } from "@/lib/supabase/tools";
import CacLtvCalculatorContainer from "./cac-ltv-calculator";
import { CacLtvData } from "./types";

interface Props {
  user?: User | null;
}

const TOOL_ID = "cac-ltv-calculator";

export default function CacLtvDataContainer({ user }: Props) {
  const [initialData, setInitialData] = useState<CacLtvData | undefined>(undefined);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setIsLoading(true);
        const data = await getToolData(user, TOOL_ID);
        setInitialData(data as unknown as CacLtvData | undefined);
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleSave = async (data: CacLtvData) => {
    if (user) {
      setIsSyncing(true);
      await saveToolData(user, TOOL_ID, data as unknown as Record<string, unknown>);
      setIsSyncing(false);
    }
  };

  if (!user) {
    return <CacLtvCalculatorContainer />;
  }

  if (isLoading) {
    return <div className="w-full h-96 flex items-center justify-center text-slate-400">Loading data...</div>;
  }

  return (
    <CacLtvCalculatorContainer
      user={user}
      initialData={initialData}
      onSave={handleSave}
      isSyncing={isSyncing}
    />
  );
}

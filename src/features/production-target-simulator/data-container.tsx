
"use client";

import { useState, useEffect } from 'react';
import { User } from "@supabase/supabase-js";
import { getToolData, saveToolData } from "@/lib/supabase/tools";
import ProductionTargetSimulatorContainer from "./production-target-simulator";
import { ProductionData } from "./types";

interface Props {
  user?: User | null;
}

const TOOL_ID = "production-target-simulator";

export default function ProductionDataContainer({ user }: Props) {
  const [initialData, setInitialData] = useState<ProductionData | undefined>(undefined);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setIsLoading(true);
        const data = await getToolData(user, TOOL_ID);
        setInitialData(data as ProductionData || undefined);
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleSave = async (data: ProductionData) => {
    if (user) {
      setIsSyncing(true);
      await saveToolData(user, TOOL_ID, data);
      setIsSyncing(false);
    }
  };

  if (!user) {
    return <ProductionTargetSimulatorContainer />;
  }

  if (isLoading) {
    return <div className="w-full h-96 flex items-center justify-center text-slate-400">Loading data...</div>;
  }

  return (
    <ProductionTargetSimulatorContainer
      user={user}
      initialData={initialData}
      onSave={handleSave}
      isSyncing={isSyncing}
    />
  );
}

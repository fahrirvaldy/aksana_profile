
"use client";

import { useState, useEffect } from 'react';
import { User } from "@supabase/supabase-js";
import { getToolData, saveToolData } from "@/lib/supabase/tools";
import GrowthSimulatorContainer from "./growth-simulator";
import { GrowthSimulatorInitialData } from "./types";

interface Props {
  user?: User | null;
}

const TOOL_ID = "growth-simulator";

export default function GrowthDataContainer({ user }: Props) {
  const [initialData, setInitialData] = useState<GrowthSimulatorInitialData | undefined>(undefined);
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

  const handleSave = async (data: GrowthSimulatorInitialData) => {
    if (user) {
      setIsSyncing(true);
      await saveToolData(user, TOOL_ID, data);
      setIsSyncing(false);
    }
  };

  if (!user) {
    return <GrowthSimulatorContainer />;
  }

  if (isLoading) {
    return <div className="w-full h-96 flex items-center justify-center text-slate-400">Loading data...</div>;
  }

  return (
    <GrowthSimulatorContainer
      user={user}
      initialData={initialData}
      onSave={handleSave}
      isSyncing={isSyncing}
    />
  );
}

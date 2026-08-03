
"use client";

import { useState, useEffect } from 'react';
import { User } from "@supabase/supabase-js";
import { getToolData, saveToolData } from "@/lib/supabase/tools";
import SOPGeneratorContainer from "./sop-generator";
import { SOPData } from "./types";

interface Props {
  user?: User | null;
}

const TOOL_ID = "sop-generator";

export default function SOPDataContainer({ user }: Props) {
  const [initialData, setInitialData] = useState<SOPData | undefined>(undefined);
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

  const handleSave = async (data: SOPData) => {
    if (user) {
      setIsSyncing(true);
      await saveToolData(user, TOOL_ID, data);
      setIsSyncing(false);
    }
  };

  if (!user) {
    return <SOPGeneratorContainer />;
  }

  if (isLoading) {
    return <div className="w-full h-96 flex items-center justify-center text-slate-400">Loading data...</div>;
  }

  return (
    <SOPGeneratorContainer
      user={user}
      initialData={initialData}
      onSave={handleSave}
      isSyncing={isSyncing}
    />
  );
}

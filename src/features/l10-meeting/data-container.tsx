
"use client";

import { useState, useEffect, useCallback } from 'react';
import { User } from "@supabase/supabase-js";
import { getToolData, saveToolData } from "@/lib/supabase/tools";
import L10MeetingContainer from "./l10-meeting";
import { L10Data } from "./types";

import { L10MeetingSkeleton } from './components/L10MeetingSkeleton';

interface Props {
  user?: User | null;
}

const TOOL_ID = "l10-meeting";

export default function L10DataContainer({ user }: Props) {
  const [initialData, setInitialData] = useState<L10Data | undefined>(() => {
    if (typeof window !== 'undefined') {
      const cachedData = localStorage.getItem('l10-meeting-data');
      if (cachedData) {
        return JSON.parse(cachedData).data;
      }
    }
    return undefined;
  });
  const [initialSlide, setInitialSlide] = useState(() => {
    if (typeof window !== 'undefined') {
      const cachedData = localStorage.getItem('l10-meeting-data');
      if (cachedData) {
        return JSON.parse(cachedData).currentSlide;
      }
    }
    return 0;
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (user) {
      const data = await getToolData(user, TOOL_ID);
      setInitialData(data || null);
      setIsLoading(false);
    }
  }, [user]);



  useEffect(() => {
    fetchData();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'l10-meeting-data') {
        fetchData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchData]);

  const handleSave = async (data: L10Data) => {
    if (user) {
      setIsSyncing(true);
      await saveToolData(user, TOOL_ID, data);
      setIsSyncing(false);
    }
  };

  if (!user) {
    return <L10MeetingContainer />;
  }

  if (isLoading) {
    return <L10MeetingSkeleton />;
  }

  return (
    <L10MeetingContainer
      user={user}
      initialData={initialData}
      initialSlide={initialSlide}
      onSave={handleSave}
      isSyncing={isSyncing}
    />
  );
}

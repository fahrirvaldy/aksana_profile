
"use client";

import { useState } from 'react';
import { User } from "@supabase/supabase-js";
import L10MeetingContainer from "./l10-meeting";
import { L10Data } from "./types";

interface L10DataContainerProps {
  user?: User | null;
  initialData?: Record<string, unknown> | null;
  isSyncing?: boolean;
  onSave: (data: Record<string, unknown>) => void;
}

export default function L10DataContainer({ user, initialData, isSyncing, onSave }: L10DataContainerProps) {
  const [initialSlide] = useState(() => {
    if (typeof window !== 'undefined') {
      const cachedData = localStorage.getItem('l10-meeting-data');
      if (cachedData) {
        return JSON.parse(cachedData).currentSlide;
      }
    }
    return 0;
  });

  if (!user) {
    return <L10MeetingContainer />;
  }

  return (
    <L10MeetingContainer
      user={user}
      initialData={initialData as L10Data | undefined}
      initialSlide={initialSlide}
      onSave={onSave as (data: L10Data) => void}
      isSyncing={isSyncing}
    />
  );
}

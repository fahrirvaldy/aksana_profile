"use client";

import { useMemo } from 'react';
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
  // Use useMemo to read from localStorage once and prevent re-renders from causing issues.
  const memoizedCachedData = useMemo(() => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('l10-meeting-data');
      if (data) {
        try {
          return JSON.parse(data);
        } catch (e) {
          console.error("Failed to parse L10 meeting data from localStorage", e);
          return null;
        }
      }
    }
    return null;
  }, []);

  const handleSaveToLocalStorage = (dataToSave: Record<string, unknown>) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('l10-meeting-data', JSON.stringify(dataToSave));
    }
  };

  // --- Logic for non-logged-in user ---
  if (!user) {
    return (
      <L10MeetingContainer
        initialData={memoizedCachedData as L10Data | undefined}
        initialSlide={memoizedCachedData?.currentSlide ?? 0}
        onSave={handleSaveToLocalStorage as (data: L10Data) => void}
      />
    );
  }

  // --- Logic for logged-in user ---
  // Prefer slide position from DB data (initialData), fallback to localStorage, then to 0.
  const dbSlide = (initialData as (L10Data & {currentSlide?: number}))?.currentSlide;
  const localSlide = memoizedCachedData?.currentSlide;
  const startSlide = dbSlide ?? localSlide ?? 0;

  return (
    <L10MeetingContainer
      user={user}
      initialData={initialData as L10Data | undefined}
      initialSlide={startSlide}
      onSave={onSave as (data: L10Data) => void}
      isSyncing={isSyncing}
    />
  );
}

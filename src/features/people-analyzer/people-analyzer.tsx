
"use client";

import { User } from "@supabase/supabase-js";
import { PeopleAnalyzerData, Seat, ViewType } from "./types";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { CompanySetup } from "./components/CompanySetup";

interface PeopleAnalyzerContainerProps {
  user?: User;
  onSave?: (data: PeopleAnalyzerData) => void;
  isSyncing?: boolean;
  initialData?: PeopleAnalyzerData;
}

export default function PeopleAnalyzerContainer({ user, onSave, isSyncing, initialData }: PeopleAnalyzerContainerProps) {
  const t = useTranslations("Tools.PeopleAnalyzer");
  const [view, setView] = useState<ViewType>('setup');
  const [data, setData] = useState<PeopleAnalyzerData | undefined>(initialData);

  useEffect(() => {
    if (initialData && initialData.companyName) {
      setData(initialData);
      setView('dashboard');
    }
  }, [initialData]);

  const handleSetupComplete = (seats: Record<string, Seat>, name: string) => {
    const newData: PeopleAnalyzerData = {
      companyName: name,
      seats: seats,
      employees: [],
    };
    setData(newData);
    if (onSave) {
      onSave(newData);
    }
    setView('dashboard');
  };

  if (view === 'setup') {
    return <CompanySetup onComplete={handleSetupComplete} />;
  }

  return (
    <div>
      <h1>People Analyzer</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}


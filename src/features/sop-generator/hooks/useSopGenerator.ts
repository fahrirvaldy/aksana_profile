
"use client";

import { useState } from "react";
import { SOPData } from "../types";

interface SOPGeneratorProps {
  initialData?: SOPData;
  onSave?: (data: SOPData) => void;
}

export const useSopGenerator = ({ initialData, onSave }: SOPGeneratorProps) => {
  const [step, setStep] = useState(1);
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [prevInitialData, setPrevInitialData] = useState<SOPData | undefined>(initialData);
  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData);
    if (initialData) {
      setSelectedDivision(initialData.division); // Note: this might need adjustment based on how division is stored
      setFormData(initialData.formData);
      setStep(4); 
    }
  }

  const handleSave = (status: SOPData['status'], divisionName: string) => {
    if (onSave) {
      onSave({
        division: divisionName,
        formData,
        status,
        createdAt: new Date().toISOString()
      });
    }
  };

  const handleAiReview = () => {
    setIsAiLoading(true);
    setTimeout(() => {
      setIsAiLoading(false);
      setStep(3);
    }, 2000);
  };

  const reset = () => {
    setStep(1);
    setSelectedDivision(null);
    setFormData({});
  }

  return {
    step, setStep,
    selectedDivision, setSelectedDivision,
    formData, setFormData,
    isAiLoading, 
    handleSave, 
    handleAiReview,
    reset
  };
};

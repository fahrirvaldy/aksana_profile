"use client";

import { User } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { SOPData } from "./types";
import { useSopGenerator } from "./hooks/useSopGenerator";
import { getDivisions, getFormSchemas } from "./constants";
import { exportToWord } from "./utils/exportToWord";

import { StepIndicator } from "./components/StepIndicator";
import { Step1_DivisionSelection } from "./components/Step1_DivisionSelection";
import { Step2_FormInput } from "./components/Step2_FormInput";
import { Step3_AiReview } from "./components/Step3_AiReview";
import { Step4_FinalDocument } from "./components/Step4_FinalDocument";

interface SOPGeneratorContainerProps {
  user?: User;
  onSave?: (data: SOPData) => void;
  isSyncing?: boolean;
  initialData?: SOPData;
}

export default function SOPGeneratorContainer({ onSave, isSyncing, initialData }: SOPGeneratorContainerProps) {
  const t = useTranslations("Tools.Sop");
  const DIVISIONS = getDivisions(t);
  const FORM_SCHEMAS = getFormSchemas(t);

  const {
    step, setStep,
    selectedDivision, setSelectedDivision,
    formData, setFormData,
    isAiLoading,
    handleSave,
    handleAiReview,
    reset
  } = useSopGenerator({ initialData, onSave });

  const handleExport = () => {
    if (!selectedDivision) return;
    const divisionName = DIVISIONS.find(d => d.id === selectedDivision)?.name || "SOP";
    const title = formData[FORM_SCHEMAS[selectedDivision as keyof typeof FORM_SCHEMAS][0].label] || t('export.filename');
    exportToWord({ title, divisionName, formData, t });
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700">
      <StepIndicator step={step} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="min-h-[500px]"
        >
          {step === 1 && (
            <Step1_DivisionSelection 
              t={t}
              divisions={DIVISIONS}
              onSelect={(divisionId) => {
                setSelectedDivision(divisionId);
                setStep(2);
              }}
            />
          )}
          
          {step === 2 && selectedDivision && (
            <Step2_FormInput 
              t={t}
              onBack={() => setStep(1)}
              divisionName={DIVISIONS.find(d => d.id === selectedDivision)?.name || ""}
              schema={FORM_SCHEMAS[selectedDivision as keyof typeof FORM_SCHEMAS]}
              formData={formData}
              setFormData={setFormData}
              onAiReview={handleAiReview}
              isAiLoading={isAiLoading}
            />
          )}

          {step === 3 && (
            <Step3_AiReview 
              t={t} 
              onEdit={() => setStep(2)} 
              onApprove={() => setStep(4)} 
            />
          )}

          {step === 4 && selectedDivision && (
            <Step4_FinalDocument 
              t={t}
              formData={formData}
              onNew={reset}
              onExport={handleExport}
              onSave={() => handleSave('final', DIVISIONS.find(d => d.id === selectedDivision)?.name || "")}
              isSyncing={isSyncing}
            />
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}


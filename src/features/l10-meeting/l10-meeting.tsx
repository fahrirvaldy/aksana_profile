
"use client";

import { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { AnimatePresence } from "framer-motion";
import { L10Data } from "./types";
import { useL10Meeting } from "./hooks/useL10Meeting";
import { SlideRenderer } from "./components/SlideRenderer";
import { SetupModal } from "./components/SetupModal";
import { MeetingControls } from "./components/MeetingControls";

interface L10MeetingContainerProps {
  user?: User;
  onSave?: (data: L10Data) => void;
  isSyncing?: boolean;
  initialData?: L10Data;
  initialSlide?: number;
}

export default function L10MeetingContainer({ onSave, isSyncing, initialData, initialSlide }: L10MeetingContainerProps) {
  const t = useTranslations("Tools.L10");
  const {
    data, updateData,
    currentSlide, setCurrentSlide,
    showSetup, setShowSetup,
    activeThemeTab, setActiveThemeTab,
    timeLeft, setTimeLeft,
    isTimerRunning, setIsTimerRunning,
    averageRating,
    pullOffTrackData,
    handleIssueCheck,
    prioritizeAndSetThemes
  } = useL10Meeting({ initialData, onSave, initialSlide });

  const nonScorecardRoles = ['ceo', 'owner', 'integrator'];
  const scorecardDivisions = data.config.divisions.filter(
    division => !nonScorecardRoles.includes(division.toLowerCase())
  );
  const totalSlides = 10 + scorecardDivisions.length;

  return (
    <div className="relative min-h-[calc(100vh-140px)] w-full flex flex-col bg-white dark:bg-slate-950 p-1 select-none">
      <MeetingControls
        t={t}
        isSyncing={isSyncing}
        handleSave={onSave ? () => onSave(data) : undefined}
        showSetup={() => setShowSetup(true)}
        timeLeft={timeLeft}
        isTimerRunning={isTimerRunning}
        toggleTimer={() => setIsTimerRunning(!isTimerRunning)}
        resetTimer={() => { setTimeLeft(5400); setIsTimerRunning(false); }}
        prevSlide={() => setCurrentSlide(s => Math.max(s - 1, 0))}
        nextSlide={() => {
          setCurrentSlide(s => Math.min(s + 1, totalSlides - 1));
        }}
        isPrevDisabled={currentSlide === 0}
        isNextDisabled={currentSlide === totalSlides - 1}
        data={data}
        averageRating={averageRating}
        currentSlide={currentSlide}
        prioritizeAndSetThemes={prioritizeAndSetThemes}
      />

      <div className="flex-1 px-4 md:px-6 xl:px-8 pb-12 pt-4 relative overflow-visible flex flex-col">
        <div className="flex-grow flex flex-col w-full h-full bg-transparent">
          <AnimatePresence mode="wait">
            <div key={currentSlide}>
              <SlideRenderer 
                currentSlide={currentSlide}
                data={data}
                updateData={updateData}
                pullOffTrackData={pullOffTrackData}
                handleIssueCheck={handleIssueCheck}
                activeThemeTab={activeThemeTab}
                setActiveThemeTab={setActiveThemeTab}
                averageRating={averageRating}
              />
            </div>
          </AnimatePresence>
        </div>
      </div>

      <SetupModal 
        show={showSetup}
        onClose={() => setShowSetup(false)}
        data={data}
        updateData={updateData}
      />
    </div>
  );
}

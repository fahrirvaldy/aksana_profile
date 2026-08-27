'use client';

import { useEffect, useMemo, useState } from "react";
import { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { AnimatePresence } from "framer-motion";
import { History } from "lucide-react";
import domtoimage from 'dom-to-image-more';
import jsPDF from 'jspdf';
import { L10Data } from "./types";
import { useL10Meeting } from "./hooks/useL10Meeting";
import { SlideRenderer } from "./components/SlideRenderer";
import { SetupModal } from "./components/SetupModal";
import { MeetingControls } from "./components/MeetingControls";
import HistorySidebar from "./components/HistorySidebar";
import { DEFAULT_DATA } from "./constants";

interface L10MeetingContainerProps {
  user?: User | null;
  onSave?: (data: L10Data & { currentSlide?: number }) => void;
  isSyncing?: boolean;
  initialData?: L10Data;
  initialSlide?: number;
}

export default function L10MeetingContainer({ user, onSave, isSyncing, initialData, initialSlide }: L10MeetingContainerProps) {
  const t = useTranslations("Tools.L10");
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [isExportingAllSlides, setIsExportingAllSlides] = useState(false);
  const [exportProgressMessage, setExportProgressMessage] = useState('');

  const safeInitialData = useMemo(() => {
    if (!initialData) return DEFAULT_DATA;
    return {
      ...DEFAULT_DATA,
      ...initialData,
      config: { ...DEFAULT_DATA.config, ...(initialData.config || {}) },
      goodNews: { ...DEFAULT_DATA.goodNews, ...(initialData.goodNews || {}) },
      headlines: { ...DEFAULT_DATA.headlines, ...(initialData.headlines || {}) },
      idsSession: { ...DEFAULT_DATA.idsSession, ...(initialData.idsSession || {}) },
      timer: { ...DEFAULT_DATA.timer, ...(initialData.timer || {}) },
    };
  }, [initialData]);

  const {
    data, updateData,
    currentSlide, setCurrentSlide,
    showSetup, setShowSetup,
    showHistory, setShowHistory,
    handleLoadHistory,
    activeThemeTab, setActiveThemeTab,
    displayTime,
    toggleTimer,
    resetTimer,
    averageRating,
    pullOffTrackData,
    handleIssueCheck,
    prioritizeAndSetThemes
  } = useL10Meeting({ initialData: safeInitialData, initialSlide, user });

  const originalSlide = currentSlide; // Save the original slide

  useEffect(() => {
    if (onSave) {
      const timer = setTimeout(() => {
        onSave({ ...data, currentSlide });
      }, 650);

      return () => clearTimeout(timer);
    }
  }, [data, onSave, currentSlide]);

  const nonScorecardRoles = ['ceo', 'owner', 'integrator'];
  const scorecardDivisions = data.config.divisions.filter(
    division => !nonScorecardRoles.includes(division.toLowerCase())
  );
  const totalSlides = 10 + scorecardDivisions.length;

  const captureNodeAsImage = async () => {
    const node = document.getElementById('slide-to-export');
    if (!node) throw new Error('Slide node not found');

    const originalStyles: { [key: string]: string } = {};
    const elementsToModify = node.querySelectorAll('[style*="overflow"], [class*="overflow"]');
    originalStyles[node.id] = node.style.cssText;
    node.style.height = 'auto';
    node.style.maxHeight = 'none';
    node.style.overflow = 'visible';

    elementsToModify.forEach((el, index) => {
        const htmlEl = el as HTMLElement;
        const key = `el-${index}`;
        originalStyles[key] = htmlEl.style.cssText;
        htmlEl.style.height = 'auto';
        htmlEl.style.maxHeight = 'none';
        htmlEl.style.overflow = 'visible';
    });

    try {
      return await domtoimage.toPng(node, { quality: 0.95 });
    } finally {
      node.style.cssText = originalStyles[node.id];
      elementsToModify.forEach((el, index) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.cssText = originalStyles[`el-${index}`];
      });
    }
  };

  const handleExportAllSlides = async () => {
    setIsExportingAllSlides(true);
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < totalSlides; i++) {
      setExportProgressMessage(`${t("exportingSlide")} ${i + 1} / ${totalSlides}`);
      setCurrentSlide(i);
      await new Promise(resolve => setTimeout(resolve, 1000));

      try {
        const dataUrl = await captureNodeAsImage();
        
        const addImageToPdf = (imgDataUrl: string) => {
          return new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => {
              const imgWidth = img.width;
              const imgHeight = img.height;
              const pageRatio = pdfWidth / pdfHeight;
              const imgRatio = imgWidth / imgHeight;

              let finalImgWidth, finalImgHeight, x, y;

              if (imgRatio > pageRatio) {
                finalImgWidth = pdfWidth;
                finalImgHeight = pdfWidth / imgRatio;
                x = 0;
                y = (pdfHeight - finalImgHeight) / 2;
              } else {
                finalImgHeight = pdfHeight;
                finalImgWidth = pdfHeight * imgRatio;
                x = (pdfWidth - finalImgWidth) / 2;
                y = 0;
              }

              if (i > 0) pdf.addPage();
              pdf.addImage(imgDataUrl, 'PNG', x, y, finalImgWidth, finalImgHeight);
              resolve();
            };
            img.src = imgDataUrl;
          });
        };

        await addImageToPdf(dataUrl);

      } catch (error) {
        console.error(`Failed to export slide ${i}`, error);
        alert(`${t("errors.imageExport")} (Slide ${i + 1})`);
        break; 
      }
    }

    pdf.save(`L10_Slides_${data.config.companyName.replace(/\s+/g, '_')}.pdf`);
    setIsExportingAllSlides(false);
    setExportProgressMessage('');
    setCurrentSlide(originalSlide);
  };

  const handleExportImage = async () => {
    setIsExportingImage(true);
    try {
      const dataUrl = await captureNodeAsImage();
      const link = document.createElement('a');
      link.download = `L10-Slide-${currentSlide}-${data.config.companyName.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('oops, something went wrong!', error);
      alert(t('errors.imageExport'));
    } finally {
      setIsExportingImage(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] w-full flex flex-col bg-white dark:bg-slate-950 p-1 select-none">
      <MeetingControls
        t={t}
        isSyncing={isSyncing}
        handleSave={onSave ? () => onSave({ ...data, currentSlide }) : undefined}
        showSetup={() => setShowSetup(true)}
        showHistory={() => setShowHistory(true)}
        user={user}
        timeLeft={displayTime}
        isTimerRunning={data.timer.isTimerRunning}
        toggleTimer={toggleTimer}
        resetTimer={resetTimer}
        prevSlide={() => setCurrentSlide(s => Math.max(s - 1, 0))}
        nextSlide={() => setCurrentSlide(s => Math.min(s + 1, totalSlides - 1))}
        isPrevDisabled={currentSlide === 0}
        isNextDisabled={currentSlide === totalSlides - 1}
        data={data}
        averageRating={averageRating}
        currentSlide={currentSlide}
        prioritizeAndSetThemes={prioritizeAndSetThemes}
        handleExportImage={handleExportImage}
        isExportingImage={isExportingImage}
        handleExportAllSlides={handleExportAllSlides}
        isExportingAllSlides={isExportingAllSlides}
        exportProgressMessage={exportProgressMessage}
      />

      <div className="flex-1 px-4 md:px-6 xl:px-8 pb-12 pt-4 relative overflow-visible flex flex-col">
        <div className="flex-grow flex flex-col w-full h-full bg-transparent">
          <AnimatePresence mode="wait">
            <div key={currentSlide} id="slide-to-export">
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

      {user && (
        <HistorySidebar 
          user={user}
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          onLoadHistory={handleLoadHistory}
        />
      )}
    </div>
  );
}

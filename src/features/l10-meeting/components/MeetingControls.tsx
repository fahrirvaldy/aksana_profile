
"use client";

import { useState } from "react";

import { Clock, Play, Pause, RotateCcw, Settings, ChevronLeft, ChevronRight, Download, Loader2, Cloud } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import L10PDFDocument from "../pdf/L10PDFDocument";
import { L10Data } from "../types";

interface MeetingControlsProps {
  t: (key: string) => string;
  isSyncing?: boolean;
  handleSave?: () => void;
  showSetup: () => void;
  timeLeft: number;
  isTimerRunning: boolean;
  toggleTimer: () => void;
  resetTimer: () => void;
  prevSlide: () => void;
  nextSlide: () => void;
  isPrevDisabled: boolean;
  isNextDisabled: boolean;
  data: L10Data;
  averageRating: string;
}

export const MeetingControls = (
  { t, isSyncing, handleSave, showSetup, timeLeft, isTimerRunning, toggleTimer, resetTimer, prevSlide, nextSlide, isPrevDisabled, isNextDisabled, data, averageRating }: MeetingControlsProps
) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    if (isExporting) return;
    setIsExporting(true);
    
    // Force save before exporting to get latest data
    if (handleSave) {
      handleSave();
      // Give a brief moment for state to potentially update if saving is async
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    try {
      const docBlob = await pdf(
        <L10PDFDocument 
          data={data} 
          averageRating={averageRating} 
        />
      ).toBlob();
      const url = URL.createObjectURL(docBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `L10_Report_${data.config.companyName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("Gagal mengekspor PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Top Controls */}
      <div className="flex justify-between items-center p-8 z-40 flex-shrink-0">
        <div className="flex items-center gap-5">
          <div className={`bg-white dark:bg-slate-900/80 backdrop-blur-xl px-8 py-3.5 rounded-3xl flex items-center gap-5 shadow-lg border border-black dark:border-slate-800/50 ${timeLeft < 300 ? 'bg-rose-500/10 text-rose-600' : 'text-blue-600 dark:text-blue-400'}`}>
            <Clock size={24} /><span className="text-3xl font-black font-mono tracking-tighter">{formatTime(timeLeft)}</span>
            <div className="flex gap-4 border-l border-black dark:border-slate-800 pl-5 shadow-sm">
              <button onClick={toggleTimer} className="hover:scale-110 transition-transform active:scale-95 text-black dark:text-slate-300">{isTimerRunning ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}</button>
              <button onClick={resetTimer} className="hover:scale-110 transition-transform active:scale-95 text-black dark:text-slate-300"><RotateCcw size={20} /></button>
            </div>
          </div>
          <button onClick={handleExportPDF} disabled={isExporting} className="flex items-center gap-3 px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-3xl font-black hover:scale-105 transition-all text-xs active:scale-95 disabled:opacity-50 disabled:grayscale shadow-md">
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {isExporting ? "GENERATING PDF..." : "EXPORT L10 REPORT"}
          </button>
          <div title={isSyncing ? "Menyimpan..." : "Disimpan"} className="flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
            {isSyncing ? <Loader2 size={16} className="animate-spin text-blue-500" /> : <Cloud size={16} className="text-emerald-600" />}
          </div>

          {handleSave && (
            <button onClick={handleSave} disabled={isSyncing} className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-slate-900 rounded-3xl font-black hover:scale-105 transition-all text-xs active:scale-95 shadow-md border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200">
              SIMPAN MANUAL
            </button>
          )}

        </div>
        <button onClick={showSetup} className="p-4 rounded-3xl bg-white dark:bg-slate-900 shadow-lg border border-slate-200 dark:border-slate-800 text-black dark:text-slate-100 hover:text-blue-500 hover:rotate-90 transition-all duration-700 active:scale-90"><Settings size={24} /></button>
      </div>

      {/* Bottom Controls */}
      <div className="fixed bottom-6 right-8 flex items-center gap-3 z-[100] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 p-3 rounded-2xl shadow-xl aksana-glass">
        <button onClick={prevSlide} disabled={isPrevDisabled} className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-500/10 disabled:opacity-30 transition-colors active:scale-90"><ChevronLeft size={24} /></button>
        <button onClick={nextSlide} disabled={isNextDisabled} className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-500/10 disabled:opacity-30 transition-colors active:scale-90"><ChevronRight size={24} /></button>
      </div>
    </>
  );
}

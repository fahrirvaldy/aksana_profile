
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { L10Data, IDSIssue } from "../types";
import { DEFAULT_DATA, generateDefaultTheme } from "../constants";

interface L10MeetingProps {
  initialData?: L10Data;
  onSave?: (data: L10Data) => void;
  t: (key: string, params?: any) => string;
  initialSlide?: number;
}

export const useL10Meeting = ({ initialData, onSave, t, initialSlide }: L10MeetingProps) => {
  const [data, setData] = useState<L10Data>(() => {
    if (initialData) {
      const merged = { ...initialData };
      if (!merged.idsSession) merged.idsSession = { issues: [], themes: [], solutions: "" };
      if (!merged.idsSession.themes || merged.idsSession.themes.length === 0) {
        merged.idsSession.themes = [generateDefaultTheme(1), generateDefaultTheme(2), generateDefaultTheme(3)];
      }
      return merged as L10Data;
    }
    return DEFAULT_DATA;
  });

  const [currentSlide, setCurrentSlide] = useState(initialSlide || 0);
  const [showSetup, setShowSetup] = useState(false);
  const [activeThemeTab, setActiveThemeTab] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState(5400); // 90 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerEndTimeRef = useRef<number | null>(null);

  useEffect(() => {
    localStorage.setItem('l10-meeting-data', JSON.stringify({ data, currentSlide }));
  }, [data, currentSlide]);

  useEffect(() => {
    if (!initialData) {
      setShowSetup(true);
    }
  }, [initialData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSave) onSave(data);
    }, 1500);
    return () => clearTimeout(timer);
  }, [data, onSave]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isTimerRunning) {
      timerEndTimeRef.current = Date.now() + timeLeft * 1000;
      intervalId = setInterval(() => {
        if (timerEndTimeRef.current) {
          const remainingMs = timerEndTimeRef.current - Date.now();
          if (remainingMs <= 0) {
            setTimeLeft(0);
            setIsTimerRunning(false);
            clearInterval(intervalId);
          } else {
            setTimeLeft(Math.ceil(remainingMs / 1000));
          }
        }
      }, 250);
    }
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [isTimerRunning]);

  const attendees = useMemo(() => {
    return ['Owner', 'Integrator', ...data.config.divisions];
  }, [data.config.divisions]);

  const averageRating = useMemo(() => {
    let totalScore = 0;
    let activeCount = 0;
    attendees.forEach((_, idx) => {
      if (data.attendance && data.attendance[idx] === true) {
        const scoreRaw = data.ratings ? data.ratings[idx] : undefined;
        const ratingValue = scoreRaw !== undefined && scoreRaw !== "" ? parseFloat(String(scoreRaw)) : 0;
        if (ratingValue > 0 && !isNaN(ratingValue)) {
          totalScore += ratingValue;
          activeCount++;
        }
      }
    });
    return activeCount > 0 ? (totalScore / activeCount).toFixed(1) : "0.0";
  }, [data, attendees]);

  const updateData = (path: string, value: any) => {
    setData(prev => {
      const setDeep = (obj: any, pathKeys: string[], val: any): any => {
        if (pathKeys.length === 0) return val;
        const [currentKey, ...remainingKeys] = pathKeys;
        const isArray = Array.isArray(obj);
        const cloned = isArray ? [...(obj || [])] : { ...(obj || {}) };
        const targetKey = isArray ? parseInt(currentKey, 10) : currentKey;
        cloned[targetKey] = setDeep(cloned[targetKey], remainingKeys, val);
        return cloned;
      };
      const keys = path.split('.');
      return setDeep(prev, keys, value);
    });
  };

  const pullOffTrackData = () => {
    const issuesList = data.idsSession?.issues || [];
    const existingTexts = new Set(issuesList.map(i => i.text.toLowerCase()));
    const newIssues: IDSIssue[] = [];
    Object.entries(data.scorecards).forEach(([div, kpis]) => {
      kpis.forEach(k => {
        if (k.status === 'off' && !existingTexts.has(k.kpi.toLowerCase())) {
          newIssues.push({ id: `sc-${div}-${Date.now()}-${Math.random()}`, source: div.toUpperCase(), text: k.kpi, isResolved: false, isSelectedForDiscussion: false, votes: 0 });
        }
      });
    });
    data.rocksStatus.forEach((r, i) => {
      const rockText = data.config.rocks[i];
      if (r.status === 'off' && rockText && !existingTexts.has(rockText.toLowerCase())) {
        const picLabel = r.pic ? `ROCK - ${r.pic.toUpperCase()}` : "ROCK";
        newIssues.push({ id: `rock-${i}-${Date.now()}-${Math.random()}`, source: picLabel, text: rockText, isResolved: false, isSelectedForDiscussion: false, votes: 0 });
      }
    });
    if (newIssues.length > 0) {
      updateData('idsSession.issues', [...issuesList, ...newIssues]);
    }
  };

  const handleIssueCheck = (index: number, checked: boolean) => {
    const issuesList = [...(data.idsSession?.issues || [])];
    if (issuesList[index]) {
      issuesList[index].isResolved = checked;
      const sortedIssues = issuesList.sort((a, b) => Number(a.isResolved) - Number(b.isResolved));
      updateData('idsSession.issues', sortedIssues);
    }
  };

  return {
    data, updateData,
    currentSlide, setCurrentSlide,
    showSetup, setShowSetup,
    activeThemeTab, setActiveThemeTab,
    timeLeft, setTimeLeft,
    isTimerRunning, setIsTimerRunning,
    averageRating,
    pullOffTrackData,
    handleIssueCheck,
  };
};

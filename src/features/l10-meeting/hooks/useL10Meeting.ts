"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { L10Data, IDSIssue } from "../types";
import { DEFAULT_DATA, generateDefaultTheme } from "../constants";
import { supabase } from "@/lib/supabase/client";
import { RealtimeChannel, User } from "@supabase/supabase-js";

interface L10MeetingProps {
  initialData?: L10Data;
  onSave?: (data: L10Data & { currentSlide?: number }) => void;
  initialSlide?: number;
  user?: User | null;
}

const L10_MEETING_CHANNEL = "l10-meeting-room";

export const useL10Meeting = ({ initialData, onSave, initialSlide, user }: L10MeetingProps) => {
  const [data, setData] = useState<L10Data>(() => {
    const baseData = initialData || DEFAULT_DATA;
    if (!baseData.timer) {
      baseData.timer = { isTimerRunning: false, timeLeft: 5400, timerEndTime: null };
    }
    if (!baseData.idsSession) baseData.idsSession = { issues: [], themes: [], solutions: "" };
    if (!baseData.idsSession.themes || baseData.idsSession.themes.length === 0) {
      baseData.idsSession.themes = [generateDefaultTheme(1), generateDefaultTheme(2), generateDefaultTheme(3)];
    }
    return baseData as L10Data;
  });

  const channelRef = useRef<RealtimeChannel | null>(null);
  const isRemoteUpdate = useRef(false);

  const [currentSlide, setCurrentSlide] = useState(initialSlide || 0);
  const [showSetup, setShowSetup] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [activeThemeTab, setActiveThemeTab] = useState<number>(0);
  const [displayTime, setDisplayTime] = useState(data.timer.timeLeft);

  const isBroadcasting = useRef(false);

  // Effect to broadcast data changes
  useEffect(() => {
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }
    const dbSaveTimer = setTimeout(() => {
      if (onSave) onSave({ ...data, currentSlide });
    }, 1500);

    const broadcastTimer = setTimeout(() => {
      if (channelRef.current) {
        isBroadcasting.current = true;
        channelRef.current.send({
          type: 'broadcast',
          event: 'data_update',
          payload: { data },
        });
        setTimeout(() => { isBroadcasting.current = false; }, 100);
      }
    }, 500);

    return () => {
      clearTimeout(broadcastTimer);
      clearTimeout(dbSaveTimer);
    };
  }, [data, onSave, currentSlide]);

  // Effect to subscribe to realtime channel
  useEffect(() => {
    if (!user?.id) return;

    const userSpecificChannel = `${L10_MEETING_CHANNEL}-${user.id}`;
    const channel = supabase.channel(userSpecificChannel, {
      config: { broadcast: { self: false } },
    });

    channel.on('broadcast', { event: 'data_update' }, ({ payload }) => {
      if (isBroadcasting.current) return;
      isRemoteUpdate.current = true;
      setData(payload.data);
    });

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Effect for local timer countdown based on synced state
  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;

    if (data.timer.isTimerRunning && data.timer.timerEndTime) {
      intervalId = setInterval(() => {
        const remainingMs = data.timer.timerEndTime! - Date.now();
        if (remainingMs <= 0) {
          setDisplayTime(0);
          if (data.timer.isTimerRunning) { // Prevent multiple updates
            updateData("timer", { ...data.timer, isTimerRunning: false, timeLeft: 0 });
          }
          clearInterval(intervalId);
        } else {
          setDisplayTime(Math.ceil(remainingMs / 1000));
        }
      }, 250);
    } else {
       setDisplayTime(data.timer.timeLeft);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [data.timer.isTimerRunning, data.timer.timerEndTime, data.timer.timeLeft]);


  const updateData = <T,>(path: string, value: T) => {
    setData(prev => {
      const setDeep = <T,>(obj: Record<string, T> | T[], pathKeys: string[], val: T): Record<string, T> | T[] => {
        if (pathKeys.length === 0) return val as Record<string, T> | T[];
        const [currentKey, ...remainingKeys] = pathKeys;
        const isArray = Array.isArray(obj);
        const cloned = isArray ? [...(obj || [])] : { ...(obj || {}) };
        const targetKey = isArray ? parseInt(currentKey, 10) : currentKey;
        (cloned as Record<string, any>)[targetKey] = setDeep((cloned as Record<string, any>)[targetKey], remainingKeys, val);
        return cloned;
      };
      const keys = path.split('.');
      return setDeep(prev, keys, value) as L10Data;
    });
  };

  const toggleTimer = () => {
    const wasRunning = data.timer.isTimerRunning;
    const newTimeLeft = displayTime; // Use local display time as source of truth when pausing

    const newTimerState = {
        isTimerRunning: !wasRunning,
        timeLeft: newTimeLeft,
        timerEndTime: !wasRunning ? Date.now() + (newTimeLeft * 1000) : null,
    };
    updateData('timer', newTimerState);
  };

  const resetTimer = () => {
    updateData('timer', { 
      isTimerRunning: false, 
      timeLeft: 5400, 
      timerEndTime: null 
    });
  };

  const handleLoadHistory = (historyData: L10Data) => {
    setData(historyData);
  };

  const attendees = useMemo(() => ['Owner', 'Integrator', ...data.config.divisions], [data.config.divisions]);

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
    if (newIssues.length > 0) updateData('idsSession.issues', [...issuesList, ...newIssues]);
  };

  const handleIssueCheck = (index: number, checked: boolean) => {
    const issuesList = [...(data.idsSession?.issues || [])];
    if (issuesList[index]) {
      issuesList[index].isResolved = checked;
      const sortedIssues = issuesList.sort((a, b) => Number(a.isResolved) - Number(b.isResolved));
      updateData('idsSession.issues', sortedIssues);
    }
  };

  const prioritizeAndSetThemes = () => {
    const issues = data.idsSession?.issues || [];
    if (issues.length === 0) return;
    const sortedIssues = [...issues].sort((a, b) => b.votes - a.votes);
    const newThemes = [...(data.idsSession.themes || [])].map((theme, index) => {
      if (sortedIssues[index]) return { ...theme, topic: sortedIssues[index].text };
      return { ...theme, topic: `Discussion Theme ${index + 1}` };
    });
    updateData('idsSession.themes', newThemes);
  };

  return { data, updateData, currentSlide, setCurrentSlide, showSetup, setShowSetup, showHistory, setShowHistory, handleLoadHistory, activeThemeTab, setActiveThemeTab, displayTime, toggleTimer, resetTimer, averageRating, pullOffTrackData, handleIssueCheck, prioritizeAndSetThemes };
};
"use client";

import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { getL10MeetingHistory } from '@/lib/supabase/tools';
import { L10Data } from '../types';
import { Loader2, History, ArrowRight } from 'lucide-react';

interface HistorySidebarProps {
  user: User;
  onLoadHistory: (data: L10Data) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface HistoryItem {
  id: number;
  meeting_id: string;
  meeting_data: L10Data;
  saved_at: string;
}

export default function HistorySidebar({ user, onLoadHistory, isOpen, onClose }: HistorySidebarProps) {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      const fetchHistory = async () => {
        setIsLoading(true);
        const data = await getL10MeetingHistory(user);
        if (data) {
          setHistoryItems(data as HistoryItem[]);
        }
        setIsLoading(false);
      };
      fetchHistory();
    }
  }, [isOpen, user]);

  const handleLoad = (item: HistoryItem) => {
    onLoadHistory(item.meeting_data);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-xl z-50 flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2"><History size={20} /> Riwayat Meeting</h3>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
          <ArrowRight size={18} />
        </button>
      </div>
      <div className="flex-grow overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-slate-500" />
          </div>
        ) : historyItems.length === 0 ? (
          <div className="text-center text-sm text-slate-500 pt-10">
            Tidak ada riwayat yang tersimpan.
          </div>
        ) : (
          <ul className="space-y-2">
            {historyItems.map((item) => (
              <li key={item.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  {new Date(item.saved_at).toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
                <p className="text-sm font-bold truncate">
                  {item.meeting_data.config.companyName || 'Meeting Tanpa Judul'}
                </p>
                <button 
                  onClick={() => handleLoad(item)}
                  className="text-xs font-bold text-blue-600 hover:underline mt-2"
                >
                  Muat Versi Ini
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

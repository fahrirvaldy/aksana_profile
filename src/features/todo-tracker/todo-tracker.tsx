
"use client";

import { useRef, useState } from 'react';
import { User } from "@supabase/supabase-js";
import { useTranslations, useLocale } from 'next-intl';
import { ToDoTrackerInitialData } from "./types";
import { useTodoTracker } from "./hooks/useTodoTracker";
import { handleDownloadImage } from "./utils/exportImage";

import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { TaskList } from './components/TaskList';
import { SyncStatus } from './components/SyncStatus';

interface ToDoTrackerProps {
  user?: User;
  onSave?: (data: ToDoTrackerInitialData) => void;
  isSyncing?: boolean;
  initialData?: ToDoTrackerInitialData;
}

export default function ToDoTrackerContainer({ user, onSave, isSyncing, initialData }: ToDoTrackerProps) {
  const t = useTranslations("Tools.Todo");
  const [isExporting, setIsExporting] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  const {
    todos,
    newTask, setNewTask,
    newOwner, setNewOwner,
    newDueDate, setNewDueDate,
    filterOwner, setFilterOwner,
    stats,
    uniqueOwners,
    filteredTodos,
    addTodo,
    toggleTodo,
    deleteTodo
  } = useTodoTracker({ initialData, onSave });

  const onDownload = async () => {
    setIsExporting(true);
    // Wait a moment for the state to update and UI to re-render without export-ignored elements
    await new Promise(resolve => setTimeout(resolve, 100));
    await handleDownloadImage(captureRef, t);
    setIsExporting(false);
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700">
      <div ref={captureRef} className={`${isExporting ? 'p-12 bg-white dark:bg-[#1E1E1E] rounded-xl border border-slate-200 dark:border-slate-800' : ''}`}>
        
        <Header t={t} stats={stats} onDownload={onDownload} />

        {!isExporting && (
          <InputForm 
            t={t} 
            addTodo={addTodo} 
            newTask={newTask} 
            setNewTask={setNewTask} 
            newOwner={newOwner} 
            setNewOwner={setNewOwner} 
            newDueDate={newDueDate} 
            setNewDueDate={setNewDueDate} 
          />
        )}

        <TaskList 
          t={t}
          stats={stats}
          isExporting={isExporting}
          filterOwner={filterOwner}
          setFilterOwner={setFilterOwner}
          uniqueOwners={uniqueOwners}
          filteredTodos={filteredTodos}
          toggleTodo={toggleTodo}
          deleteTodo={deleteTodo}
        />

        {isExporting && (
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-[0.2em] shadow-sm">
            <p>Aksana Business Lab - {t('title')}</p>
            <p>{new Date().toLocaleDateString(useLocale(), { dateStyle: 'full' })}</p>
          </div>
        )}
      </div>

      {user && !isExporting && (
        <SyncStatus t={t} isSyncing={isSyncing} onSave={onSave} getTodos={() => ({ todos })} />
      )}
    </div>
  );
}


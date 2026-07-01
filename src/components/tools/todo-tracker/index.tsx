"use client";

import { User } from "@supabase/supabase-js";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  User as UserIcon, 
  Calendar, 
  Filter, 
  Download,
  Layout,
  Loader2,
  Save,
  Cloud,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from 'next-intl';

interface Todo {
  id: string;
  task: string;
  owner: string;
  dueDate: string;
  completed: boolean;
  createdAt: string;
}

interface ToDoTrackerInitialData {
  todos?: Todo[];
}

interface ToDoTrackerProps {
  user?: User;
  onSave?: (data: ToDoTrackerInitialData) => void;
  isSyncing?: boolean;
  initialData?: ToDoTrackerInitialData;
}

export default function ToDoTracker({ user, onSave, isSyncing, initialData }: ToDoTrackerProps) {
  const t = useTranslations("Tools.Todo");
  const locale = useLocale();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [newDueDate, setNewDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterOwner, setFilterOwner] = useState("all");
  const [isExporting, setIsExporting] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  // Sync initialData
  const [prevInitialData, setPrevInitialData] = useState<ToDoTrackerInitialData | undefined>(initialData);

  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData);
    if (initialData?.todos) {
      setTodos(initialData.todos);
    }
  }

  // Debounced Auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSave) {
        onSave({ todos });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [todos, onSave]);

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }, [todos]);

  const uniqueOwners = useMemo(() => {
    const owners = todos.map(t => t.owner);
    return [...new Set(owners)].sort();
  }, [todos]);

  const filteredTodos = useMemo(() => {
    if (filterOwner === "all") return todos;
    return todos.filter(t => t.owner === filterOwner);
  }, [todos, filterOwner]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !newOwner.trim() || !newDueDate) return;

    const newTodo: Todo = {
      id: Date.now().toString(),
      task: newTask,
      owner: newOwner,
      dueDate: newDueDate,
      completed: false,
      createdAt: new Date().toISOString()
    };

    setTodos(prev => [newTodo, ...prev]);
    setNewTask("");
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const handleDownloadImage = async () => {
    if (!captureRef.current) return;
    setIsExporting(true);
    try {
      const domtoimage = (await import('dom-to-image-more')).default;
      const dataUrl = await domtoimage.toPng(captureRef.current, {
        quality: 1.0,
        bgcolor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#f8fafc',
        filter: (node) => {
          // Abaikan tombol unduh saat capture
          return (node as HTMLElement).getAttribute ? (node as HTMLElement).getAttribute('data-export-ignore') !== 'true' : true;
        }
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `aksana-report-${new Date().getTime()}.png`;
      link.click();
    } catch (err) {
      console.error("Gagal export:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700">
      <div ref={captureRef} className={`${isExporting ? 'p-12 bg-white dark:bg-[#1E1E1E] rounded-xl border border-slate-200 dark:border-slate-800' : ''}`}>
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:p-8 mb-12">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3 font-[family-name:var(--font-plus-jakarta)]">
              <div className="p-3 bg-black dark:bg-slate-50 text-white dark:text-black rounded-2xl">
                <Layout size={28} />
              </div>
              {t('title')}
            </h1>
            <p className="text-slate-600 dark:text-slate-300 font-normal">{t('subtitle')}</p>
          </div>

          <div className="flex items-center gap-6">
            {!isExporting && (
              <button 
                data-export-ignore="true"
                onClick={handleDownloadImage}
                className="p-4 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all text-slate-600 dark:text-slate-300 aksana-glass"
                title={t('export')}
              >
                <Download size={20} />
              </button>
            )}

            <div className="p-6 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-6 shadow-sm aksana-glass">
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-1">{t('progress')}</p>
                <p className={`text-2xl font-black ${stats.percentage >= 90 ? 'text-emerald-500' : 'text-blue-500'}`}>
                  {stats.percentage}%
                </p>
              </div>
              <div className="relative w-14 h-14">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle 
                    cx="50" cy="50" r="40" 
                    stroke="currentColor" strokeWidth="8" fill="transparent" 
                    className="text-black/5 dark:text-slate-950" 
                  />
                  <circle 
                    cx="50" cy="50" r="40" 
                    stroke="currentColor" strokeWidth="8" fill="transparent" 
                    strokeDasharray={251.2} 
                    strokeDashoffset={251.2 - (251.2 * stats.percentage) / 100} 
                    className={`${stats.percentage >= 90 ? 'text-emerald-500' : 'text-blue-500'} transition-all duration-1000`} 
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Input Form */}
        {!isExporting && (
          <div data-export-ignore="true" className="p-6 md:p-8 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl mb-12 shadow-sm aksana-glass">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300 mb-6 flex items-center gap-2">
              <Plus size={16} /> {t('addNew')}
            </h2>
            <form onSubmit={addTodo} className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-5">
                <input 
                  type="text" 
                  placeholder={t('placeholderTask')} 
                  className="w-full px-5 py-4 rounded-2xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:border-black outline-none transition-all font-semibold placeholder-slate-400 dark:placeholder-slate-500"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                />
              </div>
              <div className="md:col-span-3">
                <div className="relative">
                  <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300" />
                  <input 
                    type="text"
                    placeholder={t('placeholderPic')}
                    className="w-full pl-12 pr-5 py-4 rounded-2xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:border-black outline-none transition-all font-semibold placeholder-slate-400 dark:placeholder-slate-500"
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="relative">
                  <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300 pointer-events-none" />
                  <input 
                    type="date"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:border-black outline-none transition-all font-semibold appearance-none"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <button 
                  type="submit"
                  className="w-full h-full bg-black dark:bg-slate-50 text-white dark:text-black font-bold rounded-2xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {t('save')} <ArrowRight size={18} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Task List Container */}
        <div className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden min-h-[400px] shadow-sm aksana-glass">
          <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white dark:bg-[#1E1E1E] shadow-sm">
            <div className="flex items-center gap-4">
              <h3 className="font-black text-xl text-black dark:text-[#EEEEEE]">{t('listTitle')}</h3>
              <span className="px-3 py-1 bg-black text-white dark:bg-slate-800 dark:text-slate-400 text-[10px] font-bold rounded-lg uppercase tracking-widest">
                {t('tasksCount', { n: stats.total })}
              </span>
            </div>
            
            {!isExporting && (
              <div data-export-ignore="true" className="flex items-center gap-3">
                <Filter size={16} className="text-slate-600 dark:text-slate-300" />
                <select 
                  className="px-4 py-2 text-sm bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 rounded-xl outline-none focus:border-black font-bold cursor-pointer"
                  value={filterOwner}
                  onChange={(e) => setFilterOwner(e.target.value)}
                >
                  <option value="all">{t('allPic')}</option>
                  {uniqueOwners.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800/50">
            <AnimatePresence initial={false}>
              {filteredTodos.length > 0 ? (
                filteredTodos.map((todo) => (
                  <motion.div 
                    key={todo.id} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`group p-6 md:p-6 md:p-8 flex items-start gap-6 transition-all ${todo.completed ? 'bg-emerald-50/10 dark:bg-emerald-500/5' : 'hover:bg-black/5 dark:hover:bg-slate-800/20'}`}
                  >
                    <button 
                      onClick={() => toggleTodo(todo.id)}
                      className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-xl transition-all ${todo.completed ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-900 dark:text-slate-700 hover:text-blue-500 hover:bg-blue-500/10'}`}
                    >
                      {todo.completed ? <CheckCircle2 size={28} /> : <Circle size={28} />}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <p 
                        className={`text-lg font-bold transition-all cursor-pointer ${todo.completed ? 'line-through text-slate-600 dark:text-slate-400 decoration-2' : 'text-black dark:text-[#EEEEEE]'}`} 
                        onClick={() => toggleTodo(todo.id)}
                      >
                        {todo.task}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-black text-white dark:bg-blue-900/30 dark:text-blue-400 rounded-lg border border-black dark:border-blue-800/50 shadow-sm">
                          <UserIcon size={12} />
                          {todo.owner}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                          <Calendar size={12} />
                          {t('deadline', { date: todo.dueDate })}
                        </div>
                      </div>
                    </div>

                    {!isExporting && (
                      <button 
                        data-export-ignore="true"
                        onClick={() => deleteTodo(todo.id)}
                        className="opacity-0 group-hover:opacity-100 p-3 text-black dark:text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="p-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center mx-auto text-black dark:text-slate-700">
                    <Layout size={32} />
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-normal italic">{t('empty')}</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Branding for Export */}
        {isExporting && (
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-[0.2em] shadow-sm">
            <p>Aksana Business Lab - {t('title')}</p>
            <p>{new Date().toLocaleDateString(locale, { dateStyle: 'full' })}</p>
          </div>
        )}
      </div>

      {/* Cloud Sync Status */}
      {user && !isExporting && (
        <div className="fixed bottom-8 right-8 z-50">
          <div className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-full px-6 py-4 flex items-center gap-3 shadow-sm aksana-glass">
            {isSyncing ? (
              <Loader2 className="animate-spin text-blue-500" size={20} />
            ) : (
              <Cloud className="text-emerald-500" size={20} />
            )}
            <span className="text-sm font-bold text-slate-600 dark:text-[#EEEEEE]">
              {isSyncing ? t('sync.syncing') : t('sync.connected')}
            </span>
            {onSave && !isSyncing && (
               <button 
                onClick={() => onSave({ todos })}
                className="ml-2 p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all text-black dark:text-slate-400 border border-slate-200 dark:border-slate-800"
                title={t('sync.save')}
              >
                <Save size={16} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
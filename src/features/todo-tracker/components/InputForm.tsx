
"use client";

import { Plus, User as UserIcon, Calendar, ArrowRight } from 'lucide-react';

interface InputFormProps {
  t: (key: string) => string;
  addTodo: (e: React.FormEvent) => void;
  newTask: string;
  setNewTask: (value: string) => void;
  newOwner: string;
  setNewOwner: (value: string) => void;
  newDueDate: string;
  setNewDueDate: (value: string) => void;
}

export const InputForm = ({ t, addTodo, newTask, setNewTask, newOwner, setNewOwner, newDueDate, setNewDueDate }: InputFormProps) => {
  return (
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
  );
}

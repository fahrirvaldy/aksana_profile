
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Filter, Layout, CheckCircle2, Circle, User as UserIcon, Calendar, Trash2 } from "lucide-react";
import { Todo } from "../types";

interface TaskListProps {
  t: (key: string, params?: any) => string;
  stats: { total: number };
  isExporting: boolean;
  filterOwner: string;
  setFilterOwner: (value: string) => void;
  uniqueOwners: string[];
  filteredTodos: Todo[];
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
}

export const TaskList = (
  { t, stats, isExporting, filterOwner, setFilterOwner, uniqueOwners, filteredTodos, toggleTodo, deleteTodo }: TaskListProps
) => {
  return (
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
  );
}


"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2 } from "lucide-react";
import { L10Data } from "../types";
import { AutoResizeTextarea } from "./AutoResizeTextarea";

interface SetupModalProps {
  show: boolean;
  onClose: () => void;
  data: L10Data;
  updateData: <T,>(path: string, value: T) => void;
}

export const SetupModal = ({ show, onClose, data, updateData }: SetupModalProps) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-slate-950/80 backdrop-blur-xl">
          <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-12 rounded-xl relative max-h-[90vh] flex flex-col overflow-hidden aksana-glass shadow-2xl">
            <button onClick={onClose} className="absolute top-8 right-8 text-black dark:text-slate-100 hover:text-rose-500 transition-all active:scale-90"><X size={28} /></button>
            <div className="space-y-8 flex flex-col flex-1 min-h-0">
              <div className="text-center flex-shrink-0 space-y-1"><h2 className="text-3xl font-black text-black dark:text-white">Meeting Engine Setup</h2><p className="text-black font-bold tracking-tight">Konfigurasi struktur rapat untuk efisiensi maksimal.</p></div>
              <div className="space-y-6 flex-1 overflow-y-auto pr-3 custom-scrollbar pb-4">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest ml-1">Company / Organization</label>
                  <AutoResizeTextarea value={data.config.companyName} onChange={(e) => updateData('config.companyName', e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:ring-4 focus:ring-black/5 font-black text-lg outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-600 dark:text-slate-300 tracking-wider mb-3 uppercase">DIVISI PESERTA RAPAT</label>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2 mb-3">
                    {data.config.divisions.map((division, i) => (
                      <div key={i} className="flex items-center gap-3 group">
                        <AutoResizeTextarea
                          value={division}
                          placeholder={`Nama Divisi ${i + 1}`}
                          onChange={(e) => {
                            const newDivisions = [...data.config.divisions];
                            newDivisions[i] = e.target.value;
                            updateData('config.divisions', newDivisions);
                          }}
                          className="flex-1 px-5 py-3 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:ring-4 focus:ring-black/5 text-sm font-bold outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500"
                        />
                        <button
                          onClick={() => {
                            const newDivisions = data.config.divisions.filter((_, idx) => idx !== i);
                            updateData('config.divisions', newDivisions);
                            if (data.ratings) {
                              const newRatings = { ...data.ratings };
                              delete newRatings[i + 2];
                              updateData('ratings', newRatings);
                            }
                          }}
                          className="p-3 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        ><Trash2 size={18} /></button>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => updateData('config.divisions', [...data.config.divisions, ""])} className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:text-blue-500 hover:border-blue-500 transition-all font-black text-xs bg-white dark:bg-[#1E1E1E] flex items-center justify-center gap-2 shadow-sm"><Plus size={14} /> + TAMBAH DIVISI BARU</button>
                </div>
                <div className="space-y-3"><label className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest ml-1">Quarterly Rocks (Priorities)</label>
                  <div className="space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                    {data.config.rocks.map((rock, i) => (
                      <div key={i} className="flex gap-3 group">
                        <AutoResizeTextarea value={rock} onChange={(e) => { const newRocks = [...data.config.rocks]; newRocks[i] = e.target.value; updateData('config.rocks', newRocks); }} className="flex-1 px-5 py-3 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:ring-4 focus:ring-blue-500/10 text-sm font-bold outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500 whitespace-normal break-words leading-relaxed" />
                        <button onClick={() => updateData('config.rocks', data.config.rocks.filter((_, idx) => idx !== i))} className="p-3 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"><Trash2 size={18}/></button>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => updateData('config.rocks', [...data.config.rocks, ""])} className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:text-blue-500 hover:border-blue-500 transition-all font-black text-xs bg-white dark:bg-[#1E1E1E] shadow-sm">+ ADD NEW ROCK</button>
                </div>
              </div>
              <button onClick={onClose} className="w-full py-5 rounded-[2rem] bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-black text-lg shadow-2xl active:scale-[0.97] transition-all flex-shrink-0">LAUNCH MEETING SESSION</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

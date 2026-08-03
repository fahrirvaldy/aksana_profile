
"use client";

import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Building2, Loader2, ArrowRight, Trash2 } from 'lucide-react';
import { Card } from './shared/Card';
import { generatePsychometricProfile } from '../services/geminiApi';
import { Seat } from '../types';

export function CompanySetup({ onComplete }: { onComplete: (seats: Record<string, Seat>, name: string) => void }) {
  const [compName, setCompName] = useState("");
  const [newDivision, setNewDivision] = useState("");
  const [divisions, setDivisions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const handleAddDivision = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDivision.trim() && !divisions.includes(newDivision.trim())) {
      setDivisions([...divisions, newDivision.trim()]);
      setNewDivision("");
    }
  };

  const handleRemoveDivision = (div: string) => {
    setDivisions(divisions.filter(d => d !== div));
  };

  const handleGenerate = async () => {
    if (!compName) { setError("Nama perusahaan wajib diisi."); return; }
    if (divisions.length === 0) { setError("Masukkan minimal 1 divisi/peran."); return; }
    
    setError("");
    setIsGenerating(true);

    try {
      const aiSeatsProfile = await generatePsychometricProfile(divisions);
      const standardizedSeats: Record<string, Seat> = {};
      
      if (!aiSeatsProfile) {
        // Fallback Logic
        divisions.forEach(div => {
          standardizedSeats[div] = { req: { creativity: 50, leadership: 50, detail: 50, execution: 50 } };
        });
      } else {
        divisions.forEach(div => {
          const aiKey = Object.keys(aiSeatsProfile).find(k => 
            k.toLowerCase().includes(div.toLowerCase()) || 
            div.toLowerCase().includes(k.toLowerCase())
          ) || Object.keys(aiSeatsProfile)[0];
          
          if (aiKey && aiSeatsProfile[aiKey]) {
              standardizedSeats[div] = aiSeatsProfile[aiKey];
          } else {
              standardizedSeats[div] = { req: { creativity: 50, leadership: 50, detail: 50, execution: 50 } };
          }
        });
      }

      onComplete(standardizedSeats, compName);
    } catch (err) {
      setError("Gagal memproses data. Silakan coba lagi.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-12 bg-white border border-black aksana-glass">
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Building2 size={40} />
        </div>
        <h1 className="text-3xl font-black text-black tracking-tight">Setup Profil Organisasi</h1>
        <p className="text-black mt-3 font-medium">AI akan menganalisis kebutuhan psikologis untuk setiap peran yang Anda masukkan.</p>
      </div>

      <div className="space-y-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300 ml-1">Nama Perusahaan</label>
          <input 
            type="text" 
            className="w-full p-4 bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-black/5 transition-all font-bold placeholder-slate-400 dark:placeholder-slate-500"
            placeholder="Masukkan nama perusahaan..."
            value={compName}
            onChange={(e) => setCompName(e.target.value)}
            disabled={isGenerating}
          />
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300 ml-1">Daftar Divisi / Seats</label>
          <form onSubmit={handleAddDivision} className="flex gap-3">
            <input 
              type="text" 
              className="flex-1 p-4 bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-black/5 transition-all font-bold placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="Contoh: Marketing, Frontend Dev..."
              value={newDivision}
              onChange={(e) => setNewDivision(e.target.value)}
              disabled={isGenerating}
            />
            <button 
              type="submit"
              disabled={!newDivision.trim() || isGenerating}
              className="px-6 py-4 bg-white border border-black text-indigo-600 font-bold rounded-2xl hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm aksana-glass"
            >
              Tambah
            </button>
          </form>

          <div className="flex flex-wrap gap-2.5 min-h-[100px] p-5 border border-black rounded-[2rem] bg-white shadow-sm">
            {divisions.length === 0 && <span className="text-sm text-black italic m-auto font-medium">Belum ada divisi ditambahkan.</span>}
            {divisions.map((div, idx) => (
              <motion.div 
                key={idx} 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-black rounded-xl shadow-sm text-sm font-bold text-black aksana-glass"
              >
                {div}
                <button type="button" onClick={() => handleRemoveDivision(div)} disabled={isGenerating} className="text-black hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {error && <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border border-red-100 text-center shadow-sm">{error}</div>}

        <button 
          onClick={handleGenerate}
          disabled={isGenerating || divisions.length === 0 || !compName}
          className="w-full py-5 mt-4 bg-black text-white font-black rounded-[2rem] hover:opacity-90 disabled:bg-slate-300 transition-all shadow-xl flex justify-center items-center gap-3 text-lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              AI menganalisis standar...
            </>
          ) : (
            <>
              Selesai & Analisis Struktur <ArrowRight size={20} />
            </>
          )}
        </button>
      </div>
    </Card>
  );
}


"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, ArrowRight } from 'lucide-react';
import { Card } from "./shared/Card";
import { PSYCHO_QUESTIONS } from '../constants';
import { Seat, Employee, PsychoScores } from '../types';

interface AssessmentFormProps {
  seats: Record<string, Seat>;
  onComplete: (emp: Employee) => void;
}

export function AssessmentForm({ seats, onComplete }: AssessmentFormProps) {
  const [step, setStep] = useState(0); 
  const [formData, setFormData] = useState({ name: '', role: Object.keys(seats)[0] || '' });
  const [answers, setAnswers] = useState<Record<number, keyof PsychoScores>>({});

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() !== '') setStep(1);
  };

  const handleAnswer = (questionId: number, selectedTrait: keyof PsychoScores) => {
    const newAnswers = { ...answers, [questionId]: selectedTrait };
    setAnswers(newAnswers);
    
    setTimeout(() => {
      if (step < PSYCHO_QUESTIONS.length) {
        setStep(step + 1);
      } else {
        processResults(newAnswers);
      }
    }, 400);
  };

  const processResults = (finalAnswers: Record<number, keyof PsychoScores>) => {
    const scores: PsychoScores = { creativity: 30, leadership: 30, detail: 30, execution: 30 };
    Object.values(finalAnswers).forEach(trait => {
      scores[trait] += 14;
    });

    const newEmployee: Employee = {
      id: Date.now(),
      name: formData.name,
      role: formData.role,
      psycho: scores
    };

    onComplete(newEmployee);
  };

  if (step === 0) {
    return (
      <Card className="max-w-xl mx-auto p-12 bg-white aksana-glass border border-black dark:border-slate-800">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-black text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl">
            <BrainCircuit size={40} />
          </div>
          <h2 className="text-2xl font-black text-black dark:text-white tracking-tight mb-2">Asesmen Talenta Baru</h2>
          <p className="text-black dark:text-slate-400 font-medium text-sm italic">Jawab {PSYCHO_QUESTIONS.length} skenario situasi untuk memetakan kapasitas psikologis.</p>
        </div>

        <form onSubmit={handleStart} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300 ml-1">Nama Lengkap</label>
            <input
              required
              type="text"
              className="w-full p-4 bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-black/5 transition-all font-bold placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="Contoh: John Doe"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300 ml-1">Penempatan Seat</label>
            <select
              className="w-full p-4 bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-black/5 transition-all font-bold appearance-none"
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
              required
            >
              {Object.keys(seats).map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-5 mt-6 bg-black dark:bg-white text-white dark:text-black font-black rounded-[2rem] hover:opacity-90 transition-all shadow-xl flex justify-center items-center gap-2"
          >
            Mulai Tes Psikometrik <ArrowRight size={18} />
          </button>
        </form>
      </Card>
    );
  }
  const currentQ = PSYCHO_QUESTIONS[step - 1];
  const progress = ((step - 1) / PSYCHO_QUESTIONS.length) * 100;

  return (
    <div className="max-w-2xl mx-auto mt-6">
      <div className="mb-12">
        <div className="flex justify-between text-[10px] font-black text-slate-950 mb-4 uppercase tracking-[0.3em]">
          <span>Skenario {step} / {PSYCHO_QUESTIONS.length}</span>
          <span>{Math.round(progress)}% SELESAI</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-1">
          <motion.div 
            className="h-full bg-indigo-600 rounded-full" 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Card className="p-12 bg-white dark:bg-slate-900/90 border border-black dark:border-slate-800 aksana-glass">
            <h3 className="text-2xl font-black text-black dark:text-white mb-10 leading-snug tracking-tight">
              {currentQ.question}
            </h3>
            
            <div className="space-y-4">
              {currentQ.options.map((opt, idx) => {
                const isSelected = answers[currentQ.id] === opt.trait;
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(currentQ.id, opt.trait)}
                    className={`w-full text-left p-6 rounded-[2rem] border-2 transition-all duration-300 group relative overflow-hidden ${
                      isSelected 
                        ? 'bg-black border-black text-white shadow-2xl scale-[1.02]' 
                        : 'bg-white border-black hover:border-indigo-100 hover:bg-slate-100/50 text-black dark:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-6 relative z-10">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? 'border-white/40 bg-white/20' : 'border-black dark:border-slate-800 group-hover:border-indigo-300'}`}>
                        {isSelected && <div className="w-3 h-3 bg-white rounded-full border border-black aksana-glass" />}
                      </div>
                      <span className="text-base font-bold leading-relaxed">{opt.text}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

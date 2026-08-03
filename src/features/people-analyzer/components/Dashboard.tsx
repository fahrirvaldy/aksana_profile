
"use client";

import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Users, AlertCircle, CheckCircle, ChevronRight, Briefcase, Trash2, BrainCircuit, Target, Map } from 'lucide-react';
import { Card } from "./shared/Card";
import { ProgressBar } from "./shared/ProgressBar";
import { calculateAnomalies, findBestFit } from "../domain";
import { Employee, Seat } from '../types';

interface DashboardProps {
  employees: Employee[];
  seats: Record<string, Seat>;
  onDelete: (id: number) => void;
}

export function Dashboard({ employees, seats, onDelete }: DashboardProps) {
  const [selectedId, setSelectedId] = useState<number | null>(employees.length > 0 ? employees[0].id : null);

  const activeEmp = employees.find(emp => emp.id === selectedId);

  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Users size={80} className="text-black/10 dark:text-slate-800 mb-8" />
        <h2 className="text-3xl font-black text-black dark:text-white mb-4">Profil Organisasi Terbentuk</h2>
        <p className="text-black dark:text-slate-400 max-w-md mb-10 font-medium italic">Anda telah menetapkan {Object.keys(seats).length} divisi. Tambahkan karyawan melalui asesmen untuk melihat analisis kecocokan.</p>
        
        <div className="w-full max-w-xl text-left bg-white p-6 md:p-6 md:p-8 rounded-[3rem] border border-black dark:border-slate-800 aksana-glass shadow-sm">
          <h3 className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest mb-6 border-b border-black/10 dark:border-white/10 pb-4">Standar Divisi (AI Generated)</h3>
          <div className="space-y-4">
            {Object.entries(seats).map(([divName, data], i) => (
              <div key={i} className="flex justify-between items-center text-sm bg-white border border-black/10 dark:border-white/10 p-4 rounded-2xl">
                <span className="font-bold text-black dark:text-white">{divName}</span>
                <span className="text-[10px] font-black text-black dark:text-slate-400 font-mono">
                  Cr: {data.req.creativity} | Ld: {data.req.leadership} | Dt: {data.req.detail} | Ex: {data.req.execution}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!activeEmp) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Users size={80} className="text-black/10 dark:text-slate-800 mb-8" />
        <h2 className="text-3xl font-black text-black dark:text-white mb-4">Pilih Karyawan</h2>
        <p className="text-black dark:text-slate-400 max-w-md mb-10 font-medium italic">Pilih karyawan dari daftar untuk melihat analisis.</p>
      </div>
    )
  }

  const seatReq = seats[activeEmp.role]?.req || { creativity: 50, leadership: 50, detail: 50, execution: 50 };
  const empPsycho = activeEmp.psycho;

  const anomalies = calculateAnomalies(empPsycho, seatReq);
  const bestFit = findBestFit(activeEmp, seats);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:p-6 md:p-8">
      {/* Sidebar List */}
      <div className="lg:col-span-4">
        <Card className="p-6 h-full bg-white dark:bg-slate-900 border border-black dark:border-white/20 shadow-sm">
          <h3 className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest mb-6 px-2">Database Talenta</h3>
          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
            {employees.map(emp => (
              <motion.div
                key={emp.id}
                layout
                onClick={() => setSelectedId(emp.id)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer flex items-center justify-between ${activeEmp.id === emp.id ? 'bg-black border-black shadow-xl' : 'bg-white border-black dark:border-slate-800 hover:border-black'}`}
              >
                <div>
                  <p className={`font-bold transition-colors ${activeEmp.id === emp.id ? 'text-white' : 'text-black dark:text-slate-100'}`}>{emp.name}</p>
                  <p className={`text-[10px] font-black uppercase tracking-wider mt-1 ${activeEmp.id === emp.id ? 'text-white/60' : 'text-black/60 dark:text-slate-400'}`}>{emp.role}</p>
                </div>
                <div className="flex items-center gap-3">
                   <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(emp.id); }} 
                    className={`p-2 rounded-xl transition-all ${activeEmp.id === emp.id ? 'text-white/40 hover:text-white' : 'text-black/20 dark:text-slate-600 hover:text-red-500 hover:bg-red-50'}`}
                  >
                    <Trash2 size={16} />
                  </button>
                  <ChevronRight size={18} className={activeEmp.id === emp.id ?'text-white' : 'text-black/20 dark:text-slate-600'} />
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Main Analysis */}
      <div className="lg:col-span-8">
        <Card className="p-10 h-full bg-white dark:bg-slate-900 border border-black dark:border-white/20 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12 pb-10 border-b border-black shadow-sm">
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-black dark:text-white tracking-tight">{activeEmp.name}</h2>
              <div className="flex items-center gap-3">
                <div className="px-5 py-2 bg-black text-white rounded-2xl text-[10px] font-black tracking-widest flex items-center gap-2 shadow-sm">
                  <Briefcase size={14} /> {activeEmp.role.toUpperCase()}
                </div>
              </div>
            </div>
            
            <div className="text-left md:text-right">
              <span className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest block mb-3">Status Kecocokan</span>
              {anomalies.length > 0 ? (
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-amber-50 text-amber-700 border border-amber-500 rounded-[2rem] text-sm font-black shadow-sm">
                  <AlertCircle size={18} /> PERLU PENYESUAIAN
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 border border-emerald-500 rounded-[2rem] text-sm font-black shadow-sm">
                  <CheckCircle size={18} /> OPTIMAL (RIGHT SEAT)
                </div>
              )}
            </div>
          </div>

          <div className="space-y-12 mb-12">
            <div>
              <h4 className="text-[10px] font-black text-black dark:text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                <Target size={18} className="text-indigo-500" /> Profil Kapasitas vs Standar AI
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <ProgressBar label="Kreativitas & Inovasi" actual={empPsycho.creativity} required={seatReq.creativity} colorClass="bg-blue-500" />
                <ProgressBar label="Kepemimpinan" actual={empPsycho.leadership} required={seatReq.leadership} colorClass="bg-indigo-500" />
                <ProgressBar label="Ketelitian (Analisis)" actual={empPsycho.detail} required={seatReq.detail} colorClass="bg-amber-500" />
                <ProgressBar label="Eksekusi & Logika" actual={empPsycho.execution} required={seatReq.execution} colorClass="bg-emerald-500" />
              </div>
              <div className="flex justify-start items-center gap-6 md:p-6 md:p-8 mt-6 pt-6 border-t border-black shadow-sm">
                <div className="flex items-center gap-2 text-[10px] font-black text-black dark:text-white tracking-wider">
                  <div className="w-8 h-2 bg-indigo-500 rounded-full"></div> AKTUAL
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-black dark:text-white tracking-wider">
                  <div className="w-8 h-0 border-t-2 border-dashed border-black shadow-sm"></div> STANDAR
                </div>
              </div>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={activeEmp.id}
            className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-[3rem] p-10 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-40 -mt-40 blur-3xl"></div>
            
            <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
              <BrainCircuit size={20} /> Kesimpulan Sistem Analisis
            </h4>
            
            <div className="space-y-8 relative z-10">
              {anomalies.length > 0 ? (
                <>
                  <p className="text-lg text-indigo-100/90 leading-relaxed font-medium">
                    Terdeteksi gap kompetensi pada aspek <span className="text-white font-black underline decoration-indigo-500 underline-offset-4">{anomalies.map(a => a.trait).join(", ")}</span>. Karyawan mungkin mengalami stres kerja karena standar posisi yang melebihi kapasitas alaminya.
                  </p>
                  
                  {bestFit && (
                    <div className="p-6 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/10 flex items-start gap-6 shadow-inner shadow-sm">
                      <div className="p-4 bg-white text-indigo-900 rounded-[1.5rem] shrink-0 border border-black aksana-glass">
                        <Map size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-white mb-2 uppercase tracking-wider">Rekomendasi Rotasi</p>
                        <p className="text-sm text-indigo-200 leading-relaxed font-medium">
                          Berdasarkan pola psikometrik, {activeEmp.name} memiliki kecocokan tinggi dengan posisi <span className="text-indigo-400 font-black">{bestFit}</span>. Pertimbangkan re-assignment untuk hasil maksimal.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex gap-6 items-start">
                  <div className="p-4 bg-emerald-500/20 text-emerald-400 rounded-[1.5rem] border border-emerald-500/20 shrink-0 shadow-sm">
                    <CheckCircle size={28} />
                  </div>
                  <div>
                    <p className="text-lg font-black text-white mb-2">The Right Person in the Right Seat</p>
                    <p className="text-sm text-indigo-200 leading-relaxed font-medium">
                      Kapasitas alami {activeEmp.name} sangat selaras dengan kebutuhan strategis posisi <span className="text-indigo-400 font-black">{activeEmp.role}</span>. Karyawan ini berada di posisi yang tepat untuk berkembang.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </Card>
      </div>
    </div>
  );
}

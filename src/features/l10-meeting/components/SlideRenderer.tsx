"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { L10Data } from "../types";
import { AutoResizeTextarea } from "./AutoResizeTextarea";
import { generateDefaultTheme } from "../constants";
import { 
  Trophy, FileText, Plus, Trash2, CheckCircle2, RefreshCw, Layers, HelpCircle, FileSpreadsheet
} from "lucide-react";

interface SlideRendererProps {
  currentSlide: number;
  data: L10Data;
  updateData: (path: string, value: any) => void;
  attendees: string[];
  pullOffTrackData: () => void;
  handleIssueCheck: (index: number, checked: boolean) => void;
  activeThemeTab: number;
  setActiveThemeTab: (index: number) => void;
  averageRating: string;
}

export const SlideRenderer = ({ currentSlide, data, updateData, attendees, pullOffTrackData, handleIssueCheck, activeThemeTab, setActiveThemeTab, averageRating }: SlideRendererProps) => {
  const t = useTranslations("Tools.L10");

  // SLIDE 0: Welcome
  if (currentSlide === 0) return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4">
        <div className="mx-auto w-24 h-24 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-600 mb-6 border border-blue-500/20 shadow-sm"><Trophy size={48} /></div>
        <h1 className="text-6xl font-black tracking-tight text-black dark:text-white">LEVEL 10 MEETING</h1>
        <p className="text-3xl text-blue-500 font-bold uppercase tracking-widest">{data.config.companyName}</p>
      </motion.div>
      <div className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl p-8 max-w-md w-full shadow-sm">
        <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-2">Tanggal Rapat Efektif</p>
        <AutoResizeTextarea value={data.meetingDate} onChange={(e) => updateData('meetingDate', e.target.value)} className="text-2xl font-bold bg-transparent text-black dark:text-[#EEEEEE] text-center focus:ring-0 outline-none w-full p-0 border-none" />
      </div>
    </div>
  );

  // SLIDE 1: Attendance
  if (currentSlide === 1) return (
    <div className="space-y-6 flex-1 flex flex-col">
        <div><h2 className="text-4xl font-bold text-black dark:text-white mb-1">Daftar Hadir</h2><p className="text-black font-normal">Pastikan semua peserta terdata (5 Menit Total)</p></div>
        <div className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col shadow-sm flex-1 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pr-1 flex-1">
                {attendees.map((role, i) => (
                    <label key={i} className={`cursor-pointer transition-all rounded-xl p-4 flex items-center gap-3 border ${data.attendance[i] ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80'}`}>
                        <input type="checkbox" checked={data.attendance[i] || false} onChange={(e) => updateData(`attendance.${i}`, e.target.checked)} className="w-5 h-5 rounded-lg bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 text-blue-600 focus:ring-blue-500" />
                        <span className={`font-bold text-sm truncate ${data.attendance[i] ? 'text-blue-700 dark:text-blue-300' : 'text-black dark:text-[#EEEEEE]'}`}>{role}</span>
                    </label>
                ))}
            </div>
        </div>
    </div>
  );
  
  // SLIDE 2: Good News
  if (currentSlide === 2) return (
    <div className="space-y-6 flex-1 flex flex-col">
        <div><h2 className="text-4xl font-bold text-black dark:text-white mb-1">Good News</h2><p className="text-black font-normal">Bagikan kabar baik personal & profesional</p></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full h-auto items-start pb-6">
            {['owner', 'integrator', 'team'].map((pic) => (
                <div key={pic} className="w-full h-auto min-h-[12rem] flex flex-col p-5 rounded-xl bg-white text-black border border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus-within:ring-2 focus-within:ring-emerald-500 transition-all shadow-sm">
                    <label className="text-base font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 px-1 text-center mb-2">{pic}</label>
                    <AutoResizeTextarea value={data.goodNews[pic as keyof typeof data.goodNews]} onChange={(e) => updateData(`goodNews.${pic}`, e.target.value)} placeholder={`Kabar baik dari ${pic}...`} className="w-full h-auto bg-transparent text-black dark:text-[#EEEEEE] focus:ring-0 outline-none font-medium text-sm placeholder-slate-400 dark:placeholder-slate-500 mt-2 resize-none overflow-hidden" />
                </div>
            ))}
        </div>
    </div>
  );
  
  // DYNAMIC SLIDES: Scorecards
  const nonScorecardRoles = ['ceo', 'owner', 'integrator'];
  const scorecardDivisions = data.config.divisions.filter(
    division => !nonScorecardRoles.includes(division.toLowerCase())
  );
  const divisionIndex = currentSlide - 3;
  if (divisionIndex >= 0 && divisionIndex < scorecardDivisions.length) {
      const division = scorecardDivisions[divisionIndex];
      const divId = division.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const kpis = data.scorecards[divId] || [];
      return (
          <div className="space-y-6 flex-1 flex flex-col">
              <div><h2 className="text-4xl font-bold text-black dark:text-white mb-1">Scorecard: {division}</h2><p className="text-black font-normal">Review KPI Mingguan</p></div>
              <div className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col pb-6 shadow-sm flex-1">
                  <div className="flex-1">
                      <table className="w-full border-separate border-spacing-y-2 shadow-sm">
                          <thead>
                              <tr className="text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
                                  <th className="px-4 pb-2">KPI Metric</th><th className="px-4 pb-2">Target</th><th className="px-4 pb-2">Realisasi</th><th className="px-4 pb-2 text-center">Jenis</th><th className="px-4 pb-2 text-center">Status</th><th className="px-4 pb-2"></th>
                              </tr>
                          </thead>
                          <tbody>
                              {kpis.map((k, i) => (
                                  <tr key={i} className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl group overflow-hidden shadow-sm">
                                      <td className="p-3"><AutoResizeTextarea value={k.kpi} onChange={(e) => { const newKpis = [...kpis]; newKpis[i].kpi = e.target.value; updateData(`scorecards.${divId}`, newKpis); }} className="bg-transparent text-black dark:text-[#EEEEEE] focus:ring-0 w-full font-bold text-sm p-0 border-none" /></td>
                                      <td className="p-3"><AutoResizeTextarea value={k.target} onChange={(e) => { const newKpis = [...kpis]; newKpis[i].target = e.target.value; updateData(`scorecards.${divId}`, newKpis); }} className="bg-transparent text-black dark:text-[#EEEEEE] focus:ring-0 w-full font-medium text-sm p-0 border-none" /></td>
                                      <td className="p-3"><AutoResizeTextarea value={k.realisasi} onChange={(e) => { const newKpis = [...kpis]; newKpis[i].realisasi = e.target.value; updateData(`scorecards.${divId}`, newKpis); }} className="bg-transparent focus:ring-0 w-full font-mono text-lg font-bold text-black dark:text-white p-0 border-none" /></td>
                                      <td className="p-3 text-center"><button onClick={() => { const newKpis = [...kpis]; newKpis[i].jenis = k.jenis === 'output' ? 'outcome' : 'output'; updateData(`scorecards.${divId}`, newKpis); }} className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${k.jenis === 'outcome' ? 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20' : 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20'}`}>{k.jenis}</button></td>
                                      <td className="p-3 text-center"><button onClick={() => { const newKpis = [...kpis]; newKpis[i].status = k.status === 'on' ? 'off' : 'on'; updateData(`scorecards.${divId}`, newKpis); }} className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${k.status === 'on' ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20'}`}>{k.status === 'on' ? 'On Track' : 'Off Track'}</button></td>
                                      <td className="p-3 text-center"><button onClick={() => { const newKpis = kpis.filter((_, idx) => idx !== i); updateData(`scorecards.${divId}`, newKpis); }} className="p-1.5 opacity-0 group-hover:opacity-100 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"><Trash2 size={14}/></button></td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                      {kpis.length === 0 && <div className="text-center py-12 text-black font-medium">Belum ada metrik untuk divisi ini.</div>}
                  </div>
                  <button onClick={() => updateData(`scorecards.${divId}`, [...kpis, { kpi: "Metric Baru", target: "0", realisasi: "-", jenis: 'output', status: 'on' }])} className="mt-4 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:text-blue-500 hover:border-blue-500 transition-all font-bold text-sm bg-white dark:bg-[#1E1E1E] shadow-sm"><Plus size={16} /> Tambah Metrik KPI</button>
              </div>
          </div>
      );
  }

  // ... (lanjutan dari slide scorecard)
  const rockReviewSlideIndex = 3 + scorecardDivisions.length;
  if (currentSlide === rockReviewSlideIndex) {
      const rocks = data.config.rocks;
      return (
          <div className="space-y-6 flex-1 flex flex-col">
              <div><h2 className="text-4xl font-bold text-black dark:text-white mb-1">Rock Review</h2><p className="text-black font-normal">Prioritas Strategis 90 Hari</p></div>
              <div className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col pb-6 shadow-sm flex-1">
                  <div className="flex-1">
                      <table className="w-full border-separate border-spacing-y-2 shadow-sm">
                          <thead><tr className="text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300"><th className="px-4 pb-2 w-[20%]">PIC / Tim</th><th className="px-4 pb-2 w-[40%]">Target (Rock)</th><th className="px-4 pb-2 text-center">Status</th><th className="px-4 pb-2">Catatan Progres</th></tr></thead>
                          <tbody>
                              {rocks.map((rock, i) => (
                                  <tr key={i} className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden group shadow-sm">
                                      <td className="p-3"><AutoResizeTextarea value={data.rocksStatus[i]?.pic || ""} onChange={(e) => { const newStatus = [...data.rocksStatus]; if(!newStatus[i]) newStatus[i] = {pic: "", status: "on", notes: ""}; newStatus[i].pic = e.target.value; updateData('rocksStatus', newStatus); }} placeholder="Nama PIC" className="bg-transparent text-black dark:text-[#EEEEEE] focus:ring-0 w-full font-bold text-sm p-0 border-none placeholder-slate-400 dark:placeholder-slate-500" /></td>
                                      <td className="p-3 font-bold text-sm text-black dark:text-[#EEEEEE] whitespace-normal break-words leading-relaxed">{rock}</td>
                                      <td className="p-3 text-center"><button onClick={() => { const newStatus = [...data.rocksStatus]; if(!newStatus[i]) newStatus[i] = {pic: "", status: "on", notes: ""}; newStatus[i].status = newStatus[i].status === 'on' ? 'off' : 'on'; updateData('rocksStatus', newStatus); }} className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${data.rocksStatus[i]?.status === 'off' ? 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20' : 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20'}`}>{data.rocksStatus[i]?.status === 'off' ? 'Off Track' : 'On Track'}</button></td>
                                      <td className="p-3"><AutoResizeTextarea value={data.rocksStatus[i]?.notes || ""} onChange={(e) => { const newStatus = [...data.rocksStatus]; if(!newStatus[i]) newStatus[i] = {pic: "", status: "on", notes: ""}; newStatus[i].notes = e.target.value; updateData('rocksStatus', newStatus); }} placeholder="Update status..." className="bg-transparent text-black dark:text-[#EEEEEE] focus:ring-0 w-full italic text-sm p-0 border-none placeholder-slate-400 dark:placeholder-slate-500" /></td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      );
  }

  if (currentSlide === 4 + scorecardDivisions.length) return (
      <div className="space-y-6 flex-1 flex flex-col">
          <div><h2 className="text-4xl font-bold text-black dark:text-white mb-1">Headlines</h2><p className="text-black font-normal">Berita Penting Rapat</p></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4 flex-1">
              {['customer', 'internal'].map(type => (
                  <div key={type} className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col space-y-4 shadow-sm flex-1">
                      <h3 className={`text-xl font-bold flex items-center gap-2 ${type === 'customer' ? 'text-blue-500' : 'text-emerald-500'}`}><FileText size={20} /> {type === 'customer' ? 'Customer Headlines' : 'Internal Headlines'}</h3>
                      <div className="space-y-3 pr-1">
                          {(data.headlines[type as keyof typeof data.headlines] || []).map((h, i) => (
                              <div key={i} className="flex gap-3 items-center group bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 p-3 rounded-xl focus-within:ring-2 focus-within:ring-blue-500/20 shadow-sm">
                                  <span className="text-sm font-black text-slate-600 dark:text-slate-300 w-4">{i + 1}.</span>
                                  <AutoResizeTextarea value={h} onChange={(e) => { const newH = [...data.headlines[type as keyof typeof data.headlines]]; newH[i] = e.target.value; updateData(`headlines.${type}`, newH); }} placeholder="Masukkan berita..." className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm font-semibold text-black dark:text-[#EEEEEE] placeholder-slate-400 dark:placeholder-slate-500" />
                                  <button onClick={() => { const newH = data.headlines[type as keyof typeof data.headlines].filter((_, idx) => idx !== i); updateData(`headlines.${type}`, newH); }} className="opacity-0 group-hover:opacity-100 text-rose-500 p-1.5 hover:bg-rose-500/10 rounded-md transition-all"><Trash2 size={16}/></button>
                              </div>
                          ))}
                          <button onClick={() => updateData(`headlines.${type}`, [...data.headlines[type as keyof typeof data.headlines], ""])} className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:text-blue-500 transition-all font-bold text-xs bg-white dark:bg-[#1E1E1E] shadow-sm">+ Tambah Headline Baru</button>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  if (currentSlide === 5 + scorecardDivisions.length) return (
      <div className="space-y-6 flex-1 flex flex-col">
          <div><h2 className="text-4xl font-bold text-black dark:text-white mb-1">To-Do List</h2><p className="text-black font-normal">Review Minggu Lalu & Action Plan</p></div>
          <div className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col pb-6 shadow-sm flex-1">
              <div className="space-y-3 pr-1 flex-1">
                  {data.todoList.map((todo, i) => (
                      <div key={todo.id} className="flex items-center gap-4 p-4 bg-white dark:bg-[#1E1E1E] rounded-xl group border border-slate-200 dark:border-slate-800 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-sm">
                          <button onClick={() => { const newList = [...data.todoList]; newList[i].isDone = !todo.isDone; updateData('todoList', newList); }} className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${todo.isDone ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-[#1E1E1E] border-2 border-slate-200 dark:border-slate-800'}`}>{todo.isDone && <CheckCircle2 size={18} />}</button>
                          <div className="flex-1 min-w-0 space-y-0.5">
                              <AutoResizeTextarea value={todo.text} onChange={(e) => { const newList = [...data.todoList]; newList[i].text = e.target.value; updateData('todoList', newList); }} placeholder="Apa tugasnya?" className={`bg-transparent border-none focus:ring-0 w-full font-bold text-base p-0 text-black dark:text-[#EEEEEE] placeholder-slate-400 dark:placeholder-slate-500 ${todo.isDone ? 'line-through opacity-40' : ''}`} />
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5"><span className="text-[9px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Owner:</span><AutoResizeTextarea value={todo.owner} onChange={(e) => { const newList = [...data.todoList]; newList[i].owner = e.target.value; updateData('todoList', newList); }} className="bg-transparent border-none focus:ring-0 text-xs font-bold text-blue-500 p-0 h-auto w-40" /></div>
                                <div className="flex items-center gap-1.5"><span className="text-[9px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Deadline:</span><input type="date" value={todo.deadline || ''} onChange={(e) => { const newList = [...data.todoList]; newList[i].deadline = e.target.value; updateData('todoList', newList); }} className="bg-transparent border-none focus:ring-0 text-xs font-bold text-blue-500 p-0 h-auto w-40" /></div>
                              </div>
                          </div>
                          <button onClick={() => { const newList = data.todoList.filter(t => t.id !== todo.id); updateData('todoList', newList); }} className="opacity-0 group-hover:opacity-100 text-rose-500 p-2 hover:bg-rose-500/10 rounded-lg transition-all"><Trash2 size={18}/></button>
                      </div>
                  ))}
                  {data.todoList.length === 0 && <div className="text-center py-12 text-black font-medium">Belum ada tugas untuk minggu ini.</div>}
                  <button onClick={() => updateData('todoList', [...data.todoList, { id: Date.now(), text: "", owner: "PIC", isDone: false, deadline: "" }])} className="w-full p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:text-blue-500 hover:border-blue-500 transition-all font-bold text-sm bg-white dark:bg-[#1E1E1E] shadow-sm">+ Tambah To-Do List Baru</button>
              </div>
          </div>
      </div>
  );

    if (currentSlide === 6 + scorecardDivisions.length) {
    const [isVotingMode, setIsVotingMode] = useState(false);
    const selectedIssues = data.idsSession?.issues.filter(issue => issue.isSelectedForDiscussion) || [];

    if (isVotingMode) {
      return (
        <div className="space-y-6 flex-1 flex flex-col">
          <div><h2 className="text-4xl font-bold text-black dark:text-white mb-1">IDS: 1. Vote</h2><p className="text-black font-normal">Vote untuk masalah yang paling penting untuk diselesaikan</p></div>
          <div className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col shadow-sm flex-1">
            <div className="space-y-3 pr-1 flex-1">
              {selectedIssues.sort((a, b) => b.votes - a.votes).map((issue, i) => (
                <div key={issue.id} className={`flex items-center gap-3 p-4 rounded-2xl group border transition-all h-auto bg-white dark:bg-[#1E1E1E] border-slate-200 dark:border-slate-800 shadow-sm'}`}>
                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="inline-block px-2.5 py-1 rounded-lg text-[10px] bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 font-extrabold uppercase tracking-widest shadow-sm">{issue.source}</span>
                    <p className={`w-full min-h-[44px] break-words whitespace-pre-wrap bg-transparent border-none focus:ring-0 p-0 text-sm font-bold text-black dark:text-[#EEEEEE] transition-all`}>{issue.text}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-blue-500">{issue.votes || 0}</span>
                    <button onClick={() => {
                      const newIssues = [...data.idsSession.issues];
                      const targetIndex = newIssues.findIndex(item => item.id === issue.id);
                      if(targetIndex !== -1) {
                        const updatedIssue = { ...newIssues[targetIndex], votes: (newIssues[targetIndex].votes || 0) + 1 };
                        newIssues[targetIndex] = updatedIssue;
                        updateData('idsSession.issues', newIssues);
                      }
                    }} className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all active:scale-95"><Plus size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setIsVotingMode(false)} className="mt-4 w-full py-3.5 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-300 hover:text-blue-500 transition-all font-bold text-xs bg-white dark:bg-[#1E1E1E] shadow-sm">Kembali ke Daftar Isu</button>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6 flex-1 flex flex-col">
          <div className="flex justify-between items-center flex-shrink-0"><div><h2 className="text-4xl font-bold text-black dark:text-white mb-1">IDS: 1. Identify</h2><p className="text-black font-normal">Daftar Isu dan Masalah (60 Menit Total)</p></div><button onClick={pullOffTrackData} className="flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold transition-all active:scale-95 text-sm shadow-sm"><RefreshCw size={18} /> Tarik Data Off-Track</button></div>
          <div className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col shadow-sm flex-1">
              <div className="space-y-3 pr-1 flex-1">
                  {(data.idsSession?.issues || []).map((issue, i) => (
                      <div key={issue.id} className={`flex items-start gap-3 p-4 rounded-2xl group border transition-all h-auto ${issue.isSelectedForDiscussion ? 'bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/20' : (issue.isResolved ? 'bg-slate-50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 opacity-50' : 'bg-white dark:bg-[#1E1E1E] border-slate-200 dark:border-slate-800 shadow-sm')}`}>
                          <input type="checkbox" checked={issue.isResolved} onChange={(e) => handleIssueCheck(i, e.target.checked)} className="mt-1.5 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                          <div className="flex-1 min-w-0 space-y-1"><span className="inline-block px-2.5 py-1 rounded-lg text-[10px] bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 font-extrabold uppercase tracking-widest shadow-sm">{issue.source}</span><AutoResizeTextarea rows={2} value={issue.text} onChange={(e) => { const newI = [...(data.idsSession?.issues || [])]; newI[i].text = e.target.value; updateData('idsSession.issues', newI); }} className={`w-full min-h-[44px] break-words whitespace-pre-wrap bg-transparent border-none focus:ring-0 p-0 text-sm font-bold text-black dark:text-[#EEEEEE] transition-all ${issue.isResolved ? 'line-through font-medium' : ''}`} /></div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => { const newIssues = [...data.idsSession.issues]; newIssues[i].isSelectedForDiscussion = !newIssues[i].isSelectedForDiscussion; updateData('idsSession.issues', newIssues); }} className={`p-2 rounded-lg text-xs font-bold transition-all ${issue.isSelectedForDiscussion ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Pilih</button>
                            <button onClick={() => { const newI = (data.idsSession?.issues || []).filter((_, idx) => idx !== i); updateData('idsSession.issues', newI); }} className="opacity-0 group-hover:opacity-100 text-rose-500 p-1.5 hover:bg-rose-500/10 rounded-lg transition-all flex-shrink-0"><Trash2 size={16}/></button>
                          </div>
                      </div>
                  ))}
                  <button onClick={() => updateData('idsSession.issues', [...(data.idsSession?.issues || []), { id: `manual-${Date.now()}`, source: 'Manual', text: 'Masalah baru...', isResolved: false, isSelectedForDiscussion: false, votes: 0 }])} className="w-full py-3.5 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-300 hover:text-blue-500 transition-all font-bold text-xs bg-white dark:bg-[#1E1E1E] shadow-sm">+ Input Masalah Baru</button>
              </div>
              {selectedIssues.length > 0 && 
                <button onClick={() => setIsVotingMode(true)} className="mt-4 w-full py-4 bg-blue-500 text-white font-bold rounded-2xl hover:bg-blue-600 transition-all active:scale-95">Lanjutkan ke Voting ({selectedIssues.length} Isu)</button>
              }
          </div>
      </div>
  );
  }

  if (currentSlide === 7 + scorecardDivisions.length) {
      const currentTheme = data.idsSession.themes[activeThemeTab] || generateDefaultTheme(activeThemeTab + 1);
      return (
          <div className="space-y-4 flex-1 flex flex-col h-full w-full">
              <div className="flex justify-between items-center flex-shrink-0">
                  <div><h2 className="text-3xl font-black text-black dark:text-white mb-0.5">IDS: 2. Discuss Matrix</h2><p className="text-sm font-bold text-purple-600 dark:text-purple-400">Analisis Akar Masalah (Fishbone / Ishikawa 5M & Rencana 5W+1H)</p></div>
                  <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
                      {[0, 1, 2].map((idx) => (
                          <button key={idx} type="button" onClick={() => setActiveThemeTab(idx)} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeThemeTab === idx ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-md scale-105' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}><span className="flex items-center gap-1.5"><Layers size={14} /> Tema {idx + 1}</span></button>
                      ))}
                  </div>
              </div>
              <div className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col shadow-xl flex-1 overflow-y-auto max-h-[70vh] custom-scrollbar gap-5">
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80"><label className="text-xs font-black text-purple-500 uppercase tracking-widest block mb-1">Judul Topik / Masalah Tema {activeThemeTab + 1}</label><AutoResizeTextarea value={currentTheme.topic} onChange={(e) => updateData(`idsSession.themes.${activeThemeTab}.topic`, e.target.value)} placeholder="Tuliskan nama topik/isu besar yang sedang dibahas di sini..." className="bg-transparent font-black text-xl text-black dark:text-[#EEEEEE] outline-none focus:ring-0 border-none p-0" /></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#1E1E1E] focus-within:ring-2 focus-within:ring-slate-500/20 transition-all"><label className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest block mb-2">1. Kondisi Sekarang (Current State)</label><AutoResizeTextarea rows={2} value={currentTheme.currentCond} onChange={(e) => updateData(`idsSession.themes.${activeThemeTab}.currentCond`, e.target.value)} placeholder="Bagaimana realita buruk atau hambatan di lapangan saat ini?" className="bg-transparent text-base font-semibold text-black dark:text-[#EEEEEE] outline-none focus:ring-0 border-none p-0" /></div>
                      <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#1E1E1E] focus-within:ring-2 focus-within:ring-slate-500/20 transition-all"><label className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest block mb-2">2. Kondisi Diinginkan (Goal State)</label><AutoResizeTextarea rows={2} value={currentTheme.desiredCond} onChange={(e) => updateData(`idsSession.themes.${activeThemeTab}.desiredCond`, e.target.value)} placeholder="Target pencapaian ideal atau standar kuantitas yang ingin dituju?" className="bg-transparent text-base font-semibold text-black dark:text-[#EEEEEE] outline-none focus:ring-0 border-none p-0" /></div>
                  </div>
                  <div className="space-y-2"><label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1"><FileSpreadsheet size={16} className="text-purple-500"/> 3. Analisa Kondisi yang Ada (Kerangka Diagram Fishbone 5M)</label><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">{['man', 'method', 'machine', 'material', 'environment'].map((mField) => (<div key={mField} className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/20 focus-within:bg-white dark:focus-within:bg-[#1E1E1E] focus-within:ring-2 focus-within:ring-purple-500/30 transition-all"><label className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase block mb-1">{mField}</label><AutoResizeTextarea rows={2} value={currentTheme.analysis[mField as keyof typeof currentTheme.analysis] || ""} onChange={(e) => updateData(`idsSession.themes.${activeThemeTab}.analysis.${mField}`, e.target.value)} placeholder={`Faktor ${mField}...`} className="bg-transparent text-sm font-bold text-black dark:text-[#EEEEEE] outline-none focus:ring-0 border-none p-0 placeholder-slate-400" /></div>))}</div></div>
                  <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#1E1E1E] space-y-3"><label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1"><HelpCircle size={16}/> 4. Analisa Sebab Akibat (5-Why Chain Analysis)</label><div className="space-y-2">{(currentTheme.chain || Array(5).fill({effect: "", cause: ""})).map((item, cIdx) => (<div key={cIdx} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60"><span className="text-sm font-black text-slate-400 w-5">{cIdx + 1}.</span><AutoResizeTextarea value={item.effect} onChange={(e) => updateData(`idsSession.themes.${activeThemeTab}.chain.${cIdx}.effect`, e.target.value)} placeholder="Akibat / Gejala Masalah" className="flex-1 bg-transparent text-sm font-bold text-black dark:text-[#EEEEEE] outline-none focus:ring-0 border-none p-0" /><span className="text-sm font-black text-purple-500 uppercase px-2">karena</span><AutoResizeTextarea value={item.cause} onChange={(e) => updateData(`idsSession.themes.${activeThemeTab}.chain.${cIdx}.cause`, e.target.value)} placeholder="Sebab / Pemicu Masalah" className="flex-1 bg-transparent text-sm font-bold text-black dark:text-[#EEEEEE] outline-none focus:ring-0 border-none p-0" /></div>))}</div><div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3"><span className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase whitespace-nowrap">Akar Masalahnya Adalah:</span><AutoResizeTextarea value={currentTheme.rootCause} onChange={(e) => updateData(`idsSession.themes.${activeThemeTab}.rootCause`, e.target.value)} placeholder="Tulis kesimpulan akar masalah terdalam (Root Cause) hasil telaah 5-Why di atas..." className="flex-1 bg-transparent text-base font-black text-black dark:text-[#EEEEEE] border-b-2 border-dashed border-purple-400 focus:border-purple-500 outline-none focus:ring-0 p-0" /></div></div>
                  <div className="p-5 border border-purple-200 dark:border-purple-900 rounded-xl bg-purple-50/10 dark:bg-purple-950/10 space-y-3"><label className="text-sm font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider block">5. Rencana Perbaikan (Action Plan 5W+1H Matrix)</label><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[
                      { field: 'what', label: 'Apa yang akan dilakukan? (What)' }, { field: 'who', label: 'Siapa yang bertugas? (Who)' }, { field: 'when', label: 'Kapan akan selesai? (When)' }, { field: 'where', label: 'Dimana dikerjakan? (Where)' }, { field: 'why', label: 'Kenapa harus dilakukan? (Why)' }, { field: 'cost', label: 'Berapa biayanya? (Cost)' }
                  ].map((pItem) => (<div key={pItem.field} className="p-3 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl transition-all focus-within:ring-2 focus-within:ring-purple-500/30"><label className="text-xs font-black text-slate-500 dark:text-slate-400 block mb-1.5 uppercase tracking-wide">{pItem.label}</label><AutoResizeTextarea value={currentTheme.plan[pItem.field as keyof typeof currentTheme.plan] || ""} onChange={(e) => updateData(`idsSession.themes.${activeThemeTab}.plan.${pItem.field}`, e.target.value)} placeholder="Isian deskripsi..." className="bg-transparent text-sm font-black text-black dark:text-[#EEEEEE] outline-none focus:ring-0 border-none p-0" /></div>))}</div></div>
              </div>
          </div>
      );
  }

  if (currentSlide === 8 + scorecardDivisions.length) return (
      <div className="space-y-6 flex-1 flex flex-col h-auto w-full">
          <div><h2 className="text-4xl font-bold text-black dark:text-white mb-1">IDS Session</h2><p className="text-black font-normal">3. Solve / Resolutions</p></div>
          <div className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col shadow-sm h-auto min-h-[28rem] w-full">
              <h3 className="text-base font-black border-b border-slate-200 dark:border-slate-800 pb-4 text-purple-500 uppercase tracking-wider shadow-sm">Solusi Final & Eksekusi</h3>
              <AutoResizeTextarea rows={6} value={data.idsSession.solutions} onChange={(e) => updateData('idsSession.solutions', e.target.value)} placeholder="Apa keputusan akhir atau solusi konkritnya? Tulis di sini..." className="w-full h-auto bg-transparent text-black dark:text-[#EEEEEE] focus:ring-0 outline-none text-base font-bold leading-relaxed mt-5 resize-none overflow-hidden" />
          </div>
      </div>
  );

  if (currentSlide === 9 + scorecardDivisions.length) return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-10">
          <div className="space-y-2 flex-shrink-0"><h2 className="text-5xl font-black text-black dark:text-white">Conclude</h2><p className="text-black font-bold italic tracking-wide">"Seberapa efektif rapat ini bagi pencapaian visi?" (1 - 10)</p></div>
          <div className="space-y-1 flex-shrink-0 relative"><motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-[12rem] font-black leading-none tracking-tighter text-blue-600 drop-shadow-2xl">{averageRating}</motion.div><p className="text-sm font-bold text-black uppercase tracking-[0.4em]">Composite Quality Score</p></div>
          <div className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 p-10 rounded-xl max-w-full w-full flex flex-wrap justify-center gap-6 max-h-[250px] custom-scrollbar backdrop-blur-sm shadow-sm">
              {attendees.map((role, i) => data.attendance[i] ? (<div key={i} className="flex flex-col items-center gap-2.5 w-28"><label className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest truncate w-full text-center" title={role}>{role}</label><AutoResizeTextarea placeholder="0" value={data.ratings?.[i] !== undefined ? String(data.ratings[i]) : ""} onChange={(e) => { const val = e.target.value.replace(',', '.'); if (val === "" || /^[0-9]*\.?[0-9]*$/.test(val)) { const numVal = parseFloat(val); if (val === "" || (numVal >= 0 && numVal <= 10)) { updateData(`ratings.${i}`, val); } } }} disabled={!data.attendance?.[i]} className={`w-24 px-4 py-3 rounded-xl border font-bold text-center text-lg outline-none transition-all ${data.attendance?.[i] ? "bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:ring-4 focus:ring-blue-500/10" : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed"}`} /></div>) : null)}
              {Object.values(data.attendance).filter(Boolean).length === 0 && <p className="text-base font-bold text-black py-6">Pilih peserta yang hadir untuk memberikan rating.</p>}
          </div>
      </div>
  );
  return null;
};

"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { 
  Clock, Play, Pause, RotateCcw, Settings, ChevronLeft, ChevronRight, 
  Trash2, Plus, RefreshCw, CheckCircle2, Users, MessageSquare, 
  FileText, X, Loader2, Trophy, Download 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface L10Config { companyName: string; divisions: string[]; rocks: string[]; }
export interface KPI { kpi: string; target: string; realisasi: string; jenis: 'output' | 'outcome'; status: 'on' | 'off'; }
export interface TodoItem { id: number; text: string; owner: string; isDone: boolean; }
export interface L10Data {
  config: L10Config; meetingDate: string; attendance: Record<number, boolean>;
  goodNews: { owner: string; integrator: string; team: string };
  scorecards: Record<string, KPI[]>; rocksStatus: Array<{ pic: string; status: 'on' | 'off'; notes: string }>;
  headlines: { customer: string[]; internal: string[] }; todoList: TodoItem[];
  idsSession: { manualIssues: string[]; notes: string; solutions: string }; ratings: Record<number, number>;
}

const DEFAULT_DATA: L10Data = {
  config: { companyName: "Aksana Team", divisions: ["Marketing", "Operations", "Finance"], rocks: ["Target Sales Q2", "Riset Produk Baru"] },
  meetingDate: new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
  attendance: {}, goodNews: { owner: "", integrator: "", team: "" },
  scorecards: {}, rocksStatus: [], headlines: { customer: [""], internal: [""] },
  todoList: [], idsSession: { manualIssues: [], notes: "", solutions: "" }, ratings: {}
};

export default function L10Meeting({ onSave, isSyncing, initialData }: any) {
  const [data, setData] = useState<L10Data>(initialData || DEFAULT_DATA);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showSetup, setShowSetup] = useState(!initialData);
  const [timeLeft, setTimeLeft] = useState(5400);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => { if (onSave) onSave(data); }, 1500);
    return () => clearTimeout(timer);
  }, [data, onSave]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && endTime !== null) {
      interval = setInterval(() => {
        const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining <= 0) { setIsTimerRunning(false); setEndTime(null); }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, endTime]);

  const toggleTimer = () => {
    if (isTimerRunning) { setIsTimerRunning(false); setEndTime(null); } 
    else { setIsTimerRunning(true); setEndTime(Date.now() + timeLeft * 1000); }
  };

  const resetTimer = () => { setIsTimerRunning(false); setEndTime(null); setTimeLeft(5400); };
  const formatTime = (sec: number) => `${Math.floor(sec / 60).toString().padStart(2, '0')}:${(sec % 60).toString().padStart(2, '0')}`;

  const totalSlides = 7 + data.config.divisions.length;
  const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, totalSlides - 1));
  const prevSlide = () => setCurrentSlide(prev => Math.max(prev - 1, 0));

  const updateData = (path: string, value: any) => {
    setData(prev => {
      const newData = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) current = current[keys[i]];
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const getAttendees = () => ["Owner", "Integrator", ...data.config.divisions, "Moderator"];

  const averageRating = useMemo(() => {
    const ratings = Object.entries(data.ratings).filter(([idx]) => data.attendance[parseInt(idx)]).map(([, val]) => val);
    if (ratings.length === 0) return "0.0";
    return (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
  }, [data.ratings, data.attendance]);

  const pullOffTrackData = () => {
    const issues: string[] = [];
    Object.entries(data.scorecards).forEach(([div, kpis]) => { kpis.forEach(k => { if (k.status === 'off') issues.push(`[${div}] ${k.kpi}`); }); });
    data.rocksStatus.forEach((r, i) => { if (r.status === 'off') issues.push(`[Rock] ${data.config.rocks[i]}`); });
    updateData('idsSession.manualIssues', [...data.idsSession.manualIssues, ...issues]);
  };

  const handleExportPdf = async () => {
    // 1. Set exporting menjadi true terlebih dahulu agar React merender kontainer PDF tersembunyi
    setIsExporting(true);
    
    // 2. Beri waktu bagi React untuk selesai melakukan siklus re-render DOM
    await new Promise(resolve => setTimeout(resolve, 800));

    // 3. Sekarang cek apakah kontainer sudah berhasil dimuat di DOM
    if (!pdfContainerRef.current) {
      console.error("Kontainer PDF tidak ditemukan setelah re-render.");
      setIsExporting(false);
      return;
    }

    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1200, 800] });
      const slides = document.querySelectorAll('.export-slide');

      for (let i = 0; i < slides.length; i++) {
        const canvas = await html2canvas(slides[i] as HTMLElement, {
          scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff',
          onclone: (doc) => {
            const all = doc.querySelectorAll('*');
            all.forEach(el => {
              el.classList.remove('dark');
              if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                (el as HTMLElement).style.color = '#000000';
              }
            });
          }
        });
        const imgData = canvas.toDataURL('image/png');
        if (i > 0) pdf.addPage([1200, 800], 'landscape');
        pdf.addImage(imgData, 'PNG', 0, 0, 1200, 800);
      }
      pdf.save(`L10-Meeting-${data.config.companyName}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const renderSlideContent = (index: number) => {
    const attendees = getAttendees();

    if (index === 0) return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-8 p-12">
        <div className="mx-auto w-24 h-24 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-600 mb-6"><Trophy size={48} /></div>
        <h1 className="text-6xl font-black tracking-tight text-slate-900 dark:text-white">LEVEL 10 MEETING</h1>
        <p className="text-3xl text-blue-500 font-bold uppercase tracking-widest">{data.config.companyName}</p>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 w-full max-w-xl">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Tanggal Rapat Efektif</p>
          <input type="text" value={data.meetingDate} onChange={(e) => updateData('meetingDate', e.target.value)} className="text-3xl font-bold bg-transparent border-none text-center focus:ring-0 outline-none w-full text-slate-900 dark:text-white" />
        </div>
      </div>
    );

    if (index === 1) return (
      <div className="space-y-8 h-full flex flex-col p-12">
        <div><h2 className="text-4xl font-bold mb-2 text-slate-900 dark:text-white">Segmen Awal</h2><p className="text-slate-500 font-medium">Kehadiran & Kabar Baik</p></div>
        <div className="grid grid-cols-2 gap-8 flex-1">
          <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white"><Users className="text-blue-500" /> Daftar Hadir</h3>
            <div className="grid grid-cols-2 gap-4">
              {attendees.map((role, i) => (
                <label key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 cursor-pointer">
                  <input type="checkbox" checked={data.attendance[i] || false} onChange={(e) => updateData(`attendance.${i}`, e.target.checked)} className="w-5 h-5 text-blue-600 rounded" />
                  <span className="font-bold text-slate-700 dark:text-slate-200">{role}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white"><MessageSquare className="text-emerald-500" /> Kabar Baik</h3>
            {['owner', 'integrator', 'team'].map((pic) => (
              <div key={pic}>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">{pic}</label>
                <textarea value={data.goodNews[pic as keyof typeof data.goodNews]} onChange={(e) => updateData(`goodNews.${pic}`, e.target.value)} className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-none outline-none font-medium text-slate-900 dark:text-white mt-1 resize-none" rows={2} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    const divIndex = index - 2;
    if (divIndex >= 0 && divIndex < data.config.divisions.length) {
      const division = data.config.divisions[divIndex];
      const kpis = data.scorecards[division] || [{ kpi: "KPI Baru", target: "-", realisasi: "-", jenis: 'output', status: 'on' }];
      return (
        <div className="space-y-8 h-full flex flex-col p-12">
          <div><h2 className="text-4xl font-bold mb-2 text-slate-900 dark:text-white">Scorecard: {division}</h2><p className="text-slate-500 font-medium">Review KPI Mingguan</p></div>
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 flex-1 overflow-auto">
            <table className="w-full border-separate border-spacing-y-2">
              <thead><tr className="text-left text-xs font-black uppercase text-slate-400"><th className="p-2">KPI</th><th className="p-2">Target</th><th className="p-2">Actual</th><th className="p-2 text-center">Status</th><th></th></tr></thead>
              <tbody>
                {kpis.map((k, i) => (
                  <tr key={i} className="bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <td className="p-3"><input type="text" value={k.kpi} onChange={(e) => { const n = [...kpis]; n[i].kpi = e.target.value; updateData(`scorecards.${division}`, n); }} className="bg-transparent border-none outline-none font-bold text-slate-900 dark:text-white w-full" /></td>
                    <td className="p-3"><input type="text" value={k.target} onChange={(e) => { const n = [...kpis]; n[i].target = e.target.value; updateData(`scorecards.${division}`, n); }} className="bg-transparent border-none outline-none text-slate-900 dark:text-white w-full" /></td>
                    <td className="p-3"><input type="text" value={k.realisasi} onChange={(e) => { const n = [...kpis]; n[i].realisasi = e.target.value; updateData(`scorecards.${division}`, n); }} className="bg-transparent border-none outline-none font-mono text-blue-600 w-full" /></td>
                    <td className="p-3 text-center"><button onClick={() => { const n = [...kpis]; n[i].status = k.status === 'on' ? 'off' : 'on'; updateData(`scorecards.${division}`, n); }} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${k.status === 'on' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>{k.status === 'on' ? 'On Track' : 'Off Track'}</button></td>
                    <td className="p-3"><button onClick={() => { const n = kpis.filter((_, idx) => idx !== i); updateData(`scorecards.${division}`, n); }} className="text-rose-500"><Trash2 size={16}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={() => updateData(`scorecards.${division}`, [...kpis, { kpi: "Baru", target: "-", realisasi: "-", jenis: 'output', status: 'on' }])} className="mt-4 text-sm font-bold text-blue-500">+ Tambah KPI</button>
          </div>
        </div>
      );
    }

    if (index === 2 + data.config.divisions.length) {
      const rocks = data.config.rocks;
      const rockStatus = data.rocksStatus.length === rocks.length ? data.rocksStatus : rocks.map(() => ({ pic: "", status: 'on', notes: "" }));
      if (data.rocksStatus.length !== rocks.length) updateData('rocksStatus', rockStatus);
      return (
        <div className="space-y-8 h-full flex flex-col p-12">
          <div><h2 className="text-4xl font-bold mb-2 text-slate-900 dark:text-white">Rock Review</h2><p className="text-slate-500 font-medium">Prioritas Strategis 90 Hari</p></div>
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 flex-1">
            <table className="w-full border-separate border-spacing-y-2">
              <thead><tr className="text-left text-xs font-black uppercase text-slate-400"><th className="p-2 w-1/4">PIC</th><th className="p-2 w-1/3">Target (Rock)</th><th className="p-2 text-center">Status</th><th className="p-2">Catatan</th></tr></thead>
              <tbody>
                {rocks.map((rock, i) => (
                  <tr key={i} className="bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <td className="p-3"><input type="text" value={rockStatus[i]?.pic} onChange={(e) => { const n = [...rockStatus]; n[i].pic = e.target.value; updateData('rocksStatus', n); }} placeholder="PIC" className="bg-transparent border-none outline-none font-bold text-slate-900 dark:text-white w-full" /></td>
                    <td className="p-3 font-bold text-slate-600 dark:text-slate-300">{rock}</td>
                    <td className="p-3 text-center"><button onClick={() => { const n = [...rockStatus]; n[i].status = rockStatus[i].status === 'on' ? 'off' : 'on'; updateData('rocksStatus', n); }} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${rockStatus[i]?.status === 'on' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>{rockStatus[i]?.status === 'on' ? 'On Track' : 'Off Track'}</button></td>
                    <td className="p-3"><input type="text" value={rockStatus[i]?.notes} onChange={(e) => { const n = [...rockStatus]; n[i].notes = e.target.value; updateData('rocksStatus', n); }} placeholder="Catatan..." className="bg-transparent border-none outline-none text-sm w-full text-slate-900 dark:text-white" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (index === 3 + data.config.divisions.length) return (
      <div className="space-y-8 h-full flex flex-col p-12">
        <div><h2 className="text-4xl font-bold mb-2 text-slate-900 dark:text-white">Headlines</h2><p className="text-slate-500 font-medium">Berita Penting</p></div>
        <div className="grid grid-cols-2 gap-8 flex-1">
          {['customer', 'internal'].map(type => (
            <div key={type} className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col space-y-4">
              <h3 className={`text-xl font-bold flex items-center gap-2 ${type === 'customer' ? 'text-blue-500' : 'text-emerald-500'}`}><FileText /> {type === 'customer' ? 'Customer Headlines' : 'Internal Headlines'}</h3>
              <div className="flex-1 space-y-3">
                {(data.headlines[type as keyof typeof data.headlines] || []).map((h, i) => (
                  <div key={i} className="flex gap-4 group items-center">
                    <span className="text-lg font-black text-slate-300">{i + 1}.</span>
                    <input type="text" value={h} onChange={(e) => { const n = [...data.headlines[type as keyof typeof data.headlines]]; n[i] = e.target.value; updateData(`headlines.${type}`, n); }} placeholder="Berita..." className="flex-1 bg-transparent border-none outline-none text-lg text-slate-900 dark:text-white" />
                    <button onClick={() => { const n = data.headlines[type as keyof typeof data.headlines].filter((_, idx) => idx !== i); updateData(`headlines.${type}`, n); }} className="text-rose-500"><Trash2 size={16}/></button>
                  </div>
                ))}
                <button onClick={() => updateData(`headlines.${type}`, [...data.headlines[type as keyof typeof data.headlines], ""])} className="text-sm font-bold text-blue-500">+ Tambah Headline</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    if (index === 4 + data.config.divisions.length) return (
      <div className="space-y-8 h-full flex flex-col p-12">
        <div><h2 className="text-4xl font-bold mb-2 text-slate-900 dark:text-white">To-Do List</h2><p className="text-slate-500 font-medium">Action Plan</p></div>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 flex-1 overflow-y-auto">
          <div className="space-y-4">
            {data.todoList.map((todo, i) => (
              <div key={todo.id} className="flex items-center gap-6 p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl group">
                <button onClick={() => { const n = [...data.todoList]; n[i].isDone = !todo.isDone; updateData('todoList', n); }} className={`w-8 h-8 rounded-full flex items-center justify-center ${todo.isDone ? 'bg-emerald-500 text-white' : 'border-2 border-slate-300'}`}>{todo.isDone && <CheckCircle2 size={20} />}</button>
                <div className="flex-1 space-y-1">
                  <input type="text" value={todo.text} onChange={(e) => { const n = [...data.todoList]; n[i].text = e.target.value; updateData('todoList', n); }} className={`bg-transparent border-none outline-none w-full font-bold text-lg text-slate-900 dark:text-white ${todo.isDone ? 'line-through opacity-50' : ''}`} />
                  <div className="flex items-center gap-2"><span className="text-[10px] font-black text-slate-400">OWNER:</span><input type="text" value={todo.owner} onChange={(e) => { const n = [...data.todoList]; n[i].owner = e.target.value; updateData('todoList', n); }} className="bg-transparent border-none outline-none text-sm font-bold text-blue-500" /></div>
                </div>
                <button onClick={() => updateData('todoList', data.todoList.filter(t => t.id !== todo.id))} className="text-rose-500"><Trash2 size={20}/></button>
              </div>
            ))}
            <button onClick={() => updateData('todoList', [...data.todoList, { id: Date.now(), text: "Tugas Baru", owner: "PIC", isDone: false }])} className="w-full p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl text-slate-400 font-bold hover:text-blue-500">+ Tambah To-Do</button>
          </div>
        </div>
      </div>
    );

    if (index === 5 + data.config.divisions.length) return (
      <div className="space-y-8 h-full flex flex-col p-12">
        <div className="flex justify-between items-center">
          <div><h2 className="text-4xl font-bold mb-2 text-slate-900 dark:text-white">IDS Session</h2><p className="text-slate-500 font-medium">Identify, Discuss, Solve</p></div>
          <button onClick={pullOffTrackData} className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-2xl font-bold"><RefreshCw size={18} /> Tarik Data Off-Track</button>
        </div>
        <div className="grid grid-cols-3 gap-6 flex-1">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col space-y-4">
            <h3 className="text-lg font-bold text-blue-500">1. Identify (Issues)</h3>
            <div className="flex-1 space-y-2 overflow-y-auto">
              {data.idsSession.manualIssues.map((issue, i) => (
                <div key={i} className="flex gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl items-center"><div className="w-2 h-2 rounded-full bg-blue-500" /><input type="text" value={issue} onChange={(e) => { const n = [...data.idsSession.manualIssues]; n[i] = e.target.value; updateData('idsSession.manualIssues', n); }} className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-900 dark:text-white" /><button onClick={() => updateData('idsSession.manualIssues', data.idsSession.manualIssues.filter((_, idx) => idx !== i))} className="text-rose-500"><Trash2 size={14}/></button></div>
              ))}
              <button onClick={() => updateData('idsSession.manualIssues', [...data.idsSession.manualIssues, "Issue baru..."])} className="text-xs font-bold text-slate-400">+ Manual Issue</button>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col space-y-4">
            <h3 className="text-lg font-bold text-emerald-500">2. Discuss (Notes)</h3>
            <textarea value={data.idsSession.notes} onChange={(e) => updateData('idsSession.notes', e.target.value)} className="flex-1 bg-transparent border-none outline-none text-base font-medium resize-none text-slate-900 dark:text-white" placeholder="Catat diskusi..." />
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col space-y-4">
            <h3 className="text-lg font-bold text-purple-500">3. Solve (Action Items)</h3>
            <textarea value={data.idsSession.solutions} onChange={(e) => updateData('idsSession.solutions', e.target.value)} className="flex-1 bg-transparent border-none outline-none text-base font-bold resize-none text-purple-700 dark:text-purple-400" placeholder="- Solusi..." />
          </div>
        </div>
      </div>
    );

    if (index === 6 + data.config.divisions.length) return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-12 p-12">
        <div><h2 className="text-4xl font-bold text-slate-900 dark:text-white">Conclude</h2><p className="text-slate-500 font-medium italic">&quot;Seberapa efektif rapat hari ini?&quot;</p></div>
        <div className="text-[10rem] font-black leading-none tracking-tighter text-blue-600">{averageRating}</div>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] w-full flex flex-wrap justify-center gap-6 shadow-sm border border-slate-100 dark:border-slate-700">
          {attendees.map((role, i) => data.attendance[i] && (
            <div key={i} className="flex flex-col items-center gap-2 w-28">
              <label className="text-[10px] font-black text-slate-400 uppercase truncate w-full text-center">{role}</label>
              <input type="number" min="1" max="10" value={data.ratings[i] || ""} onChange={(e) => updateData(`ratings.${i}`, parseFloat(e.target.value))} className="w-full h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 text-center text-2xl font-black outline-none text-slate-900 dark:text-white" />
            </div>
          ))}
        </div>
      </div>
    );

    return null;
  };

  return (
    <div className="relative min-h-[800px] h-[85vh] w-full flex flex-col font-[family-name:var(--font-plus-jakarta)] bg-slate-50 dark:bg-slate-950">
      
      {/* Header Panel */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-6 z-40">
        <div className="flex items-center gap-4">
          <div className={`bg-white dark:bg-slate-800 px-6 py-3 rounded-full flex items-center gap-4 shadow-sm border border-slate-100 dark:border-slate-700 ${timeLeft < 300 ? 'text-rose-600' : 'text-blue-600'}`}>
            <Clock size={20} />
            <span className="text-2xl font-black font-mono">{formatTime(timeLeft)}</span>
            <div className="flex gap-3 border-l border-slate-200 dark:border-slate-700 pl-4">
              <button onClick={toggleTimer} className="hover:scale-110">{isTimerRunning ? <Pause size={18} /> : <Play size={18} />}</button>
              <button onClick={resetTimer} className="hover:scale-110 text-slate-400"><RotateCcw size={18} /></button>
            </div>
          </div>
          {isSyncing && <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-full text-blue-600 text-xs font-bold"><Loader2 size={12} className="animate-spin" /> Sync</div>}
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportPdf} disabled={isExporting} className="px-5 py-3 rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 flex items-center gap-2 font-bold text-sm">
            {isExporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />} Export PDF
          </button>
          <button onClick={() => setShowSetup(true)} className="p-3 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-blue-500"><Settings size={20} /></button>
        </div>
      </div>

      {/* Main Slide Area */}
      <div className="flex-1 px-8 pt-24 pb-8 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={currentSlide} initial={{ opacity: 0, x: 50, scale: 0.98 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: -50, scale: 0.98 }} transition={{ type: "spring", stiffness: 100, damping: 15 }} className="h-full w-full">
            {renderSlideContent(currentSlide)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="absolute bottom-6 right-8 flex gap-3 z-40">
        <button onClick={prevSlide} disabled={currentSlide === 0} className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-blue-600 disabled:opacity-30 shadow-sm"><ChevronLeft size={28} /></button>
        <button onClick={nextSlide} disabled={currentSlide === totalSlides - 1} className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-blue-600 disabled:opacity-30 shadow-sm"><ChevronRight size={28} /></button>
      </div>

      {/* --- HIDDEN PDF TEMPLATE (RENDER ALL SLIDES TO DOM) --- */}
      {isExporting && (
        <div ref={pdfContainerRef} className="absolute left-[-9999px] top-0 flex flex-col bg-white">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <div key={i} className="export-slide w-[1200px] h-[800px] bg-white text-black p-0 m-0">
              <div className="w-full h-full bg-white text-black scale-95 origin-top">
                {renderSlideContent(i)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Setup Modal */}
      <AnimatePresence>
        {showSetup && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white dark:bg-slate-900 max-w-xl w-full p-10 rounded-[2.5rem] shadow-2xl relative">
              <button onClick={() => setShowSetup(false)} className="absolute top-6 right-6 text-slate-400 hover:text-rose-500"><X size={28} /></button>
              <div className="space-y-8">
                <div className="text-center"><h2 className="text-2xl font-black mb-1 text-slate-900 dark:text-white">Konfigurasi Rapat L10</h2></div>
                <div className="space-y-5">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Nama Tim</label>
                    <input type="text" value={data.config.companyName} onChange={(e) => updateData('config.companyName', e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Divisi (Pisahkan dengan koma)</label>
                    <textarea value={data.config.divisions.join(', ')} onChange={(e) => updateData('config.divisions', e.target.value.split(',').map(d => d.trim()).filter(d => d))} rows={2} className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-medium text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Target Strategis (Rocks)</label>
                    <div className="space-y-2 max-h-[150px] overflow-auto">
                      {data.config.rocks.map((rock, i) => (
                        <div key={i} className="flex gap-2">
                          <input type="text" value={rock} onChange={(e) => { const n = [...data.config.rocks]; n[i] = e.target.value; updateData('config.rocks', n); }} className="flex-1 px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white" />
                          <button onClick={() => updateData('config.rocks', data.config.rocks.filter((_, idx) => idx !== i))} className="text-rose-500 px-2"><Trash2 size={16}/></button>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => updateData('config.rocks', [...data.config.rocks, ""])} className="w-full mt-2 py-2 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 text-xs font-bold">+ Tambah Rock</button>
                  </div>
                </div>
                <button onClick={() => setShowSetup(false)} className="w-full py-4 rounded-[1.5rem] bg-blue-600 text-white font-bold text-lg hover:bg-blue-700">Mulai Rapat</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

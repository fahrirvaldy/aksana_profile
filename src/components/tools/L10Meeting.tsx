"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Plus, 
  RefreshCw, 
  CheckCircle2,
  Users,
  MessageSquare,
  Target,
  FileText,
  ListChecks,
  AlertCircle,
  X,
  Loader2,
  Trophy
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Interfaces ---
export interface L10Config {
  companyName: string;
  divisions: string[];
  rocks: string[];
}

export interface KPI {
  kpi: string;
  target: string;
  realisasi: string;
  jenis: 'output' | 'outcome';
  status: 'on' | 'off';
}

export interface TodoItem {
  id: number;
  text: string;
  owner: string;
  isDone: boolean;
}

export interface L10Data {
  config: L10Config;
  meetingDate: string;
  attendance: Record<number, boolean>;
  goodNews: {
    owner: string;
    integrator: string;
    team: string;
  };
  scorecards: Record<string, KPI[]>;
  rocksStatus: Array<{ pic: string; status: 'on' | 'off'; notes: string }>;
  headlines: {
    customer: string[];
    internal: string[];
  };
  todoList: TodoItem[];
  idsSession: {
    manualIssues: string[];
    notes: string;
    solutions: string;
  };
  ratings: Record<number, number>;
}

interface L10MeetingProps {
  user?: { id: string; [key: string]: unknown };
  onSave?: (data: L10Data) => void;
  isSyncing?: boolean;
  initialData?: L10Data;
}

// --- Default Data ---
const DEFAULT_DATA: L10Data = {
  config: {
    companyName: "Aksana Team",
    divisions: ["Marketing", "Operations", "Finance"],
    rocks: ["Target Sales Q2", "Riset Produk Baru"]
  },
  meetingDate: new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
  attendance: {},
  goodNews: { owner: "", integrator: "", team: "" },
  scorecards: {},
  rocksStatus: [],
  headlines: { customer: [""], internal: [""] },
  todoList: [],
  idsSession: { manualIssues: [], notes: "", solutions: "" },
  ratings: {}
};

export default function L10Meeting({ onSave, isSyncing, initialData }: L10MeetingProps) {
  // --- States ---
  const [data, setData] = useState<L10Data>(initialData || DEFAULT_DATA);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showSetup, setShowSetup] = useState(!initialData);
  const [timeLeft, setTimeLeft] = useState(5400); // 90 mins
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // --- Syncing (Render-phase) ---
  const [prevInitialData, setPrevInitialData] = useState<L10Data | undefined>(initialData);
  if (initialData && initialData !== prevInitialData) {
    setPrevInitialData(initialData);
    setData(initialData);
  }

  // --- Auto-save ---
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSave) onSave(data);
    }, 1500);
    return () => clearTimeout(timer);
  }, [data, onSave]);

  // --- Timer Logic ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- Navigation ---
  const totalSlides = 8 + (data.config.divisions.length);
  const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, totalSlides - 1));
  const prevSlide = () => setCurrentSlide(prev => Math.max(prev - 1, 0));

  // --- Helpers ---
  const updateData = (path: string, value: any) => {
    setData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current: any = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const getAttendees = () => {
    const roles = ["Owner", "Integrator", ...data.config.divisions, "Moderator"];
    return roles;
  };

  const averageRating = useMemo(() => {
    const ratings = Object.entries(data.ratings)
      .filter(([idx]) => data.attendance[parseInt(idx)])
      .map(([, val]) => val);
    if (ratings.length === 0) return 0;
    return (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
  }, [data.ratings, data.attendance]);

  const pullOffTrackData = () => {
    const issues: string[] = [];
    // From Scorecards
    Object.entries(data.scorecards).forEach(([div, kpis]) => {
      kpis.forEach(k => {
        if (k.status === 'off') issues.push(`[${div}] ${k.kpi}`);
      });
    });
    // From Rocks
    data.rocksStatus.forEach((r, i) => {
      if (r.status === 'off') issues.push(`[Rock] ${data.config.rocks[i]}`);
    });
    
    updateData('idsSession.manualIssues', [...data.idsSession.manualIssues, ...issues]);
  };

  // --- Slide Components ---
  const renderSlide = () => {
    const attendees = getAttendees();

    if (currentSlide === 0) return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4">
          <div className="mx-auto w-24 h-24 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-600 mb-6">
            <Trophy size={48} />
          </div>
          <h1 className="text-6xl font-black tracking-tight">LEVEL 10 MEETING</h1>
          <p className="text-3xl text-blue-500 font-bold uppercase tracking-widest">{data.config.companyName}</p>
        </motion.div>
        
        <div className="aksana-glass p-8 rounded-[2.5rem] border-white/40 shadow-xl">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Tanggal Rapat Efektif</p>
          <input 
            type="text" 
            value={data.meetingDate}
            onChange={(e) => updateData('meetingDate', e.target.value)}
            className="text-3xl font-bold bg-transparent border-none text-center focus:ring-0 outline-none w-full"
          />
        </div>
      </div>
    );

    if (currentSlide === 1) return (
      <div className="space-y-8 h-full">
        <div>
          <h2 className="text-4xl font-bold mb-2">Segmen Awal</h2>
          <p className="text-slate-500 font-medium">Kehadiran & Kabar Baik (5 Menit)</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100%-100px)]">
          <div className="aksana-glass p-10 rounded-[2.5rem] space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2"><Users className="text-blue-500" /> Daftar Hadir</h3>
            <div className="grid grid-cols-2 gap-4">
              {attendees.map((role, i) => (
                <label key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-white/20 cursor-pointer hover:bg-white transition-all">
                  <input 
                    type="checkbox" 
                    checked={data.attendance[i] || false}
                    onChange={(e) => updateData(`attendance.${i}`, e.target.checked)}
                    className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-bold text-slate-700 dark:text-slate-200">{role}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="aksana-glass p-10 rounded-[2.5rem] space-y-8">
            <h3 className="text-xl font-bold flex items-center gap-2"><MessageSquare className="text-emerald-500" /> Good News (Kabar Syukur)</h3>
            <div className="space-y-6">
              {['owner', 'integrator', 'team'].map((pic) => (
                <div key={pic} className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">{pic}</label>
                  <textarea 
                    value={data.goodNews[pic as keyof typeof data.goodNews]}
                    onChange={(e) => updateData(`goodNews.${pic}`, e.target.value)}
                    placeholder={`Kabar baik dari ${pic}...`}
                    className="w-full p-4 rounded-2xl bg-white/40 dark:bg-black/20 border-none focus:ring-2 focus:ring-emerald-500 outline-none min-h-[100px] resize-none font-medium"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );

    // Scorecards (Dynamic)
    const divisionIndex = currentSlide - 2;
    if (divisionIndex >= 0 && divisionIndex < data.config.divisions.length) {
      const division = data.config.divisions[divisionIndex];
      const kpis = data.scorecards[division] || [
        { kpi: "KPI 1", target: "Target", realisasi: "-", jenis: 'output', status: 'on' }
      ];

      return (
        <div className="space-y-8 h-full">
          <div>
            <h2 className="text-4xl font-bold mb-2">Scorecard: {division}</h2>
            <p className="text-slate-500 font-medium">Review KPI & Output Mingguan</p>
          </div>
          <div className="aksana-glass p-10 rounded-[2.5rem] flex flex-col h-[calc(100%-120px)] overflow-hidden">
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <table className="w-full border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <th className="px-4 pb-4">KPI Metric</th>
                    <th className="px-4 pb-4">Target</th>
                    <th className="px-4 pb-4">Realisasi</th>
                    <th className="px-4 pb-4 text-center">Jenis</th>
                    <th className="px-4 pb-4 text-center">Status</th>
                    <th className="px-4 pb-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {kpis.map((k, i) => (
                    <tr key={i} className="bg-white/40 dark:bg-white/5 rounded-2xl overflow-hidden group">
                      <td className="p-4"><input type="text" value={k.kpi} onChange={(e) => {
                        const newKpis = [...kpis]; newKpis[i].kpi = e.target.value; updateData(`scorecards.${division}`, newKpis);
                      }} className="bg-transparent border-none focus:ring-0 w-full font-bold" /></td>
                      <td className="p-4"><input type="text" value={k.target} onChange={(e) => {
                        const newKpis = [...kpis]; newKpis[i].target = e.target.value; updateData(`scorecards.${division}`, newKpis);
                      }} className="bg-transparent border-none focus:ring-0 w-full font-medium" /></td>
                      <td className="p-4"><input type="text" value={k.realisasi} onChange={(e) => {
                        const newKpis = [...kpis]; newKpis[i].realisasi = e.target.value; updateData(`scorecards.${division}`, newKpis);
                      }} className="bg-transparent border-none focus:ring-0 w-full font-mono text-blue-600" /></td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => {
                            const newKpis = [...kpis]; newKpis[i].jenis = k.jenis === 'output' ? 'outcome' : 'output'; updateData(`scorecards.${division}`, newKpis);
                          }}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${k.jenis === 'outcome' ? 'bg-purple-500/10 text-purple-600' : 'bg-orange-500/10 text-orange-600'}`}
                        >
                          {k.jenis}
                        </button>
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => {
                            const newKpis = [...kpis]; newKpis[i].status = k.status === 'on' ? 'off' : 'on'; updateData(`scorecards.${division}`, newKpis);
                          }}
                          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${k.status === 'on' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}
                        >
                          {k.status === 'on' ? 'On Track' : 'Off Track'}
                        </button>
                      </td>
                      <td className="p-4">
                        <button onClick={() => {
                          const newKpis = kpis.filter((_, idx) => idx !== i); updateData(`scorecards.${division}`, newKpis);
                        }} className="p-2 opacity-0 group-hover:opacity-100 text-rose-500 transition-all"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button 
              onClick={() => updateData(`scorecards.${division}`, [...kpis, { kpi: "Baru", target: "-", realisasi: "-", jenis: 'output', status: 'on' }])}
              className="mt-6 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-blue-500 hover:border-blue-500 transition-all font-bold"
            >
              <Plus size={20} /> Tambah Metrik KPI
            </button>
          </div>
        </div>
      );
    }

    // Rocks Review
    if (currentSlide === 2 + data.config.divisions.length) {
      const rocks = data.config.rocks;
      const rockStatus = data.rocksStatus.length === rocks.length ? data.rocksStatus : rocks.map(() => ({ pic: "", status: 'on', notes: "" }));
      if (data.rocksStatus.length !== rocks.length) updateData('rocksStatus', rockStatus);

      return (
        <div className="space-y-8 h-full">
          <div>
            <h2 className="text-4xl font-bold mb-2">Rock Review</h2>
            <p className="text-slate-500 font-medium">Prioritas Strategis 90 Hari</p>
          </div>
          <div className="aksana-glass p-10 rounded-[2.5rem] h-[calc(100%-120px)] overflow-y-auto custom-scrollbar">
            <table className="w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <th className="px-4 pb-4 w-[20%]">PIC / Tim</th>
                  <th className="px-4 pb-4 w-[40%]">Target (Rock)</th>
                  <th className="px-4 pb-4 text-center">Status</th>
                  <th className="px-4 pb-4">Catatan Progres</th>
                </tr>
              </thead>
              <tbody>
                {rocks.map((rock, i) => (
                  <tr key={i} className="bg-white/40 dark:bg-white/5 rounded-2xl overflow-hidden group">
                    <td className="p-4"><input type="text" value={rockStatus[i]?.pic} onChange={(e) => {
                      const newStatus = [...rockStatus]; newStatus[i].pic = e.target.value; updateData('rocksStatus', newStatus);
                    }} placeholder="Nama PIC" className="bg-transparent border-none focus:ring-0 w-full font-bold" /></td>
                    <td className="p-4 font-bold text-slate-600 dark:text-slate-300">{rock}</td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => {
                          const newStatus = [...rockStatus]; newStatus[i].status = rockStatus[i].status === 'on' ? 'off' : 'on'; updateData('rocksStatus', newStatus);
                        }}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${rockStatus[i]?.status === 'on' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}
                      >
                        {rockStatus[i]?.status === 'on' ? 'On Track' : 'Off Track'}
                      </button>
                    </td>
                    <td className="p-4"><input type="text" value={rockStatus[i]?.notes} onChange={(e) => {
                      const newStatus = [...rockStatus]; newStatus[i].notes = e.target.value; updateData('rocksStatus', newStatus);
                    }} placeholder="Update status..." className="bg-transparent border-none focus:ring-0 w-full italic text-sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // Headlines
    if (currentSlide === 3 + data.config.divisions.length) return (
      <div className="space-y-8 h-full">
        <div>
          <h2 className="text-4xl font-bold mb-2">Headlines</h2>
          <p className="text-slate-500 font-medium">Berita Penting (Customer & Internal)</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[calc(100%-120px)]">
          {['customer', 'internal'].map(type => (
            <div key={type} className="aksana-glass p-10 rounded-[2.5rem] flex flex-col space-y-6">
              <h3 className={`text-xl font-bold flex items-center gap-2 ${type === 'customer' ? 'text-blue-500' : 'text-emerald-500'}`}>
                <FileText /> {type === 'customer' ? 'Customer Headlines' : 'Internal Headlines'}
              </h3>
              <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                {(data.headlines[type as keyof typeof data.headlines] || []).map((h, i) => (
                  <div key={i} className="flex gap-4 group">
                    <span className="text-lg font-black text-slate-300">{i + 1}.</span>
                    <input 
                      type="text" 
                      value={h} 
                      onChange={(e) => {
                        const newH = [...data.headlines[type as keyof typeof data.headlines]]; newH[i] = e.target.value; updateData(`headlines.${type}`, newH);
                      }}
                      placeholder="Tulis headline..."
                      className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-lg font-medium"
                    />
                    <button onClick={() => {
                      const newH = data.headlines[type as keyof typeof data.headlines].filter((_, idx) => idx !== i); updateData(`headlines.${type}`, newH);
                    }} className="opacity-0 group-hover:opacity-100 text-rose-500"><Trash2 size={16}/></button>
                  </div>
                ))}
                <button 
                  onClick={() => updateData(`headlines.${type}`, [...data.headlines[type as keyof typeof data.headlines], ""])}
                  className="w-full py-3 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl text-slate-300 hover:text-blue-500 transition-all font-bold text-xs"
                >
                  + Tambah Headline
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    // To-Do List
    if (currentSlide === 4 + data.config.divisions.length) return (
      <div className="space-y-8 h-full">
        <div>
          <h2 className="text-4xl font-bold mb-2">To-Do List</h2>
          <p className="text-slate-500 font-medium">Review Minggu Lalu & Action Plan</p>
        </div>
        <div className="aksana-glass p-10 rounded-[2.5rem] flex flex-col h-[calc(100%-120px)]">
          <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
            {data.todoList.map((todo, i) => (
              <div key={todo.id} className="flex items-center gap-6 p-6 bg-white/40 dark:bg-white/5 rounded-2xl group transition-all hover:bg-white">
                <button 
                  onClick={() => {
                    const newList = [...data.todoList]; newList[i].isDone = !todo.isDone; updateData('todoList', newList);
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${todo.isDone ? 'bg-emerald-500 text-white' : 'border-2 border-slate-200'}`}
                >
                  {todo.isDone && <CheckCircle2 size={20} />}
                </button>
                <div className="flex-1 space-y-1">
                  <input 
                    type="text" 
                    value={todo.text} 
                    onChange={(e) => {
                      const newList = [...data.todoList]; newList[i].text = e.target.value; updateData('todoList', newList);
                    }}
                    placeholder="Apa tugas yang harus dilakukan?"
                    className={`bg-transparent border-none focus:ring-0 w-full font-bold text-lg ${todo.isDone ? 'line-through opacity-50' : ''}`}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Owner:</span>
                    <input 
                      type="text" 
                      value={todo.owner}
                      onChange={(e) => {
                        const newList = [...data.todoList]; newList[i].owner = e.target.value; updateData('todoList', newList);
                      }}
                      className="bg-transparent border-none focus:ring-0 text-sm font-bold text-blue-500 p-0 h-auto"
                    />
                  </div>
                </div>
                <button onClick={() => {
                  const newList = data.todoList.filter(t => t.id !== todo.id); updateData('todoList', newList);
                }} className="opacity-0 group-hover:opacity-100 text-rose-500"><Trash2 size={20}/></button>
              </div>
            ))}
            <button 
              onClick={() => updateData('todoList', [...data.todoList, { id: Date.now(), text: "", owner: "PIC", isDone: false }])}
              className="w-full p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 hover:text-blue-500 hover:border-blue-500 transition-all font-bold text-lg"
            >
              + Tambah To-Do List Baru
            </button>
          </div>
        </div>
      </div>
    );

    // IDS Session
    if (currentSlide === 5 + data.config.divisions.length) return (
      <div className="space-y-8 h-full">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-bold mb-2">IDS Session</h2>
            <p className="text-slate-500 font-medium">Identify, Discuss, Solve (60 Menit)</p>
          </div>
          <button 
            onClick={pullOffTrackData}
            className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-2xl font-bold hover:bg-rose-600 transition-all shadow-lg active:scale-95"
          >
            <RefreshCw size={18} /> Tarik Data Off-Track
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100%-120px)]">
          <div className="aksana-glass p-8 rounded-[2rem] flex flex-col space-y-6 overflow-hidden">
            <h3 className="text-lg font-bold border-b border-slate-100 dark:border-slate-800 pb-4 text-blue-500 uppercase tracking-wider">1. Identify (Issues)</h3>
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
              {data.idsSession.manualIssues.map((issue, i) => (
                <div key={i} className="flex gap-3 p-4 bg-white/40 dark:bg-black/20 rounded-xl group border border-white/20">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  <input 
                    type="text" 
                    value={issue} 
                    onChange={(e) => {
                      const newI = [...data.idsSession.manualIssues]; newI[i] = e.target.value; updateData('idsSession.manualIssues', newI);
                    }}
                    className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm font-bold"
                  />
                  <button onClick={() => {
                    const newI = data.idsSession.manualIssues.filter((_, idx) => idx !== i); updateData('idsSession.manualIssues', newI);
                  }} className="opacity-0 group-hover:opacity-100 text-rose-500"><Trash2 size={14}/></button>
                </div>
              ))}
              <button 
                onClick={() => updateData('idsSession.manualIssues', [...data.idsSession.manualIssues, "Issue baru..."])}
                className="w-full py-3 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl text-slate-300 hover:text-blue-500 transition-all font-bold text-xs"
              >
                + Manual Issue
              </button>
            </div>
          </div>
          <div className="aksana-glass p-8 rounded-[2rem] flex flex-col space-y-6">
            <h3 className="text-lg font-bold border-b border-slate-100 dark:border-slate-800 pb-4 text-emerald-500 uppercase tracking-wider">2. Discuss (Notes)</h3>
            <textarea 
              value={data.idsSession.notes}
              onChange={(e) => updateData('idsSession.notes', e.target.value)}
              placeholder="Catat poin diskusi di sini..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-lg font-medium leading-relaxed resize-none custom-scrollbar"
            />
          </div>
          <div className="aksana-glass p-8 rounded-[2rem] flex flex-col space-y-6">
            <h3 className="text-lg font-bold border-b border-slate-100 dark:border-slate-800 pb-4 text-purple-500 uppercase tracking-wider">3. Solve (Action Items)</h3>
            <textarea 
              value={data.idsSession.solutions}
              onChange={(e) => updateData('idsSession.solutions', e.target.value)}
              placeholder="- Solusi 1 (Owner)&#10;- Solusi 2..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-lg font-bold leading-relaxed resize-none custom-scrollbar text-purple-700 dark:text-purple-400"
            />
          </div>
        </div>
      </div>
    );

    // Conclude & Rating
    if (currentSlide === 6 + data.config.divisions.length) return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-12">
        <div className="space-y-4">
          <h2 className="text-4xl font-bold">Conclude</h2>
          <p className="text-slate-500 font-medium italic">"Seberapa efektif rapat kita hari ini?" (1 - 10)</p>
        </div>
        
        <div className="space-y-4">
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-[12rem] font-black leading-none tracking-tighter text-blue-600 drop-shadow-2xl">
            {averageRating}
          </motion.div>
          <p className="text-lg font-bold text-slate-400 uppercase tracking-[0.3em]">Rata-rata Rating Rapat</p>
        </div>

        <div className="aksana-glass p-10 rounded-[3rem] max-w-5xl w-full flex flex-wrap justify-center gap-6">
          {attendees.map((role, i) => data.attendance[i] && (
            <div key={i} className="flex flex-col items-center gap-3 w-32">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate w-full">{role}</label>
              <input 
                type="number" 
                min="1" 
                max="10" 
                value={data.ratings[i] || ""}
                onChange={(e) => updateData(`ratings.${i}`, parseFloat(e.target.value))}
                placeholder="-"
                className="w-full h-16 rounded-2xl bg-white dark:bg-black/40 text-center text-3xl font-black border-2 border-transparent focus:border-blue-500 outline-none transition-all shadow-lg"
              />
            </div>
          ))}
        </div>
      </div>
    );

    return null;
  };

  return (
    <div className="relative min-h-[800px] h-[85vh] w-full flex flex-col font-[family-name:var(--font-plus-jakarta)]">
      {/* Interactive Floating Header */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-6 z-40">
        <div className="flex items-center gap-4">
          <div className={`aksana-glass px-8 py-4 rounded-full flex items-center gap-6 shadow-xl border-white/40 ${timeLeft < 300 ? 'bg-rose-500/20 text-rose-600' : 'text-blue-600'}`}>
            <Clock size={24} />
            <span className="text-3xl font-black font-mono">{formatTime(timeLeft)}</span>
            <div className="flex gap-4 border-l border-slate-200 dark:border-slate-800 pl-6">
              <button 
                onClick={() => setIsTimerRunning(!isTimerRunning)} 
                className="hover:scale-110 transition-transform active:scale-95"
              >
                {isTimerRunning ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button 
                onClick={() => { setTimeLeft(5400); setIsTimerRunning(false); }}
                className="hover:scale-110 transition-transform active:scale-95 text-slate-400"
              >
                <RotateCcw size={20} />
              </button>
            </div>
          </div>
          {isSyncing && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full text-blue-600 text-xs font-bold">
              <Loader2 size={12} className="animate-spin" />
              Sinkron...
            </div>
          )}
        </div>

        <button 
          onClick={() => setShowSetup(true)}
          className="p-4 rounded-full bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-blue-500 hover:rotate-90 transition-all duration-500"
        >
          <Settings size={24} />
        </button>
      </div>

      {/* Slide Container */}
      <div className="flex-1 px-12 pt-32 pb-12 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="h-full w-full"
          >
            {renderSlide()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 right-12 flex gap-4 z-40">
        <button 
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="w-16 h-16 rounded-full aksana-glass flex items-center justify-center text-slate-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl active:scale-90"
        >
          <ChevronLeft size={32} />
        </button>
        <button 
          onClick={nextSlide}
          disabled={currentSlide === totalSlides - 1}
          className="w-16 h-16 rounded-full aksana-glass flex items-center justify-center text-slate-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl active:scale-90"
        >
          <ChevronRight size={32} />
        </button>
      </div>

      {/* Setup Overlay */}
      <AnimatePresence>
        {showSetup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/60 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="aksana-glass max-w-2xl w-full p-12 rounded-[3rem] shadow-2xl border-white/20 relative"
            >
              <button onClick={() => setShowSetup(false)} className="absolute top-8 right-8 text-slate-400 hover:text-rose-500 transition-all">
                <X size={32} />
              </button>
              
              <div className="space-y-10">
                <div className="text-center">
                  <h2 className="text-3xl font-black mb-2">Konfigurasi Rapat L10</h2>
                  <p className="text-slate-500 font-medium">Siapkan struktur tim sebelum memulai sesi.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nama Perusahaan / Tim</label>
                    <input 
                      type="text" 
                      value={data.config.companyName}
                      onChange={(e) => updateData('config.companyName', e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 transition-all outline-none font-bold text-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Daftar Divisi (Pisahkan Koma)</label>
                    <textarea 
                      value={data.config.divisions.join(', ')}
                      onChange={(e) => updateData('config.divisions', e.target.value.split(',').map(d => d.trim()).filter(d => d))}
                      rows={2}
                      className="w-full px-6 py-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 transition-all outline-none font-medium resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Target Strategis (Rocks)</label>
                    <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                      {data.config.rocks.map((rock, i) => (
                        <div key={i} className="flex gap-2">
                          <input 
                            type="text" 
                            value={rock}
                            onChange={(e) => {
                              const newRocks = [...data.config.rocks]; newRocks[i] = e.target.value; updateData('config.rocks', newRocks);
                            }}
                            className="flex-1 px-4 py-3 rounded-xl bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold"
                          />
                          <button onClick={() => updateData('config.rocks', data.config.rocks.filter((_, idx) => idx !== i))} className="p-3 text-rose-500 hover:bg-rose-500/10 rounded-xl"><Trash2 size={18}/></button>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => updateData('config.rocks', [...data.config.rocks, ""])}
                      className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-blue-500 transition-all font-bold text-xs"
                    >
                      + Tambah Rock
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => setShowSetup(false)}
                  className="w-full py-5 rounded-[2rem] bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 font-bold text-xl shadow-xl hover:opacity-90 active:scale-95 transition-all"
                >
                  Mulai Rapat Efektif
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

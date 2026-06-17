"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Users, 
  Target, 
  Map, 
  AlertCircle, 
  CheckCircle,
  ChevronRight,
  Plus,
  ArrowRight,
  BrainCircuit,
  Briefcase,
  Trash2,
  Building2,
  Loader2,
  Settings,
  RefreshCcw,
  LayoutDashboard,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

// --- TYPES ---

export interface PsychoScores {
  creativity: number;
  leadership: number;
  detail: number;
  execution: number;
}

export interface Seat {
  req: PsychoScores;
}

export interface Employee {
  id: number;
  name: string;
  role: string;
  psycho: PsychoScores;
}

export interface PeopleAnalyzerData {
  companyName: string;
  seats: Record<string, Seat>;
  employees: Employee[];
}

export interface PeopleAnalyzerProps {
  onSave?: (data: PeopleAnalyzerData) => void;
  isSyncing?: boolean;
  initialData?: PeopleAnalyzerData;
}

type ViewType = 'setup' | 'dashboard' | 'assessment';

// --- CONSTANTS ---

const PSYCHO_QUESTIONS = [
  {
    id: 1,
    question: "Saat terjadi krisis mendadak di mana klien besar komplain terkait hasil kerja tim Anda, apa insting pertama Anda?",
    options: [
      { text: "Mengumpulkan tim untuk segera membagi tugas penanganan darurat.", trait: 'leadership' as keyof PsychoScores },
      { text: "Menganalisis log data dan laporan sebelumnya untuk mencari letak kesalahan pasti.", trait: 'detail' as keyof PsychoScores },
      { text: "Memikirkan kompensasi kreatif atau layanan tambahan untuk menenangkan klien.", trait: 'creativity' as keyof PsychoScores },
      { text: "Langsung menelepon klien dan menyelesaikan masalah teknisnya saat itu juga.", trait: 'execution' as keyof PsychoScores }
    ]
  },
  {
    id: 2,
    question: "Jika Anda diminta untuk memimpin proyek peluncuran produk baru, bagian mana yang paling Anda nikmati?",
    options: [
      { text: "Merancang konsep produk dan strategi branding yang belum pernah ada.", trait: 'creativity' as keyof PsychoScores },
      { text: "Memastikan timeline berjalan cepat dan target mingguan tercapai tanpa alasan.", trait: 'execution' as keyof PsychoScores },
      { text: "Menyusun SOP rinci dan mengecek QA (Quality Assurance) sebelum rilis.", trait: 'detail' as keyof PsychoScores },
      { text: "Memotivasi anggota tim lintas divisi agar visi produk sejalan.", trait: 'leadership' as keyof PsychoScores }
    ]
  },
  {
    id: 3,
    question: "Kolega Anda sedang cuti dan Anda harus mem-backup pekerjaannya yang berisi ratusan baris data spreadsheet. Reaksi Anda?",
    options: [
      { text: "Bagus. Saya suka merapikan dan memastikan angka-angkanya akurat.", trait: 'detail' as keyof PsychoScores },
      { text: "Saya akan mendelegasikan beberapa bagian ke staf lain agar lebih efisien.", trait: 'leadership' as keyof PsychoScores },
      { text: "Saya kerjakan secepat mungkin agar target hari ini tetap selesai.", trait: 'execution' as keyof PsychoScores },
      { text: "Saya akan mencoba membuat rumus/makro baru agar formatnya lebih menarik dan mudah dibaca.", trait: 'creativity' as keyof PsychoScores }
    ]
  },
  {
    id: 4,
    question: "Dalam rapat evaluasi tahunan, gaya komunikasi Anda biasanya...",
    options: [
      { text: "Fokus pada poin-poin aksi (action items) untuk segera dieksekusi besok.", trait: 'execution' as keyof PsychoScores },
      { text: "Memberikan ide-ide liar tentang arah perusahaan ke depan.", trait: 'creativity' as keyof PsychoScores },
      { text: "Mengarahkan diskusi agar semua anggota tim mendapat kesempatan bicara.", trait: 'leadership' as keyof PsychoScores },
      { text: "Membawa catatan lengkap tentang metrik dan KPI yang tercapai/gagal.", trait: 'detail' as keyof PsychoScores }
    ]
  },
  {
    id: 5,
    question: "Apa kelemahan terbesar yang sering Anda (atau orang lain) sadari dalam diri Anda?",
    options: [
      { text: "Sering mengabaikan aturan kecil demi mencapai tujuan dengan cepat.", trait: 'execution' as keyof PsychoScores },
      { text: "Terlalu perfeksionis pada hal kecil sehingga kadang lambat.", trait: 'detail' as keyof PsychoScores },
      { text: "Sering melompat dari satu ide ke ide lain sebelum ide pertama selesai.", trait: 'creativity' as keyof PsychoScores },
      { text: "Terlalu mengambil alih pekerjaan karena kurang sabar melihat tim yang lambat.", trait: 'leadership' as keyof PsychoScores }
    ]
  }
];

// --- API HELPER (Gemini) ---

const generatePsychometricProfile = async (divisions: string[]): Promise<Record<string, Seat> | null> => {
  const apiKey = ""; // Disuntikkan oleh environment atau config
  const prompt = `Tentukan standar skor psikometrik (skala 0-100) yang ideal untuk masing-masing divisi/peran berikut: ${divisions.join(", ")}. Nilai 4 kategori ini: creativity (kreativitas/inovasi), leadership (kepemimpinan/pengaruh), detail (ketelitian/analisis), dan execution (kecepatan eksekusi/logika teknis). Berikan nilai yang logis sesuai sifat pekerjaannya.`;

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: {
      parts: [{ text: "Anda adalah konsultan HR. Output harus murni JSON Array tanpa markdown." }]
    },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            divisionName: { type: "STRING" },
            req: {
              type: "OBJECT",
              properties: {
                creativity: { type: "INTEGER" },
                leadership: { type: "INTEGER" },
                detail: { type: "INTEGER" },
                execution: { type: "INTEGER" }
              }
            }
          }
        }
      }
    }
  };

  const maxRetries = 5;
  const delays = [1000, 2000, 4000, 8000, 16000];
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      
      const data = await response.json();
      let textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (textResponse) {
        textResponse = textResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsedArray = JSON.parse(textResponse);
        
        const profiles: Record<string, Seat> = {};
        parsedArray.forEach((item: { divisionName: string, req: PsychoScores }) => {
          if (item.divisionName && item.req) {
             profiles[item.divisionName] = { req: item.req };
          }
        });
        return profiles;
      }
    } catch (error) {
      if (i === maxRetries - 1) {
        console.error("AI Error:", error);
        return null;
      }
      await new Promise(res => setTimeout(res, delays[i]));
    }
  }
  return null;
};

// --- UTILITY COMPONENTS ---

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`aksana-glass bg-white dark:bg-[#1E1E1E] backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden transition-all duration-300 ${className}`}>
    {children}
  </div>
);

const ProgressBar = ({ label, actual, required, colorClass = "bg-blue-500" }: { label: string, actual: number, required: number, colorClass?: string }) => {
  const isWarning = actual < required - 15;
  const barColor = isWarning ? "bg-amber-500" : colorClass;
  
  return (
    <div className="mb-6">
      <div className="flex justify-between text-xs mb-2">
        <span className="font-semibold text-slate-600 dark:text-slate-300">{label}</span>
        <span className="text-slate-600 dark:text-slate-200 font-mono">Aktual: {actual} / Standar: {required}</span>
      </div>
      <div className="relative h-3 bg-slate-100 dark:bg-[#121212] rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
        <div 
          className="absolute top-0 bottom-0 border-r-2 border-dashed border-slate-300 dark:border-slate-500 z-10 transition-all duration-500 shadow-sm" 
          style={{ left: `${required}%` }}
        />
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${actual}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`absolute top-0 left-0 bottom-0 ${barColor} rounded-full`}
        />
      </div>
    </div>
  );
};

// --- MAIN APPLICATION ---

export default function PeopleAnalyzer({ onSave, isSyncing, initialData }: PeopleAnalyzerProps) {
  const [view, setView] = useState<ViewType>('setup');
  const [companyName, setCompanyName] = useState(initialData?.companyName || "");
  const [seats, setSeats] = useState<Record<string, Seat>>(initialData?.seats || {});
  const [employees, setEmployees] = useState<Employee[]>(initialData?.employees || []);

  // --- Sync Logic ---
  const prevInitialData = useRef<PeopleAnalyzerData | undefined>(initialData);

  useEffect(() => {
    if (initialData && initialData !== prevInitialData.current) {
      setCompanyName(initialData.companyName || "");
      setSeats(initialData.seats || {});
      setEmployees(initialData.employees || []);
      if (initialData.companyName && Object.keys(initialData.seats || {}).length > 0) {
        setView('dashboard');
      }
      prevInitialData.current = initialData;
    }
  }, [initialData]);

  const triggerSave = useCallback((updatedData: PeopleAnalyzerData) => {
    if (onSave) {
      onSave(updatedData);
    }
  }, [onSave]);

  const handleSetupComplete = (generatedSeats: Record<string, Seat>, name: string) => {
    setSeats(generatedSeats);
    setCompanyName(name);
    setView('dashboard');
    triggerSave({ companyName: name, seats: generatedSeats, employees });
  };

  const handleAssessmentComplete = (newEmp: Employee) => {
    const updatedEmployees = [...employees, newEmp];
    setEmployees(updatedEmployees);
    setView('dashboard');
    triggerSave({ companyName, seats, employees: updatedEmployees });
  };

  const handleDeleteEmployee = (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus data karyawan ini?")) {
      const updatedEmployees = employees.filter(emp => emp.id !== id);
      setEmployees(updatedEmployees);
      triggerSave({ companyName, seats, employees: updatedEmployees });
    }
  };

  const handleReset = () => {
    if (confirm("Perhatian: Memulai ulang profil perusahaan akan menghapus semua data divisi dan karyawan. Lanjutkan?")) {
      setSeats({});
      setEmployees([]);
      setCompanyName("");
      setView('setup');
      triggerSave({ companyName: "", seats: {}, employees: [] });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans selection:bg-indigo-100">
      <nav className="sticky top-0 z-50 bg-white/60 backdrop-blur-2xl border-b border-black shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('dashboard')}>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-800 to-black text-white flex items-center justify-center font-bold shadow-lg">
                <Building2 size={22} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm leading-tight text-black tracking-tight">{companyName || 'People Analyzer'}</span>
                <span className="text-[10px] uppercase font-black text-slate-800 dark:text-indigo-400 tracking-widest">Aksana Profile</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {isSyncing && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-black text-black text-[10px] font-black animate-pulse shadow-sm">
                  <RefreshCcw size={12} className="animate-spin" /> SYNCING
                </div>
              )}
              {view !== 'setup' && (
                <>
                  <button 
                    onClick={handleReset}
                    className="p-2 text-black hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Reset App"
                  >
                    <Settings size={20} />
                  </button>
                  <button 
                    onClick={() => setView(view === 'dashboard' ? 'assessment' : 'dashboard')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-2xl text-sm font-bold transition-all hover:bg-slate-800 shadow-xl"
                  >
                    {view === 'dashboard' ? (
                      <><Plus size={18} /> <span className="hidden sm:inline">Mulai Asesmen</span></>
                    ) : (
                      <><LayoutDashboard size={18} /> <span className="hidden sm:inline">Dashboard</span></>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AnimatePresence mode="wait">
          {view === 'setup' ? (
            <motion.div 
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <CompanySetup onComplete={handleSetupComplete} />
            </motion.div>
          ) : view === 'dashboard' ? (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5 }}
            >
              <Dashboard 
                employees={employees} 
                seats={seats} 
                onDelete={handleDeleteEmployee} 
              />
            </motion.div>
          ) : (
            <motion.div 
              key="assessment"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.5 }}
            >
              <AssessmentForm 
                seats={seats} 
                onComplete={handleAssessmentComplete} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- SETUP COMPONENT ---

function CompanySetup({ onComplete }: { onComplete: (seats: Record<string, Seat>, name: string) => void }) {
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

// --- DASHBOARD COMPONENT ---

function Dashboard({ employees, seats, onDelete }: { employees: Employee[], seats: Record<string, Seat>, onDelete: (id: number) => void }) {
  const [selectedId, setSelectedId] = useState<number | null>(employees.length > 0 ? employees[0].id : null);

  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Users size={80} className="text-black/10 dark:text-slate-800 mb-8" />
        <h2 className="text-3xl font-black text-black dark:text-white mb-4">Profil Organisasi Terbentuk</h2>
        <p className="text-black dark:text-slate-400 max-w-md mb-10 font-medium italic">Anda telah menetapkan {Object.keys(seats).length} divisi. Tambahkan karyawan melalui asesmen untuk melihat analisis kecocokan.</p>
        
        <div className="w-full max-w-xl text-left bg-white p-8 rounded-[3rem] border border-black dark:border-slate-800 aksana-glass shadow-sm">
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

  const activeEmp = employees.find(e => e.id === (selectedId ?? employees[0].id)) || employees[0];
  const seatReq = seats[activeEmp.role]?.req || { creativity: 50, leadership: 50, detail: 50, execution: 50 };
  const empPsycho = activeEmp.psycho;

  const anomalies = [];
  if (empPsycho.creativity < seatReq.creativity - 15) anomalies.push({ trait: 'Kreativitas', val: empPsycho.creativity, req: seatReq.creativity });
  if (empPsycho.leadership < seatReq.leadership - 15) anomalies.push({ trait: 'Kepemimpinan', val: empPsycho.leadership, req: seatReq.leadership });
  if (empPsycho.detail < seatReq.detail - 15) anomalies.push({ trait: 'Ketelitian', val: empPsycho.detail, req: seatReq.detail });
  if (empPsycho.execution < seatReq.execution - 15) anomalies.push({ trait: 'Eksekusi', val: empPsycho.execution, req: seatReq.execution });

  let bestFit: string | null = null;
  let bestScore = -1;
  Object.keys(seats).forEach(role => {
    if (role === activeEmp.role) return;
    const req = seats[role].req;
    const matchScore = 
      (100 - Math.abs(empPsycho.creativity - req.creativity)) +
      (100 - Math.abs(empPsycho.detail - req.detail)) +
      (100 - Math.abs(empPsycho.leadership - req.leadership)) +
      (100 - Math.abs(empPsycho.execution - req.execution));
    
    if (matchScore > bestScore && matchScore > 320) { 
      bestScore = matchScore;
      bestFit = role;
    }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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
              <div className="flex justify-start items-center gap-8 mt-6 pt-6 border-t border-black shadow-sm">
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

// --- ASSESSMENT COMPONENT ---

function AssessmentForm({ seats, onComplete }: { seats: Record<string, Seat>, onComplete: (emp: Employee) => void }) {
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

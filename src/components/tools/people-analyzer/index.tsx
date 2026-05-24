"use client";

import React, { useState, useCallback } from 'react';
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

interface PsychoScores {
  creativity: number;
  leadership: number;
  detail: number;
  execution: number;
}

interface Seat {
  req: PsychoScores;
}

interface Employee {
  id: number;
  name: string;
  role: string;
  psycho: PsychoScores;
}

interface PeopleAnalyzerInitialData {
  companyName?: string;
  seats?: Record<string, Seat>;
  employees?: Employee[];
}

interface PeopleAnalyzerProps {
  user?: { id: string; [key: string]: unknown };
  onSave?: (data: PeopleAnalyzerInitialData) => void;
  isSyncing?: boolean;
  initialData?: PeopleAnalyzerInitialData;
}

type ViewType = 'setup' | 'dashboard' | 'assessment';

// --- CONSTANTS ---

const PSYCHO_QUESTIONS = [
  {
    id: 1,
    question: "Saat terjadi krisis mendadak di mana klien besar komplain terkait hasil kerja tim Anda, apa insting pertama Anda?",
    options: [
      { text: "Mengumpulkan tim untuk segera membagi tugas penanganan darurat.", trait: 'leadership' as const },
      { text: "Menganalisis log data dan laporan sebelumnya untuk mencari letak kesalahan pasti.", trait: 'detail' as const },
      { text: "Memikirkan kompensasi kreatif atau layanan tambahan untuk menenangkan klien.", trait: 'creativity' as const },
      { text: "Langsung menelepon klien dan menyelesaikan masalah teknisnya saat itu juga.", trait: 'execution' as const }
    ]
  },
  {
    id: 2,
    question: "Jika Anda diminta untuk memimpin proyek peluncuran produk baru, bagian mana yang paling Anda nikmati?",
    options: [
      { text: "Merancang konsep produk dan strategi branding yang belum pernah ada.", trait: 'creativity' as const },
      { text: "Memastikan timeline berjalan cepat dan target mingguan tercapai tanpa alasan.", trait: 'execution' as const },
      { text: "Menyusun SOP rinci dan mengecek QA (Quality Assurance) sebelum rilis.", trait: 'detail' as const },
      { text: "Memotivasi anggota tim lintas divisi agar visi produk sejalan.", trait: 'leadership' as const }
    ]
  },
  {
    id: 3,
    question: "Kolega Anda sedang cuti dan Anda harus mem-backup pekerjaannya yang berisi ratusan baris data spreadsheet. Reaksi Anda?",
    options: [
      { text: "Bagus. Saya suka merapikan dan memastikan angka-angkanya akurat.", trait: 'detail' as const },
      { text: "Saya akan mendelegasikan beberapa bagian ke staf lain agar lebih efisien.", trait: 'leadership' as const },
      { text: "Saya kerjakan secepat mungkin agar target hari ini tetap selesai.", trait: 'execution' as const },
      { text: "Saya akan mencoba membuat rumus/makro baru agar formatnya lebih menarik dan mudah dibaca.", trait: 'creativity' as const }
    ]
  },
  {
    id: 4,
    question: "Dalam rapat evaluasi tahunan, gaya komunikasi Anda biasanya...",
    options: [
      { text: "Fokus pada poin-poin aksi (action items) untuk segera dieksekusi besok.", trait: 'execution' as const },
      { text: "Memberikan ide-ide liar tentang arah perusahaan ke depan.", trait: 'creativity' as const },
      { text: "Mengarahkan diskusi agar semua anggota tim mendapat kesempatan bicara.", trait: 'leadership' as const },
      { text: "Membawa catatan lengkap tentang metrik dan KPI yang tercapai/gagal.", trait: 'detail' as const }
    ]
  },
  {
    id: 5,
    question: "Apa kelemahan terbesar yang sering Anda (atau orang lain) sadari dalam diri Anda?",
    options: [
      { text: "Sering mengabaikan aturan kecil demi mencapai tujuan dengan cepat.", trait: 'execution' as const },
      { text: "Terlalu perfeksionis pada hal kecil sehingga kadang lambat.", trait: 'detail' as const },
      { text: "Sering melompat dari satu ide ke ide lain sebelum ide pertama selesai.", trait: 'creativity' as const },
      { text: "Terlalu mengambil alih pekerjaan karena kurang sabar melihat tim yang lambat.", trait: 'leadership' as const }
    ]
  }
];

// --- COMPONENTS ---

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`aksana-glass border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden transition-all duration-300 ${className}`}>
    {children}
  </div>
);

const ProgressBar = ({ label, actual, required, colorClass = "bg-blue-500" }: { label: string, actual: number, required: number, colorClass?: string }) => {
  const isWarning = actual < required - 15;
  const barColor = isWarning ? "bg-amber-500" : colorClass;
  
  return (
    <div className="mb-6">
      <div className="flex justify-between text-xs mb-2">
        <span className="font-semibold text-slate-700 dark:text-slate-300">{label}</span>
        <span className="text-slate-500 font-mono">Aktual: {actual} / Standar: {required}</span>
      </div>
      <div className="relative h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        {/* Standard Marker (Dashed Line) */}
        <div 
          className="absolute top-0 bottom-0 border-r-2 border-dashed border-slate-400 dark:border-slate-500 z-10 transition-all duration-500" 
          style={{ left: `${required}%` }}
        />
        {/* Actual Value Bar */}
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

// --- MAIN COMPONENT ---

export default function PeopleAnalyzer({ onSave, isSyncing, initialData }: PeopleAnalyzerProps) {
  const [view, setView] = useState<ViewType>('setup');
  const [companyName, setCompanyName] = useState("");
  const [seats, setSeats] = useState<Record<string, Seat>>({});
  const [employees, setEmployees] = useState<Employee[]>([]);

  // --- Sync Logic ---
  const [prevInitialData, setPrevInitialData] = useState<PeopleAnalyzerInitialData | undefined>(initialData);

  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData);
    if (initialData) {
      if (initialData.companyName) setCompanyName(initialData.companyName);
      if (initialData.seats) setSeats(initialData.seats);
      if (initialData.employees) setEmployees(initialData.employees);
      if (initialData.companyName && Object.keys(initialData.seats || {}).length > 0) {
        setView('dashboard');
      }
    }
  }

  const triggerSave = useCallback((updatedData: PeopleAnalyzerInitialData) => {
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

  const handleAddEmployee = (newEmp: Employee) => {
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
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Tool */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-[family-name:var(--font-plus-jakarta)]">People Analyzer</h2>
            <p className="text-slate-500 text-sm font-medium">{companyName || 'Manajemen Talenta & Psikometrik'}</p>
          </div>
        </div>

        {view !== 'setup' && (
          <div className="flex items-center gap-3">
            {isSyncing && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold animate-pulse">
                <RefreshCcw size={12} className="animate-spin" /> SYNCING
              </div>
            )}
            <button 
              onClick={() => setView(view === 'dashboard' ? 'assessment' : 'dashboard')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
            >
              {view === 'dashboard' ? (
                <><Plus size={16} /> Tambah Karyawan</>
              ) : (
                <><LayoutDashboard size={16} /> Dashboard</>
              )}
            </button>
            <button 
              onClick={handleReset}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Reset Profil"
            >
              <Settings size={20} />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {view === 'setup' ? (
          <motion.div 
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <CompanySetup onComplete={handleSetupComplete} />
          </motion.div>
        ) : view === 'dashboard' ? (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <AssessmentForm 
              seats={seats} 
              onComplete={handleAddEmployee} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SUB-COMPONENTS ---

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

    // AI STANDARDS GENERATION (Mock logic since API key is client-provided or environment)
    try {
      const standardizedSeats: Record<string, Seat> = {};
      
      // Artificial delay to feel like AI processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      divisions.forEach(div => {
        const d = div.toLowerCase();
        // Dynamic defaults based on common roles
        if (d.includes('marketing') || d.includes('creative') || d.includes('design')) {
          standardizedSeats[div] = { req: { creativity: 85, leadership: 60, detail: 55, execution: 70 } };
        } else if (d.includes('eng') || d.includes('dev') || d.includes('tech')) {
          standardizedSeats[div] = { req: { creativity: 65, leadership: 40, detail: 85, execution: 80 } };
        } else if (d.includes('manager') || d.includes('lead') || d.includes('head')) {
          standardizedSeats[div] = { req: { creativity: 60, leadership: 90, detail: 70, execution: 75 } };
        } else if (d.includes('admin') || d.includes('finance') || d.includes('legal')) {
          standardizedSeats[div] = { req: { creativity: 40, leadership: 50, detail: 95, execution: 70 } };
        } else {
          standardizedSeats[div] = { req: { creativity: 50, leadership: 50, detail: 50, execution: 50 } };
        }
      });

      onComplete(standardizedSeats, compName);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memproses data.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-10 bg-white/50 backdrop-blur-xl border border-white/20">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Building2 size={40} />
          </div>
          <h3 className="text-3xl font-bold text-slate-900 font-[family-name:var(--font-plus-jakarta)]">Konfigurasi Organisasi</h3>
          <p className="text-slate-500 mt-3 font-medium">Definisikan struktur tim Anda. AI kami akan memetakan standar psikometrik ideal untuk setiap posisi.</p>
        </div>

        <div className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Nama Perusahaan</label>
            <input 
              type="text" 
              className="w-full p-4 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
              placeholder="PT Maju Bersama..."
              value={compName}
              onChange={(e) => setCompName(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Divisi / Kursi (Seats)</label>
            <form onSubmit={handleAddDivision} className="flex gap-3">
              <input 
                type="text" 
                className="flex-1 p-4 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                placeholder="Contoh: Marketing, Frontend Dev, HR..."
                value={newDivision}
                onChange={(e) => setNewDivision(e.target.value)}
                disabled={isGenerating}
              />
              <button 
                type="submit"
                disabled={!newDivision.trim() || isGenerating}
                className="px-6 py-4 bg-white border border-slate-200 text-indigo-600 font-bold rounded-2xl hover:bg-slate-50 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <Plus size={18} /> Tambah
              </button>
            </form>

            <div className="flex flex-wrap gap-2.5 p-5 border border-slate-100 rounded-[2rem] bg-slate-50/50 min-h-[80px]">
              {divisions.length === 0 && <span className="text-sm text-slate-400 italic m-auto font-medium">Belum ada divisi terdaftar.</span>}
              {divisions.map((div, idx) => (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  key={idx} 
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-700"
                >
                  {div}
                  <button type="button" onClick={() => handleRemoveDivision(div)} disabled={isGenerating} className="text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          {error && <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border border-red-100 text-center">{error}</div>}

          <button 
            onClick={handleGenerate}
            disabled={isGenerating || divisions.length === 0 || !compName}
            className="w-full py-5 bg-slate-900 text-white font-bold rounded-2xl hover:opacity-90 disabled:bg-slate-300 transition-all shadow-xl shadow-slate-200 flex justify-center items-center gap-3 text-lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                AI sedang menganalisis standar...
              </>
            ) : (
              <>
                Terapkan & Analisis Struktur <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </Card>
  );
}

function Dashboard({ employees, seats, onDelete }: { employees: Employee[], seats: Record<string, Seat>, onDelete: (id: number) => void }) {
  const [selectedId, setSelectedId] = useState<number | null>(employees.length > 0 ? employees[0].id : null);

  const activeEmp = employees.find(e => e.id === (selectedId ?? employees[0]?.id)) || employees[0];

  if (employees.length === 0) {
    return (
      <Card className="p-20 text-center bg-white/50 backdrop-blur-xl border border-white/20">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
            <UserPlus size={40} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-plus-jakarta)] mb-4">Mulai Database Tim</h3>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed">Anda telah menetapkan {Object.keys(seats).length} divisi. Sekarang, jalankan asesmen untuk karyawan Anda untuk melihat kecocokan kapasitas mereka.</p>
          
          <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 text-left">
            <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-4">Struktur Tersimpan:</h4>
            <div className="space-y-3">
              {Object.entries(seats).map(([name], i) => (
                <div key={i} className="flex justify-between items-center bg-white/60 p-3 rounded-xl border border-indigo-50">
                  <span className="font-bold text-indigo-900 text-sm">{name}</span>
                  <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" title="Creativity"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400" title="Leadership"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Detail"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Execution"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const seatReq = seats[activeEmp.role]?.req || { creativity: 50, leadership: 50, detail: 50, execution: 50 };
  const empPsycho = activeEmp.psycho;

  // Anomaly Detection
  const anomalies = [];
  if (empPsycho.creativity < seatReq.creativity - 15) anomalies.push({ trait: 'Kreativitas', val: empPsycho.creativity, req: seatReq.creativity });
  if (empPsycho.leadership < seatReq.leadership - 15) anomalies.push({ trait: 'Kepemimpinan', val: empPsycho.leadership, req: seatReq.leadership });
  if (empPsycho.detail < seatReq.detail - 15) anomalies.push({ trait: 'Ketelitian', val: empPsycho.detail, req: seatReq.detail });
  if (empPsycho.execution < seatReq.execution - 15) anomalies.push({ trait: 'Eksekusi', val: empPsycho.execution, req: seatReq.execution });

  // Re-assignment Suggestion
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
      {/* List Karyawan (Left Col) */}
      <div className="lg:col-span-4 space-y-6">
        <Card className="p-6 bg-white/50 backdrop-blur-xl border border-white/20">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 px-2">Database Talenta</h4>
          <div className="space-y-3 max-h-[650px] overflow-y-auto custom-scrollbar pr-2">
            {employees.map(emp => (
              <motion.div
                layout
                key={emp.id}
                onClick={() => setSelectedId(emp.id)}
                className={`group p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${activeEmp.id === emp.id ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white border-slate-100 hover:border-indigo-200'}`}
              >
                <div>
                  <p className={`font-bold transition-colors ${activeEmp.id === emp.id ? 'text-white' : 'text-slate-900'}`}>{emp.name}</p>
                  <p className={`text-xs font-medium mt-1 ${activeEmp.id === emp.id ? 'text-indigo-100' : 'text-slate-500'}`}>{emp.role}</p>
                </div>
                <div className="flex items-center gap-3">
                   <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(emp.id); }} 
                    className={`p-2 rounded-lg transition-all ${activeEmp.id === emp.id ? 'text-indigo-300 hover:text-white hover:bg-white/10' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'}`}
                  >
                    <Trash2 size={16} />
                  </button>
                  <ChevronRight size={18} className={activeEmp.id === emp.id ? 'text-white' : 'text-slate-300'} />
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Analysis Details (Right Col) */}
      <div className="lg:col-span-8 space-y-6">
        <Card className="p-10 bg-white/70 backdrop-blur-xl border border-white/20 h-full">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12 pb-10 border-b border-slate-100">
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-slate-900 font-[family-name:var(--font-plus-jakarta)]">{activeEmp.name}</h2>
              <div className="flex items-center gap-2">
                <div className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold tracking-wide flex items-center gap-2 shadow-sm">
                  <Briefcase size={12} /> {activeEmp.role}
                </div>
              </div>
            </div>
            
            <div className="text-left md:text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Status Kecocokan</span>
              {anomalies.length > 0 ? (
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-2xl text-sm font-bold shadow-sm">
                  <AlertCircle size={16} /> Perlu Penyesuaian
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl text-sm font-bold shadow-sm">
                  <CheckCircle size={16} /> Optimal (Right Seat)
                </div>
              )}
            </div>
          </div>

          <div className="space-y-10 mb-12">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                <Target size={16} className="text-indigo-500" /> Visualisasi Kapasitas vs Standar
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                <ProgressBar label="Kreativitas & Inovasi" actual={empPsycho.creativity} required={seatReq.creativity} colorClass="bg-blue-500" />
                <ProgressBar label="Kepemimpinan" actual={empPsycho.leadership} required={seatReq.leadership} colorClass="bg-purple-500" />
                <ProgressBar label="Ketelitian (Detail)" actual={empPsycho.detail} required={seatReq.detail} colorClass="bg-amber-500" />
                <ProgressBar label="Eksekusi & Logika" actual={empPsycho.execution} required={seatReq.execution} colorClass="bg-emerald-500" />
              </div>
              <div className="flex justify-start items-center gap-8 mt-4 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                  <div className="w-6 h-2 bg-indigo-500 rounded-full"></div> KAPASITAS AKTUAL
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                  <div className="w-6 h-0.5 border-t-2 border-dashed border-slate-400"></div> STANDAR AI KURSI
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations Card */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/10 transition-all duration-700"></div>
            
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-[0.2em] mb-6 flex items-center gap-2 relative z-10">
              <BrainCircuit size={18} /> Rekomendasi Sistem Aksana
            </h4>
            
            <div className="space-y-6 relative z-10">
              {anomalies.length > 0 ? (
                <>
                  <p className="text-sm text-indigo-100/80 leading-relaxed font-medium">
                    Karyawan menunjukkan gap kompetensi pada aspek <span className="text-white font-bold">{anomalies.map(a => a.trait).join(", ")}</span>. Posisi <span className="text-white font-bold">{activeEmp.role}</span> membutuhkan standar yang lebih tinggi.
                  </p>
                  
                  {bestFit && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 flex items-start gap-4"
                    >
                      <div className="p-3 bg-white text-indigo-900 rounded-2xl shadow-lg shrink-0">
                        <Map size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white mb-1">Potensi Re-assignment</p>
                        <p className="text-xs text-indigo-200 leading-relaxed">
                          Pola karakter {activeEmp.name} memiliki kecocokan <span className="text-white font-bold">94%</span> dengan standar posisi <span className="text-indigo-400 font-bold">{bestFit}</span>. Pertimbangkan rotasi untuk optimasi performa.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </>
              ) : (
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/20 shrink-0 shadow-lg">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white mb-1">Penempatan Sempurna</p>
                    <p className="text-xs text-indigo-200 leading-relaxed">
                      Kapasitas {activeEmp.name} sangat selaras dengan kebutuhan strategis posisi <span className="text-indigo-400 font-bold">{activeEmp.role}</span>. Fokus pada delegasi dan pengembangan lanjut di jalur ini.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function AssessmentForm({ seats, onComplete }: { seats: Record<string, Seat>, onComplete: (emp: Employee) => void }) {
  const [step, setStep] = useState(0); 
  const [formData, setFormData] = useState({ name: '', role: Object.keys(seats)[0] || '' });
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() !== '') setStep(1);
  };

  const handleAnswer = (questionId: number, selectedTrait: string) => {
    const newAnswers = { ...answers, [questionId]: selectedTrait };
    setAnswers(newAnswers);
    
    setTimeout(() => {
      if (step < PSYCHO_QUESTIONS.length) {
        setStep(step + 1);
      } else {
        const timestamp = new Date().getTime();
        processResults(newAnswers, timestamp);
      }
    }, 400);
  };

  const processResults = (finalAnswers: Record<number, string>, id: number) => {
    const scores: PsychoScores = { creativity: 30, leadership: 30, detail: 30, execution: 30 };

    Object.values(finalAnswers).forEach(trait => {
      if (trait in scores) {
        scores[trait as keyof PsychoScores] += 14;
      }
    });

    const newEmployee: Employee = {
      id,
      name: formData.name,
      role: formData.role,
      psycho: scores
    };

    onComplete(newEmployee);
  };

  if (step === 0) {
    return (
      <Card className="max-w-xl mx-auto p-12 bg-white/50 backdrop-blur-xl border border-white/20">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <BrainCircuit size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-plus-jakarta)] mb-2">Asesmen Talenta</h2>
          <p className="text-slate-500 font-medium text-sm">Pemetaan psikologis berbasis skenario untuk menentukan penempatan terbaik.</p>
        </div>

        <form onSubmit={handleStart} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Nama Lengkap</label>
            <input 
              required
              type="text" 
              className="w-full p-4 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
              placeholder="Masukkan nama kandidat..."
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
             <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Posisi Target</label>
            <select 
              className="w-full p-4 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 appearance-none"
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
            className="w-full py-4 mt-6 bg-slate-900 text-white font-bold rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-slate-100 flex justify-center items-center gap-2"
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
      <div className="mb-10">
        <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-widest">
          <span>Progres: {step} / {PSYCHO_QUESTIONS.length}</span>
          <span>{Math.round(progress)}% SELESAI</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
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
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card className="p-10 bg-white/50 backdrop-blur-xl border border-white/20">
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-10 leading-relaxed font-[family-name:var(--font-plus-jakarta)]">
              {currentQ.question}
            </h3>
            
            <div className="space-y-4">
              {currentQ.options.map((opt, idx) => {
                const isSelected = answers[currentQ.id] === opt.trait;
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(currentQ.id, opt.trait)}
                    className={`w-full text-left p-6 rounded-3xl border-2 transition-all duration-300 group ${
                      isSelected 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100 scale-[1.02]' 
                        : 'bg-white border-slate-50 hover:border-indigo-100 hover:bg-slate-50/50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? 'border-white/40 bg-white/20' : 'border-slate-200 group-hover:border-indigo-300'}`}>
                        {isSelected && <div className="w-3 h-3 bg-white rounded-full" />}
                      </div>
                      <span className="text-sm md:text-base font-bold leading-relaxed">{opt.text}</span>
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

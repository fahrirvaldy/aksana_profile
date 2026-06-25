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
import { useTranslations } from 'next-intl';

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

// --- COMPONENTS ---

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-all duration-300 shadow-sm ${className}`}>
    {children}
  </div>
);

const ProgressBar = ({ label, actual, required, colorClass = "bg-blue-500" }: { label: string, actual: number, required: number, colorClass?: string }) => {
  const t = useTranslations("Tools.People");
  const isWarning = actual < required - 15;
  const barColor = isWarning ? "bg-amber-500" : colorClass;
  
  return (
    <div className="mb-6">
      <div className="flex justify-between text-xs mb-2">
        <span className="font-bold text-slate-600 dark:text-slate-300">{label}</span>
        <span className="text-slate-600 dark:text-slate-300 font-black">{t("dashboardView.actualLabel", { actual, required })}</span>
      </div>
      <div className="relative h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
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
  const t = useTranslations("Tools.People");
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
    if (confirm(t("confirmDelete"))) {
      const updatedEmployees = employees.filter(emp => emp.id !== id);
      setEmployees(updatedEmployees);
      triggerSave({ companyName, seats, employees: updatedEmployees });
    }
  };

  const handleReset = () => {
    if (confirm(t("confirmReset"))) {
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
          <div className="w-12 h-12 rounded-2xl bg-black dark:bg-indigo-500 text-white flex items-center justify-center shadow-lg">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black font-[family-name:var(--font-plus-jakarta)] text-black dark:text-white">{t("title")}</h2>
            <p className="text-slate-700 dark:text-slate-400 text-sm font-normal">{companyName || t("subtitle")}</p>
          </div>
        </div>

        {view !== 'setup' && (
          <div className="flex items-center gap-3">
            {isSyncing && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black text-white dark:bg-slate-800 text-xs font-bold animate-pulse">
                <RefreshCcw size={12} className="animate-spin" /> {t("syncing")}
              </div>
            )}
            <button 
              onClick={() => setView(view === 'dashboard' ? 'assessment' : 'dashboard')}
              className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-indigo-600 text-white rounded-xl text-sm font-black hover:opacity-90 transition-all shadow-md"
            >
              {view === 'dashboard' ? (
                <><Plus size={16} /> {t("addEmployee")}</>
              ) : (
                <><LayoutDashboard size={16} /> {t("dashboard")}</>
              )}
            </button>
            <button 
              onClick={handleReset}
              className="p-2 text-black dark:text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title={t("alerts.resetTitle")}
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
  const t = useTranslations("Tools.People");
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
    if (!compName) { setError(t("setup.errorName")); return; }
    if (divisions.length === 0) { setError(t("setup.errorDiv")); return; }
    
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
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-10 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-black dark:bg-slate-800 text-white rounded-xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Building2 size={40} />
          </div>
          <h3 className="text-3xl font-black text-black dark:text-white font-[family-name:var(--font-plus-jakarta)]">{t("setup.title")}</h3>
          <p className="text-slate-600 dark:text-slate-300 mt-3 font-normal">{t("setup.description")}</p>
        </div>

        <div className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300 ml-1">{t("setup.companyName")}</label>
            <input 
              type="text" 
              className="w-full p-4 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold placeholder-slate-400 dark:placeholder-slate-500"
              placeholder={t("setup.placeholderCompany")}
              value={compName}
              onChange={(e) => setCompName(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300 ml-1">{t("setup.seats")}</label>
            <form onSubmit={handleAddDivision} className="flex gap-3">
              <input 
                type="text" 
                className="flex-1 p-4 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold placeholder-slate-400 dark:placeholder-slate-500"
                placeholder={t("setup.placeholderSeat")}
                value={newDivision}
                onChange={(e) => setNewDivision(e.target.value)}
                disabled={isGenerating}
              />
              <button 
                type="submit"
                disabled={!newDivision.trim() || isGenerating}
                className="px-6 py-4 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-950 font-black rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
              >
                <Plus size={18} /> {t("setup.add")}
              </button>
            </form>

            <div className="flex flex-wrap gap-2.5 p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-[#1E1E1E] min-h-[80px] shadow-sm">
              {divisions.length === 0 && <span className="text-sm text-slate-400 italic m-auto font-normal">{t("setup.empty")}</span>}
              {divisions.map((div, idx) => (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  key={idx} 
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm text-sm font-black"
                >
                  {div}
                  <button type="button" onClick={() => handleRemoveDivision(div)} disabled={isGenerating} className="text-slate-400 hover:text-red-500 transition-colors">
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
            className="w-full py-5 bg-black dark:bg-slate-900 text-white font-black rounded-2xl hover:opacity-90 disabled:bg-neutral-300 transition-all shadow-xl flex justify-center items-center gap-3 text-lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                {t("setup.generating")}
              </>
            ) : (
              <>
                {t("setup.generate")} <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </Card>
  );
}

function Dashboard({ employees, seats, onDelete }: { employees: Employee[], seats: Record<string, Seat>, onDelete: (id: number) => void }) {
  const t = useTranslations("Tools.People");
  const [selectedId, setSelectedId] = useState<number | null>(employees.length > 0 ? employees[0].id : null);

  const activeEmp = employees.find(e => e.id === (selectedId ?? employees[0]?.id)) || employees[0];

  if (employees.length === 0) {
    return (
      <Card className="p-20 text-center bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-slate-900 text-white dark:bg-slate-800 dark:text-white rounded-xl flex items-center justify-center mx-auto mb-8">
            <UserPlus size={40} />
          </div>
          <h3 className="text-2xl font-black text-black dark:text-white font-[family-name:var(--font-plus-jakarta)] mb-4">{t("dashboardView.empty.title")}</h3>
          <p className="text-slate-600 dark:text-slate-300 font-normal mb-10 leading-relaxed">{t("dashboardView.empty.description", { n: Object.keys(seats).length })}</p>
          
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-left shadow-sm">
            <h4 className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-4">{t("dashboardView.empty.structure")}</h4>
            <div className="space-y-3">
              {Object.entries(seats).map(([name], i) => (
                <div key={i} className="flex justify-between items-center bg-white dark:bg-[#1E1E1E] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <span className="font-black text-black dark:text-[#EEEEEE] text-sm">{name}</span>
                  <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600" title={t("dashboardView.traits.creativity")}></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-600" title={t("dashboardView.traits.leadership")}></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-600" title={t("dashboardView.traits.detail")}></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" title={t("dashboardView.traits.execution")}></div>
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
  if (empPsycho.creativity < seatReq.creativity - 15) anomalies.push({ trait: 'creativity', val: empPsycho.creativity, req: seatReq.creativity });
  if (empPsycho.leadership < seatReq.leadership - 15) anomalies.push({ trait: 'leadership', val: empPsycho.leadership, req: seatReq.leadership });
  if (empPsycho.detail < seatReq.detail - 15) anomalies.push({ trait: 'detail', val: empPsycho.detail, req: seatReq.detail });
  if (empPsycho.execution < seatReq.execution - 15) anomalies.push({ trait: 'execution', val: empPsycho.execution, req: seatReq.execution });

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
        <Card className="p-6 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 shadow-sm">
          <h4 className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-6 px-2">{t("dashboardView.sidebar")}</h4>
          <div className="space-y-3 max-h-[650px] overflow-y-auto custom-scrollbar pr-2">
            {employees.map(emp => (
              <motion.div
                layout
                key={emp.id}
                onClick={() => setSelectedId(emp.id)}
                className={`group p-5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${activeEmp.id === emp.id ? 'bg-slate-900 border-slate-900 shadow-lg' : 'bg-white border-slate-200 hover:bg-slate-50 dark:bg-[#1E1E1E] dark:border-slate-700'}`}
              >
                <div>
                  <p className={`font-black transition-colors ${activeEmp.id === emp.id ? 'text-white' : 'text-black dark:text-[#EEEEEE]'}`}>{emp.name}</p>
                  <p className={`text-xs font-normal mt-1 ${activeEmp.id === emp.id ? 'text-slate-300' : 'text-slate-600 dark:text-slate-400'}`}>{emp.role}</p>
                </div>
                <div className="flex items-center gap-3">
                   <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(emp.id); }} 
                    className={`p-2 rounded-lg transition-all ${activeEmp.id === emp.id ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
                  >
                    <Trash2 size={16} />
                  </button>
                  <ChevronRight size={18} className={activeEmp.id === emp.id ?'text-white' : 'text-slate-400'} />
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Analysis Details (Right Col) */}
      <div className="lg:col-span-8 space-y-6">
        <Card className="p-10 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 h-full shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12 pb-10 border-b border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-black dark:text-white font-[family-name:var(--font-plus-jakarta)]">{activeEmp.name}</h2>
              <div className="flex items-center gap-2">
                <div className="px-4 py-1.5 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-950 rounded-xl text-xs font-black tracking-wide flex items-center gap-2 shadow-sm">
                  <Briefcase size={12} /> {activeEmp.role}
                </div>
              </div>
            </div>
            
            <div className="text-left md:text-right">
              <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest block mb-3">{t("dashboardView.fitStatus")}</span>
              {anomalies.length > 0 ? (
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-amber-700 border-2 border-amber-600 rounded-xl text-sm font-black shadow-sm">
                  <AlertCircle size={16} /> {t("dashboardView.needAdjustment")}
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-700 border-2 border-emerald-600 rounded-xl text-sm font-black shadow-sm">
                  <CheckCircle size={16} /> {t("dashboardView.optimal")}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-10 mb-12">
            <div>
              <h4 className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-8 flex items-center gap-2">
                <Target size={16} className="text-indigo-600" /> {t("dashboardView.visualization")}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                <ProgressBar label={t("dashboardView.traits.creativity")} actual={empPsycho.creativity} required={seatReq.creativity} colorClass="bg-blue-600" />
                <ProgressBar label={t("dashboardView.traits.leadership")} actual={empPsycho.leadership} required={seatReq.leadership} colorClass="bg-purple-600" />
                <ProgressBar label={t("dashboardView.traits.detail")} actual={empPsycho.detail} required={seatReq.detail} colorClass="bg-amber-600" />
                <ProgressBar label={t("dashboardView.traits.execution")} actual={empPsycho.execution} required={seatReq.execution} colorClass="bg-emerald-600" />
              </div>
              <div className="flex justify-start items-center gap-8 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 dark:text-slate-300">
                  <div className="w-6 h-2 bg-indigo-600 rounded-full"></div> {t("dashboardView.actual")}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 dark:text-slate-300">
                  <div className="w-6 h-0.5 border-t-2 border-dashed border-slate-400 dark:border-slate-500 shadow-sm"></div> {t("dashboardView.standard")}
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations Card */}
          <div className="bg-slate-900 dark:bg-indigo-950 border border-slate-800 rounded-xl p-8 text-white relative overflow-hidden group shadow-lg">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/10 transition-all duration-700"></div>
            
            <h4 className="text-xs font-black text-white dark:text-indigo-300 uppercase tracking-[0.2em] mb-6 flex items-center gap-2 relative z-10">
              <BrainCircuit size={18} /> {t("dashboardView.recommendation")}
            </h4>
            
            <div className="space-y-6 relative z-10">
              {anomalies.length > 0 ? (
                <>
                  <p className="text-sm text-white/90 leading-relaxed font-semibold">
                    {t("dashboardView.gapDesc", { 
                      traits: anomalies.map(a => t(`dashboardView.anomalies.${a.trait}`)).join(", "),
                      role: activeEmp.role 
                    })}
                  </p>
                  
                  {bestFit && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 flex items-start gap-4 shadow-sm"
                    >
                      <div className="p-3 bg-white text-slate-900 rounded-xl shrink-0 border border-slate-200 aksana-glass">
                        <Map size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-white mb-1">{t("dashboardView.reassignment")}</p>
                        <p className="text-xs text-neutral-300 leading-relaxed font-medium">
                          {t("dashboardView.reassignmentDesc", { name: activeEmp.name, percent: 94, role: bestFit })}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </>
              ) : (
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/20 shrink-0 shadow-sm">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white mb-1">{t("dashboardView.perfectFit")}</p>
                    <p className="text-xs text-neutral-300 leading-relaxed font-medium">
                      {t("dashboardView.perfectFitDesc", { name: activeEmp.name, role: activeEmp.role })}
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
  const t = useTranslations("Tools.People");

  const PSYCHO_QUESTIONS = [
    {
      id: 1,
      question: t("questions.q1.text"),
      options: [
        { text: t("questions.q1.options.leadership"), trait: 'leadership' as const },
        { text: t("questions.q1.options.detail"), trait: 'detail' as const },
        { text: t("questions.q1.options.creativity"), trait: 'creativity' as const },
        { text: t("questions.q1.options.execution"), trait: 'execution' as const }
      ]
    },
    {
      id: 2,
      question: t("questions.q2.text"),
      options: [
        { text: t("questions.q2.options.creativity"), trait: 'creativity' as const },
        { text: t("questions.q2.options.execution"), trait: 'execution' as const },
        { text: t("questions.q2.options.detail"), trait: 'detail' as const },
        { text: t("questions.q2.options.leadership"), trait: 'leadership' as const }
      ]
    },
    {
      id: 3,
      question: t("questions.q3.text"),
      options: [
        { text: t("questions.q3.options.detail"), trait: 'detail' as const },
        { text: t("questions.q3.options.leadership"), trait: 'leadership' as const },
        { text: t("questions.q3.options.execution"), trait: 'execution' as const },
        { text: t("questions.q3.options.creativity"), trait: 'creativity' as const }
      ]
    },
    {
      id: 4,
      question: t("questions.q4.text"),
      options: [
        { text: t("questions.q4.options.execution"), trait: 'execution' as const },
        { text: t("questions.q4.options.creativity"), trait: 'creativity' as const },
        { text: t("questions.q4.options.leadership"), trait: 'leadership' as const },
        { text: t("questions.q4.options.detail"), trait: 'detail' as const }
      ]
    },
    {
      id: 5,
      question: t("questions.q5.text"),
      options: [
        { text: t("questions.q5.options.execution"), trait: 'execution' as const },
        { text: t("questions.q5.options.detail"), trait: 'detail' as const },
        { text: t("questions.q5.options.creativity"), trait: 'creativity' as const },
        { text: t("questions.q5.options.leadership"), trait: 'leadership' as const }
      ]
    }
  ];

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
      <Card className="max-w-xl mx-auto p-6 md:p-12 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-slate-900 text-white dark:bg-slate-800 dark:text-white rounded-xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <BrainCircuit size={32} />
          </div>
          <h2 className="text-2xl font-black text-black dark:text-white font-[family-name:var(--font-plus-jakarta)] mb-2">{t("assessment.title")}</h2>
          <p className="text-slate-600 dark:text-slate-300 font-normal text-sm">{t("assessment.description")}</p>
        </div>

        <form onSubmit={handleStart} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300 ml-1">{t("assessment.name")}</label>
            <input 
              required
              type="text" 
              className="w-full p-4 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold placeholder-slate-400 dark:placeholder-slate-500"
              placeholder={t("assessment.placeholderName")}
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300 ml-1">{t("assessment.role")}</label>
            <select 
              className="w-full p-4 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-black appearance-none"
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
            className="w-full py-4 mt-6 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-950 font-black rounded-xl hover:opacity-90 transition-all shadow-xl flex justify-center items-center gap-2"
          >
            {t("assessment.start")} <ArrowRight size={18} />
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
        <div className="flex justify-between text-[10px] font-black text-slate-600 dark:text-slate-300 mb-3 uppercase tracking-widest">
          <span>{t("assessment.progress", { step: step, total: PSYCHO_QUESTIONS.length })}</span>
          <span>{t("assessment.finished", { percent: Math.round(progress) })}</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700 shadow-sm">
          <motion.div 
            className="h-full bg-slate-900 dark:bg-indigo-600 rounded-full" 
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
          <Card className="p-6 md:p-10 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xl md:text-2xl font-black text-black dark:text-white mb-10 leading-relaxed font-[family-name:var(--font-plus-jakarta)]">
              {currentQ.question}
            </h3>
            
            <div className="space-y-4">
              {currentQ.options.map((opt, idx) => {
                const isSelected = answers[currentQ.id] === opt.trait;
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(currentQ.id, opt.trait)}
                    className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-300 group ${
                      isSelected 
                        ? 'bg-slate-900 border-slate-900 text-white shadow-xl scale-[1.02]' 
                        : 'bg-white border-slate-200 hover:bg-slate-50 dark:bg-[#1E1E1E] dark:border-slate-800 text-black dark:text-[#EEEEEE]'
                    }`}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? 'border-white/40 bg-white/20' : 'border-slate-300 dark:border-slate-700 group-hover:border-indigo-300'}`}>
                        {isSelected && <div className="w-3 h-3 bg-white rounded-full border border-slate-400 aksana-glass" />}
                      </div>
                      <span className="text-sm md:text-base font-black leading-relaxed">{opt.text}</span>
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
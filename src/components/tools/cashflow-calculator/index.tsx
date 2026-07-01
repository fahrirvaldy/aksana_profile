"use client";

import { User } from "@supabase/supabase-js";
import React, { useState, useMemo } from "react";
import { 
  TrendingUp, 
  DollarSign,
  Save,
  Loader2,
  Plus,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Calendar,
  History,
  LayoutDashboard,
  BrainCircuit,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTranslations } from 'next-intl';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Record {
  id: number;
  name: string;
  inOps: number;
  inNonOps: number;
  outOps: number;
  outNonOps: number;
  totalIn: number;
  totalOut: number;
  netFlow: number;
  balance: number;
}

interface CashflowCalculatorInitialData {
  periodType?: PeriodType;
  initialBalance?: number;
  initialBalanceSet?: boolean;
  records?: Record[];
}

interface CashflowCalculatorProps {
  user?: User;
  onSave?: (data: CashflowCalculatorInitialData) => void;
  isSyncing?: boolean;
  initialData?: CashflowCalculatorInitialData;
}

type PeriodType = 'harian' | 'mingguan' | 'bulanan';
type TabType = 'input' | 'dashboard' | 'report';

export default function CashflowCalculator({ user, onSave, isSyncing, initialData }: CashflowCalculatorProps) {
  const t = useTranslations("Tools.Cashflow");

  // --- State ---
  const [periodType, setPeriodType] = useState<PeriodType>('bulanan');
  const [initialBalance, setInitialBalance] = useState<number>(0);
  const [initialBalanceSet, setInitialBalanceSet] = useState<boolean>(false);
  const [records, setRecords] = useState<Record[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('input');

  // Input States
  const [entryName, setEntryName] = useState("");
  const [inOps, setInOps] = useState<number | "">("");
  const [inNonOps, setInNonOps] = useState<number | "">("");
  const [outOps, setOutOps] = useState<number | "">("");
  const [outNonOps, setOutNonOps] = useState<number | "">("");

  // --- Syncing ---
  const [prevInitialData, setPrevInitialData] = useState<CashflowCalculatorInitialData | undefined>(initialData);

  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData);
    if (initialData) {
      if (initialData.periodType) setPeriodType(initialData.periodType);
      if (initialData.initialBalance !== undefined) setInitialBalance(initialData.initialBalance);
      if (initialData.initialBalanceSet !== undefined) setInitialBalanceSet(initialData.initialBalanceSet);
      if (initialData.records) setRecords(initialData.records);
    }
  }

  const handleSave = (updatedRecords: Record[], updatedInitialBalanceSet?: boolean, updatedInitialBalance?: number) => {
    if (onSave) {
      onSave({
        periodType,
        initialBalance: updatedInitialBalance !== undefined ? updatedInitialBalance : initialBalance,
        initialBalanceSet: updatedInitialBalanceSet !== undefined ? updatedInitialBalanceSet : initialBalanceSet,
        records: updatedRecords
      });
    }
  };

  // --- Logic ---
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const addRecord = () => {
    const iOps = Number(inOps) || 0;
    const iNon = Number(inNonOps) || 0;
    const oOps = Number(outOps) || 0;
    const oNon = Number(outNonOps) || 0;

    const totalIn = iOps + iNon;
    const totalOut = oOps + oNon;
    const netFlow = totalIn - totalOut;
    
    const prevBalance = records.length > 0 ? records[records.length - 1].balance : initialBalance;
    const newBalance = prevBalance + netFlow;

    const newRecord: Record = {
      id: Date.now(),
      name: entryName || `Periode ${records.length + 1}`,
      inOps: iOps,
      inNonOps: iNon,
      outOps: oOps,
      outNonOps: oNon,
      totalIn,
      totalOut,
      netFlow,
      balance: newBalance
    };

    const newRecords = [...records, newRecord];
    setRecords(newRecords);
    handleSave(newRecords);

    // Reset fields
    setEntryName("");
    setInOps("");
    setInNonOps("");
    setOutOps("");
    setOutNonOps("");
  };

  const deleteRecord = (id: number) => {
    const filtered = records.filter(r => r.id !== id);
    // Recalculate balances
    let currentBal = initialBalance;
    const recalculated = filtered.map(r => {
      currentBal += r.netFlow;
      return { ...r, balance: currentBal };
    });
    setRecords(recalculated);
    handleSave(recalculated);
  };

  const resetAll = () => {
    if (confirm(t("confirmReset"))) {
      setRecords([]);
      setInitialBalanceSet(false);
      setInitialBalance(0);
      handleSave([], false, 0);
    }
  };

  // --- Metrics ---
  const metrics = useMemo(() => {
    if (records.length === 0) return { avgNetFlow: 0, opsRatio: 0, runway: 0, score: 0, finalBalance: initialBalance };

    const totalNetFlow = records.reduce((acc, r) => acc + r.netFlow, 0);
    const avgNetFlow = totalNetFlow / records.length;
    
    const totalInOps = records.reduce((acc, r) => acc + r.inOps, 0);
    const totalOutOps = records.reduce((acc, r) => acc + r.outOps, 0);
    const opsRatio = totalOutOps > 0 ? totalInOps / totalOutOps : (totalInOps > 0 ? 2 : 0);

    const finalBalance = records[records.length - 1].balance;
    const runway = avgNetFlow < 0 ? Math.abs(finalBalance / avgNetFlow) : Infinity;

    // Health Score Logic
    let score = 50;
    if (opsRatio > 1.1) score += 20;
    else if (opsRatio < 1) score -= 20;
    
    if (avgNetFlow > 0) score += 15;
    else score -= 10;

    if (runway > 6) score += 15;
    else if (runway < 2) score -= 15;

    score = Math.max(0, Math.min(100, score));

    return { avgNetFlow, opsRatio, runway, score, finalBalance };
  }, [records, initialBalance]);

  // --- Chart Data ---
  const chartData = {
    labels: ['Awal', ...records.map(r => r.name)],
    datasets: [
      {
        label: 'Saldo Kas',
        data: [initialBalance, ...records.map(r => r.balance)],
        fill: true,
        borderColor: '#0f172a',
        backgroundColor: 'rgba(15, 23, 42, 0.05)',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#0f172a',
      }
    ]
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: { display: false },
      },
      x: {
        grid: { display: false },
      }
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700">
      {/* Navigation Tabs */}
      <div className="flex justify-center p-1 bg-white dark:bg-[#1E1E1E] rounded-2xl w-fit mx-auto shadow-inner border border-slate-200 dark:border-slate-800">
        {(['input', 'dashboard', 'report'] as TabType[]).map((tab) => (
          <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                        activeTab === tab 
                          ? "bg-black text-white dark:bg-slate-900 dark:text-white shadow-sm" 
                          : "text-slate-600 hover:text-black dark:text-slate-400 dark:hover:text-slate-300"
                      }`}
                      >
                      {tab === 'input' && <><History size={16} /> {t("tabs.input")}</>}
                      {tab === 'dashboard' && <><LayoutDashboard size={16} /> {t("tabs.dashboard")}</>}
                      {tab === 'report' && <><BrainCircuit size={16} /> {t("tabs.report")}</>}
                      </button>
                      ))}
                      </div>

                      <AnimatePresence mode="wait">
                      <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      >
                      {/* TAB: INPUT DATA */}
                      {activeTab === 'input' && (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 space-y-6">
                          <div className="p-8 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl space-y-6 aksana-glass shadow-sm">
                            <div className="space-y-4">
                              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">{t("config.frequency")}</label>
                              <div className="flex gap-2">
                                {(['harian', 'mingguan', 'bulanan'] as PeriodType[]).map((type) => (
                                  <button
                                    key={type}
                                    onClick={() => setPeriodType(type)}
                                    className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                                      periodType === type 
                                        ? "bg-black text-white dark:bg-slate-50 dark:text-black border-transparent" 
                                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                                    }`}
                                  >
                                    {type}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-3">
                              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">{t("config.initialBalance")}</label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300 font-medium">Rp</span>
                                <input
                                  type="number"
                                  value={initialBalance}
                                  onChange={(e) => setInitialBalance(Number(e.target.value))}
                                  disabled={initialBalanceSet}
                                  className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 outline-none transition-all font-medium ${
                                    initialBalanceSet ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400" : "focus:border-black dark:focus:border-slate-500"
                                  }`}
                                />
                              </div>
                              {!initialBalanceSet ? (
                                <button
                                  onClick={() => {setInitialBalanceSet(true); handleSave(records, true, initialBalance);}}
                                  className="w-full py-3 rounded-xl bg-black text-white dark:bg-slate-100 dark:text-black text-xs font-bold"
                                >
                                  {t("config.lockBalance")}
                                </button>
                              ) : (
                                <div className="flex items-center gap-2 text-[10px] text-emerald-600 font-bold uppercase">
                                  <CheckCircle2 size={12} /> {t("config.balanceLocked")}
                                </div>
                              )}
                            </div>
                          </div>

                          {initialBalanceSet && (
                            <div className="p-8 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 aksana-glass shadow-sm">
                              <h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                <Plus size={16} /> {t("addRecord", { period: periodType })}
                              </h4>

                              <input
                                type="text"
                                placeholder={t("placeholders.name", { period: periodType })}
                                value={entryName}
                                onChange={(e) => setEntryName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 text-sm outline-none placeholder-slate-400 dark:placeholder-slate-500"
                              />

                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                  <label htmlFor="inOps" className="text-[9px] font-bold text-slate-600 dark:text-slate-300 uppercase">{t("labels.inOps")}</label>
                                  <input id="inOps" type="number" placeholder={t("placeholders.rp")} value={inOps} onChange={(e) => setInOps(e.target.value === "" ? "" : Number(e.target.value))} className="w-full px-3 py-2 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 text-sm outline-none placeholder-slate-400 dark:placeholder-slate-500" />
                                </div>
                                <div className="space-y-1.5">
                                  <label htmlFor="inNonOps" className="text-[9px] font-bold text-slate-600 dark:text-slate-300 uppercase">{t("labels.inInvest")}</label>
                                  <input id="inNonOps" type="number" placeholder={t("placeholders.rp")} value={inNonOps} onChange={(e) => setInNonOps(e.target.value === "" ? "" : Number(e.target.value))} className="w-full px-3 py-2 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 text-sm outline-none placeholder-slate-400 dark:placeholder-slate-500" />
                                </div>
                                <div className="space-y-1.5">
                                  <label htmlFor="outOps" className="text-[9px] font-bold text-slate-600 dark:text-slate-300 uppercase">{t("labels.outOps")}</label>
                                  <input id="outOps" type="number" placeholder={t("placeholders.rp")} value={outOps} onChange={(e) => setOutOps(e.target.value === "" ? "" : Number(e.target.value))} className="w-full px-3 py-2 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 text-sm outline-none placeholder-slate-400 dark:placeholder-slate-500" />
                                </div>
                                <div className="space-y-1.5">
                                  <label htmlFor="outNonOps" className="text-[9px] font-bold text-slate-600 dark:text-slate-300 uppercase">{t("labels.outInvest")}</label>
                                  <input id="outNonOps" type="number" placeholder={t("placeholders.rp")} value={outNonOps} onChange={(e) => setOutNonOps(e.target.value === "" ? "" : Number(e.target.value))} className="w-full px-3 py-2 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 text-sm outline-none placeholder-slate-400 dark:placeholder-slate-500" />
                                </div>
                              </div>

                              <button
                                onClick={addRecord}
                                className="w-full py-4 rounded-2xl bg-black dark:bg-slate-50 text-white dark:text-black font-bold transition-all hover:opacity-90 active:scale-[0.98]"
                              >
                                {t("labels.recordData")}
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                          <div className="p-8 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl min-h-[400px] aksana-glass shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300 flex items-center gap-2">
                                <History size={18} /> {t("ledger.title")}
                              </h3>
                              {records.length > 0 && (
                                <button onClick={resetAll} className="flex items-center gap-1.5 text-rose-600 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-500/10 px-3 py-1.5 rounded-lg transition-all">
                                  <RotateCcw size={14} /> {t("ledger.reset")}
                                </button>
                              )}
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse shadow-sm">
                                <thead>
                                  <tr className="border-b border-slate-200 dark:border-slate-800 shadow-sm">
                                    <th className="py-4 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{t("ledger.period")}</th>
                                    <th className="py-4 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{t("ledger.totalIn")}</th>
                                    <th className="py-4 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{t("ledger.totalOut")}</th>
                                    <th className="py-4 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{t("ledger.netFlow")}</th>
                                    <th className="py-4 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{t("ledger.balance")}</th>
                                    <th className="py-4"></th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
                                  {records.length === 0 ? (
                                    <tr>
                                      <td colSpan={6} className="px-4 py-12 text-center text-slate-600 dark:text-slate-400 text-sm italic">{t("ledger.empty")}</td>
                                    </tr>
                                  ) : (
                                    records.map((rec) => (
                                      <tr key={rec.id} className="group hover:bg-black/5 dark:hover:bg-slate-800/20 transition-all">
                                        <td className="py-4 font-bold text-black dark:text-slate-300">{rec.name}</td>
                                        <td className="py-4 text-emerald-600 dark:text-emerald-400 font-medium">{formatCurrency(rec.totalIn)}</td>
                                        <td className="py-4 text-rose-600 dark:text-rose-400 font-medium">{formatCurrency(rec.totalOut)}</td>
                                        <td className={`py-4 font-bold ${rec.netFlow >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                          {rec.netFlow >= 0 ? "+" : ""}{formatCurrency(rec.netFlow)}
                                        </td>
                                        <td className="py-4 font-black text-black dark:text-white">{formatCurrency(rec.balance)}</td>
                                        <td className="py-4 text-right">
                                          <button onClick={() => deleteRecord(rec.id)} className="opacity-0 group-hover:opacity-100 p-2 text-black dark:text-slate-400 hover:text-rose-600 transition-all">
                                            <Trash2 size={16} />
                                          </button>
                                        </td>
                                      </tr>
                                    ))
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                      )}

                      {/* TAB: DASHBOARD */}
                      {activeTab === 'dashboard' && (
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          {/* Health Score Circle */}
                          <div className="md:col-span-1 p-8 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center space-y-4 aksana-glass shadow-sm">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">{t("dashboard.healthScore")}</span>
                            <div className="relative w-32 h-32">
                              <svg className="w-full h-full" viewBox="0 0 100 100">
                                <circle className="text-black/5 dark:text-slate-950" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                                <circle 
                                  className={metrics.score > 70 ? "text-emerald-500" : metrics.score > 40 ? "text-amber-500" : "text-rose-500"}
                                  strokeWidth="8" 
                                  strokeDasharray={251.2}
                                  strokeDashoffset={251.2 - (251.2 * metrics.score) / 100}
                                  strokeLinecap="round" 
                                  stroke="currentColor" 
                                  fill="transparent" 
                                  r="40" cx="50" cy="50" 
                                  style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <span className="text-3xl font-black text-black dark:text-white">{Math.round(metrics.score)}</span>
                                <span className="text-[8px] font-bold uppercase text-slate-600 dark:text-slate-400">{t("dashboard.points")}</span>
                              </div>
                            </div>
                            <div className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase ${
                              metrics.score > 70 ? "bg-emerald-100 text-emerald-700" : metrics.score > 40 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                            }`}>
                              {metrics.score > 70 ? t("dashboard.status.healthy") : metrics.score > 40 ? t("dashboard.status.warning") : t("dashboard.status.critical")}
                            </div>
                          </div>

                          {/* Metric Cards */}
                          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="p-8 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 aksana-glass shadow-sm">
                              <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-fit text-black dark:text-white"><DollarSign size={20} /></div>
                              <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">{t("dashboard.finalBalance")}</p>
                              <h3 className="text-2xl font-black text-black dark:text-white">{formatCurrency(metrics.finalBalance)}</h3>
                            </div>
                            <div className="p-8 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 aksana-glass shadow-sm">
                              <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-fit text-black dark:text-white"><TrendingUp size={20} /></div>
                              <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">{t("dashboard.avgNetFlow")}</p>
                              <h3 className={`text-2xl font-black ${metrics.avgNetFlow >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{formatCurrency(metrics.avgNetFlow)}</h3>
                            </div>
                            <div className="p-8 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 aksana-glass shadow-sm">
                              <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-fit text-black dark:text-white"><Calendar size={20} /></div>
                              <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">{t("dashboard.runway")}</p>
                              <h3 className="text-2xl font-black text-black dark:text-white">
                                {metrics.runway === Infinity ? "∞" : `${metrics.runway.toFixed(1)} ${t(`dashboard.runwayUnit.${periodType}`)}`}
                              </h3>
                            </div>
                          </div>
                        </div>

                        {/* Trend Chart */}
                        <div className="p-8 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl space-y-6 aksana-glass shadow-sm">
                          <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-slate-600 dark:text-slate-300">{t("dashboard.chartTitle")}</h3>
                          <div className="h-[300px] w-full">
                            {records.length > 0 ? (
                              <Line data={chartData} options={chartOptions} />
                            ) : (
                              <div className="h-full flex items-center justify-center text-slate-600 dark:text-slate-400 italic text-sm">{t("dashboard.chartPlaceholder")}</div>
                            )}
                          </div>
                        </div>
                      </div>
                      )}

                      {/* TAB: REPORT */}
                      {activeTab === 'report' && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="p-10 rounded-[2.5rem] bg-black text-white space-y-8 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-8 opacity-5">
                            <BrainCircuit size={150} />
                          </div>
                          <div className="relative space-y-6">
                            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white/50">{t("report.diagnosis")}</h3>

                            <div className="space-y-4">
                              <p className="text-2xl font-bold leading-tight">
                                {metrics.score > 70 
                                  ? t("report.status.solid")
                                  : metrics.score > 40 
                                  ? t("report.status.risk")
                                  : t("report.status.critical")}
                              </p>

                              <div className="space-y-2 text-white/70 text-sm leading-relaxed">
                                {metrics.opsRatio < 1 && (
                                  <div className="flex gap-2 items-start text-rose-300 bg-rose-400/10 p-3 rounded-xl border border-rose-400/20 shadow-sm">
                                    <AlertCircle size={18} className="shrink-0" />
                                    <p><strong>{t("report.alerts.bleedingTitle")}</strong> {t("report.alerts.bleedingDesc")}</p>
                                  </div>
                                )}
                                {metrics.runway < 3 && metrics.runway !== Infinity && (
                                  <div className="flex gap-2 items-start text-amber-300 bg-amber-400/10 p-3 rounded-xl border border-amber-400/20 shadow-sm">
                                    <AlertCircle size={18} className="shrink-0" />
                                    <p><strong>{t("report.alerts.shortRunwayTitle")}</strong> {t("report.alerts.shortRunwayDesc")}</p>
                                </div>
                                )}
                                {metrics.opsRatio >= 1.2 && (
                                  <div className="flex gap-2 items-start text-emerald-300 bg-emerald-400/10 p-3 rounded-xl border border-emerald-400/20 shadow-sm">
                                    <CheckCircle2 size={18} className="shrink-0" />
                                    <p><strong>{t("report.alerts.highEfficiencyTitle")}</strong> {t("report.alerts.highEfficiencyDesc")}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-10 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl space-y-6 aksana-glass shadow-sm">
                          <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-slate-600 dark:text-slate-300">{t("report.actionPlan")}</h3>

                          <div className="space-y-4">
                            {[
                              { condition: metrics.opsRatio < 1, task: t("report.tasks.audit") },
                              { condition: metrics.opsRatio < 1.2, task: t("report.tasks.pricing") },
                              { condition: metrics.runway < 3 && metrics.runway !== Infinity, task: t("report.tasks.safetyNet") },
                              { condition: metrics.runway < 6, task: t("report.tasks.arPolicy") },
                              { condition: metrics.score > 70, task: t("report.tasks.surplus") },
                              { condition: true, task: t("report.tasks.update", { period: t(`dashboard.runwayUnit.${periodType}`).toLowerCase() }) }
                            ].filter(item => item.condition).map((item, idx) => (
                              <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-700 group transition-all hover:border-black shadow-sm">
                                <div className="w-6 h-6 rounded-full border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-sm">
                                  <div className="w-2 h-2 rounded-full bg-black dark:bg-white scale-0 group-hover:scale-100 transition-transform"></div>
                                </div>
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{item.task}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      )}        </motion.div>
                      </AnimatePresence>

                      {/* Save Button for User (Synced with Prop) */}
                      {user && (
                      <div className="fixed bottom-8 right-8 z-50">
                      <button
                      onClick={() => handleSave(records)}
                      disabled={isSyncing}
                      className="px-6 py-3 rounded-full bg-black dark:bg-slate-50 text-white dark:text-black font-bold shadow-2xl hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50 border border-white/20"
                      >
                      {isSyncing ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> {t("cloud.save")}</>}
                      </button>
                      </div>
                      )}
    </div>
  );
}
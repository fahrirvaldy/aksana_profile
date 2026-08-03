
"use client";

import { Plus, RotateCcw, CheckCircle2, Trash2, History } from "lucide-react";
import { Record, PeriodType } from "../types";
import { formatCurrency } from "../utils/formatCurrency";

interface InputTabProps {
  t: (key: string, params?: any) => string;
  periodType: PeriodType;
  setPeriodType: (type: PeriodType) => void;
  initialBalance: number;
  setInitialBalance: (balance: number) => void;
  initialBalanceSet: boolean;
  setInitialBalanceSet: (isSet: boolean) => void;
  handleSave: (records: Record[], initialBalanceSet?: boolean, initialBalance?: number) => void;
  entryName: string;
  setEntryName: (name: string) => void;
  inOps: number | "";
  setInOps: (value: number | "") => void;
  inNonOps: number | "";
  setInNonOps: (value: number | "") => void;
  outOps: number | "";
  setOutOps: (value: number | "") => void;
  outNonOps: number | "";
  setOutNonOps: (value: number | "") => void;
  addRecord: () => void;
  records: Record[];
  resetAll: () => void;
  deleteRecord: (id: number) => void;
}

export const InputTab = ({ t, periodType, setPeriodType, initialBalance, setInitialBalance, initialBalanceSet, setInitialBalanceSet, handleSave, entryName, setEntryName, inOps, setInOps, inNonOps, setInNonOps, outOps, setOutOps, outNonOps, setOutNonOps, addRecord, records, resetAll, deleteRecord }: InputTabProps) => {
  return (
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
                  }`}>
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
                onClick={() => { setInitialBalanceSet(true); handleSave(records, true, initialBalance); }}
                className="w-full py-3 rounded-xl bg-black text-white dark:bg-slate-100 dark:text-black text-xs font-bold">
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
              className="w-full py-4 rounded-2xl bg-black dark:bg-slate-50 text-white dark:text-black font-bold transition-all hover:opacity-90 active:scale-[0.98]">
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
  );
}


"use client";

import { Filter } from "lucide-react";
import { FunnelInputs } from "../types";

interface InputsPanelProps {
  t: (key: string) => string;
  inputs: FunnelInputs;
  setInputs: React.Dispatch<React.SetStateAction<FunnelInputs>>;
}

const inputFields = [
  { id: 'budget', label: 'inputs.budget', type: 'currency' },
  { id: 'aov', label: 'inputs.aov', type: 'currency' },
  { id: 'cpm', label: 'inputs.cpm', type: 'currency' },
  { id: 'ctr', label: 'inputs.ctr', type: 'percent' },
  { id: 'visit', label: 'inputs.visit', type: 'percent' },
  { id: 'atc', label: 'inputs.atc', type: 'percent' },
  { id: 'checkout', label: 'inputs.checkout', type: 'percent', fullWidth: true },
];

export const InputsPanel = ({ t, inputs, setInputs }: InputsPanelProps) => {
  return (
    <div className="p-8 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl space-y-8 aksana-glass shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#1E1E1E] text-black dark:text-slate-50 flex items-center justify-center border border-slate-200 dark:border-slate-700">
          <Filter size={20} />
        </div>
        <h3 className="font-bold text-lg text-black dark:text-white">{t("inputs.title")}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-6">
        {inputFields.map(field => (
          <div key={field.id} className={`${field.fullWidth ? 'sm:col-span-2' : ''} space-y-2`}>
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 ml-1 dark:text-slate-300">{t(field.label)}</label>
            <div className="relative">
              {field.type === 'currency' && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300 font-bold text-sm">Rp</span>}
              <input
                type="number"
                step={field.type === 'percent' ? 0.1 : 1}
                value={inputs[field.id as keyof FunnelInputs]}
                onChange={(e) => setInputs(p => ({ ...p, [field.id]: Number(e.target.value) }))}
                className={`w-full py-4 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:border-slate-400 outline-none transition-all font-bold placeholder-slate-400 dark:placeholder-slate-500 ${
                  field.type === 'currency' ? 'pl-12 pr-4' : 'px-4'
                } ${
                  field.fullWidth ? 'text-center' : ''
                }`}
              />
              {field.type === 'percent' && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300 font-bold text-sm">%</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

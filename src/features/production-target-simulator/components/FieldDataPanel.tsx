
"use client";

import { TrendingDown, Clock, Box } from "lucide-react";

interface FieldDataPanelProps {
  t: (key: string) => string;
  salesInput: string;
  setSalesInput: (value: string) => void;
  leadTime: number;
  setLeadTime: (value: number) => void;
  stock: number;
  setStock: (value: number) => void;
}

export const FieldDataPanel = (
  { t, salesInput, setSalesInput, leadTime, setLeadTime, stock, setStock }: FieldDataPanelProps
) => {
  return (
    <div className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-black text-white rounded-lg">
          <TrendingDown size={20} />
        </div>
        <h3 className="font-bold text-lg text-black dark:text-white">{t('data.title')}</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold mb-1.5 ml-1 text-slate-600 dark:text-slate-300">{t('data.sales')}</label>
          <textarea 
            value={salesInput}
            onChange={(e) => setSalesInput(e.target.value)}
            placeholder={t('data.placeholderSales')}
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:ring-2 focus:ring-black transition-all outline-none placeholder-slate-400 dark:placeholder-slate-500 resize-none font-mono text-sm font-semibold"
          />
          <p className="text-[10px] text-slate-600 dark:text-slate-300 font-normal mt-1 ml-1">{t('data.salesNote')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1.5 ml-1 text-slate-600 dark:text-slate-300">{t('data.leadTime')}</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
              <input 
                type="text"
                value={leadTime ? leadTime.toLocaleString('id-ID') : ""}
                onChange={(e) => {
                  const val = e.target.value.replace(/\./g, "");
                  if (/^\d*$/.test(val)) {
                    setLeadTime(val === "" ? 0 : parseInt(val));
                  }
                }}
                placeholder={t('data.placeholderLeadTime')}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:ring-2 focus:ring-black transition-all outline-none placeholder-slate-400 dark:placeholder-slate-500 font-semibold"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1.5 ml-1 text-slate-600 dark:text-slate-300">{t('data.stock')}</label>
            <div className="relative">
              <Box className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
              <input 
                type="text"
                value={stock ? stock.toLocaleString('id-ID') : ""}
                onChange={(e) => {
                  const val = e.target.value.replace(/\./g, "");
                  if (/^\d*$/.test(val)) {
                    setStock(val === "" ? 0 : parseInt(val));
                  }
                }}
                placeholder={t('data.placeholderStock')}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:ring-2 focus:ring-black transition-all outline-none placeholder-slate-400 dark:placeholder-slate-500 font-semibold"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

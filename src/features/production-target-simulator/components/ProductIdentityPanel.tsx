
"use client";

import { Package } from "lucide-react";

interface ProductIdentityPanelProps {
  t: (key: string) => string;
  sku: string;
  setSku: (value: string) => void;
  category: 'magnet' | 'profit';
  setCategory: (value: 'magnet' | 'profit') => void;
}

export const ProductIdentityPanel = ({ t, sku, setSku, category, setCategory }: ProductIdentityPanelProps) => {
  return (
    <div className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600">
          <Package size={20} />
        </div>
        <h3 className="font-semibold text-lg">{t('identity.title')}</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold mb-1.5 ml-1 text-slate-600 dark:text-slate-300">{t('identity.sku')}</label>
          <input 
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder={t('identity.placeholderSku')}
            className="w-full px-4 py-3 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:ring-2 focus:ring-blue-500 transition-all outline-none placeholder-slate-400 dark:placeholder-slate-500 font-semibold"
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-1.5 ml-1 flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            {t('identity.category')}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setCategory('magnet')}
              className={`py-3 rounded-xl border transition-all text-sm font-bold ${
                category === 'magnet' 
                  ? 'bg-slate-900 border-slate-900 text-white dark:bg-slate-50 dark:text-slate-950' 
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E1E1E] text-slate-600 dark:text-slate-300'
              }`}
            >
              {t('identity.magnet')}
            </button>
            <button
              onClick={() => setCategory('profit')}
              className={`py-3 rounded-xl border transition-all text-sm font-bold ${
                category === 'profit' 
                  ? 'bg-slate-900 border-slate-900 text-white dark:bg-slate-50 dark:text-slate-950' 
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E1E1E] text-slate-600 dark:text-slate-300'
              }`}
            >
              {t('identity.profit')}
            </button>
          </div>
          <div className="mt-3 p-3 bg-white dark:bg-[#1E1E1E] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-xs text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
              {category === 'magnet' ? t('identity.magnetDesc') : t('identity.profitDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

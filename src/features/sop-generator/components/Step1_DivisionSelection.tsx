
"use client";

interface Division {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

interface Step1Props {
  t: (key: string) => string;
  divisions: Division[];
  onSelect: (divisionId: string) => void;
}

export const Step1_DivisionSelection = ({ t, divisions, onSelect }: Step1Props) => {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black tracking-tight dark:text-white">{t('step1.title')}</h2>
        <p className="text-slate-600 dark:text-slate-300 font-normal">{t('step1.subtitle')}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {divisions.map((div) => (
          <button
            key={div.id}
            onClick={() => onSelect(div.id)}
            className="p-6 md:p-8 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl hover:border-emerald-500 transition-all text-left flex items-start gap-6 group shadow-sm hover:shadow-emerald-500/5"
          >
            <div className="w-14 h-14 rounded-xl bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:bg-emerald-500/10 transition-all">
              {div.icon}
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-black dark:text-slate-100 uppercase tracking-wide">{div.name}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-normal">{div.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

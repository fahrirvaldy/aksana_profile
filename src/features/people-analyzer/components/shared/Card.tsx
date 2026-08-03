
import React from 'react';

export const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`aksana-glass bg-white dark:bg-[#1E1E1E] backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden transition-all duration-300 ${className}`}>
    {children}
  </div>
);

"use client";

import React, { useState } from "react";
import { 
  Search, 
  Settings, 
  PieChart, 
  Users, 
  Zap, 
  Compass, 
  ArrowRight, 
  X 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

const serviceIcons: { [key: string]: React.ReactNode } = {
  "Business Checkup 360": <Search size={24} />,
  "Growth OS": <Settings size={24} />,
  "Founder Finance Clarity": <PieChart size={24} />,
  "People & Culture Reset": <Users size={24} />,
  "Market & Product Sprint": <Zap size={24} />,
  "Aksana Partner": <Compass size={24} />
};

type Service = {
  title: string;
  tagline: string;
  analogy: string;
  explanation: string;
};

export default function LayananPage() {
  const t = useTranslations('ServicePage');
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const services: Service[] = t.raw('services');

  const handleConsultation = (serviceName: string) => {
    const message = `Halo Aksana, saya tertarik berdiskusi lebih lanjut mengenai layanan ${serviceName}.`;
    const whatsappUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    setSelectedService(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-8 pt-4 pb-20 md:pb-24 min-h-screen font-[family-name:var(--font-inter)]">
      <div className="max-w-3xl mb-24 space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-950 dark:text-slate-50 leading-tight font-[family-name:var(--font-plus-jakarta)]">
          {t.rich('title', {
            italic: (chunks) => <span className="text-slate-700 dark:text-slate-700 italic">{chunks}</span>
          })}
        </h1>
        <p className="text-slate-700 dark:text-slate-400 text-lg md:text-xl leading-relaxed font-normal">
          {t('subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <motion.div 
            key={index} 
            whileHover={{ y: -5 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            onClick={() => setSelectedService(service)}
            className="group cursor-pointer p-10 rounded-[2rem] bg-white/90 dark:bg-slate-900/40 aksana-glass shadow-sm border border-slate-200 dark:border-white/10 space-y-6 relative overflow-hidden"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-950 group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-slate-50 dark:group-hover:bg-slate-50 dark:group-hover:text-slate-950 transition-all duration-500 shadow-sm">
              {serviceIcons[service.title]}
            </div>
            <div className="space-y-3">
              <p className="text-xs font-bold tracking-[0.2em] text-amber-600 dark:text-amber-400 uppercase font-[family-name:var(--font-plus-jakarta)]">
                {service.tagline}
              </p>
              <h3 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-slate-50 font-[family-name:var(--font-plus-jakarta)]">
                {service.title}
              </h3>
              <p className="text-slate-700 dark:text-slate-400 leading-relaxed text-sm font-normal">
                {service.analogy}
              </p>
            </div>
            
            <div className="pt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center gap-2 text-slate-950 dark:text-slate-50 font-bold text-xs tracking-wider">
              {t('detailButton')} <ArrowRight size={14} />
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 flex items-center justify-center z-[60] p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xl"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="max-w-2xl w-[90%] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 relative z-10 border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <button 
                onClick={() => setSelectedService(null)}
                className="absolute top-8 right-8 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-slate-50 transition-colors"
              >
                <X size={24} />
              </button>

              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-950 dark:text-slate-50">
                    {serviceIcons[selectedService.title]}
                  </div>
                  <div>
                    <p className="text-sm font-bold tracking-[0.2em] text-amber-600 dark:text-amber-400 uppercase font-[family-name:var(--font-plus-jakarta)] mb-1">
                      {selectedService.tagline}
                    </p>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-950 dark:text-slate-50 font-[family-name:var(--font-plus-jakarta)]">
                      {selectedService.title}
                    </h2>
                  </div>
                </div>

                <div className="p-6 md:p-8 rounded-3xl bg-amber-50/30 dark:bg-amber-900/10 border border-amber-200/50 space-y-3 shadow-sm">
                  <p className="text-[10px] font-bold tracking-[0.3em] text-amber-600/70 dark:text-amber-400/70 uppercase">
                    {t('modalTitle')}
                  </p>
                  <p className="text-lg md:text-xl text-slate-700 dark:text-slate-200 font-semibold leading-relaxed italic">
                    &ldquo;{selectedService.analogy}&rdquo;
                  </p>
                </div>

                <div className="space-y-4">
                  <p className="text-slate-700 dark:text-slate-400 text-lg leading-relaxed font-normal">
                    {selectedService.explanation}
                  </p>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleConsultation(selectedService.title)}
                  className="w-full bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-950 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 group hover:bg-slate-800 dark:hover:bg-slate-200 transition-all duration-300 cursor-pointer shadow-lg"
                >
                  {t('consultationButton')} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

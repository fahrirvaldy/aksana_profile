"use client";

import { Link } from "@/i18n/routing";
import { ArrowRight, TrendingUp, LayoutGrid, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("HomePage");

  const features = [
    {
      title: t("features.organized.title"),
      description: t("features.organized.description"),
      icon: <LayoutGrid size={24} />,
      color: "text-slate-950"
    },
    {
      title: t("features.growth.title"),
      description: t("features.growth.description"),
      icon: <TrendingUp size={24} />,
      color: "text-amber-600"
    },
    {
      title: t("features.calm.title"),
      description: t("features.calm.description"),
      icon: <Heart size={24} />,
      color: "text-slate-950"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
      {/* Hero Section */}
      <section className="text-center space-y-10 mb-24 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-950 dark:text-[#EEEEEE] leading-[1.15]">
          {t("hero.title")} <br />
          <span className="text-slate-950 dark:text-[#EEEEEE] italic">{t("hero.subtitle")}</span>
        </h1>
        <div className="space-y-6">
          <p className="text-lg md:text-xl text-slate-700 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto font-medium">
            {t("hero.description")}
          </p>
          <p className="text-sm md:text-base text-slate-700 dark:text-slate-400 italic font-medium tracking-wide">
            {t("hero.approach")}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
          <Link href="/layanan" className="px-8 py-4 rounded-2xl bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-950 font-bold transition-all hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2">
            {t("hero.ctaStart")} <ArrowRight size={18} />
          </Link>
          <Link href="/tools" className="px-8 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-950 dark:text-slate-50 font-bold transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm">
            {t("hero.ctaExplore")}
          </Link>
        </div>
      </section>

      {/* Features/Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="p-8 md:p-10 rounded-3xl bg-white/90 dark:bg-slate-900/40 aksana-glass shadow-sm border border-slate-200 dark:border-white/10 space-y-6 group"
          >
            <div className={`w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-center ${feature.color} group-hover:scale-110 transition-transform duration-500`}>
              {feature.icon}
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-bold tracking-tight text-slate-950 dark:text-slate-50">{feature.title}</h3>
              <p className="text-slate-700 dark:text-slate-400 text-sm leading-relaxed font-normal">
                {feature.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight, Box, Shield, Zap, TrendingUp, LayoutGrid, Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const features = [
    {
      title: "Struktur Rapi",
      description: "Transformasi data yang berantakan menjadi sistem yang kokoh dan terorganisir.",
      icon: <LayoutGrid size={24} />,
      color: "text-slate-500"
    },
    {
      title: "Pertumbuhan Terukur",
      description: "Gunakan tools simulasi kami untuk melihat arah progres dan ROI bisnis Anda.",
      icon: <TrendingUp size={24} />,
      color: "text-amber-500/80"
    },
    {
      title: "Ketenangan Operasional",
      description: "Teknologi manusiawi yang dirancang untuk mengurangi beban pikiran pengusaha.",
      icon: <Heart size={24} />,
      color: "text-slate-500"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-8 py-20 md:py-32">
      {/* Hero Section */}
      <section className="text-center space-y-10 mb-24 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-slate-50 leading-[1.15]">
          Menjadikan Bisnis Lebih <br />
          <span className="text-slate-400 dark:text-slate-500 italic">Rapi, Tumbuh, dan Menenangkan.</span>
        </h1>
        <div className="space-y-6">
          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto font-medium">
            Ruang bertumbuh bagi pengusaha untuk berprogres dan membangun fondasi bisnis yang kokoh dan lebih berdaya.
          </p>
          <p className="text-sm md:text-base text-slate-400 dark:text-slate-500 italic font-medium tracking-wide">
            Pendekatan kami: Sederhana, Terukur, dan Manusiawi.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
          <Link href="/layanan" className="px-8 py-4 rounded-2xl bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-900 font-semibold transition-all hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2">
            Mulai Sekarang <ArrowRight size={18} />
          </Link>
          <Link href="/tools" className="px-8 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 font-semibold transition-all hover:bg-slate-50 dark:hover:bg-slate-900">
            Jelajahi Tools
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
            className="p-10 rounded-3xl bg-white/70 dark:bg-slate-900/40 aksana-glass shadow-sm space-y-6 group"
          >
            <div className={`w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center ${feature.color} group-hover:scale-110 transition-transform duration-500`}>
              {feature.icon}
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{feature.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">
                {feature.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

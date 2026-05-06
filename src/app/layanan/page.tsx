"use client";

import { BarChart, Code2, Globe, Layout, Search, Smartphone, Layers, Cpu, Users } from "lucide-react";
import { motion } from "framer-motion";

const services = [
  { title: "Sistem Manajemen Terpadu", description: "Membangun fondasi digital yang mengintegrasikan seluruh operasional bisnis Anda secara presisi.", icon: <Layers size={24} /> },
  { title: "Otomatisasi Proses Bisnis", description: "Mengurangi beban repetitif melalui teknologi cerdas agar Anda fokus pada pengambilan keputusan strategis.", icon: <Cpu size={24} /> },
  { title: "Dashboard & Analitik Progres", description: "Visualisasi data yang jernih untuk memantau kesehatan bisnis dan merencanakan langkah pertumbuhan ke depan.", icon: <BarChart size={24} /> },
  { title: "Pengembangan Software Khusus", description: "Solusi perangkat lunak yang dirancang unik mengikuti pola pikir dan kebutuhan spesifik pengusaha.", icon: <Code2 size={24} /> },
  { title: "Pendampingan Transformasi", description: "Bukan sekadar instalasi tools, kami mendampingi tim Anda dalam mengadopsi budaya kerja berbasis data.", icon: <Users size={24} /> },
  { title: "Optimasi Ekosistem Digital", description: "Menyelaraskan seluruh instrumen digital Anda agar bekerja secara harmonis dan efisien.", icon: <Globe size={24} /> },
];

export default function LayananPage() {
  return (
    <div className="max-w-7xl mx-auto px-8 py-20 md:py-24 min-h-screen">
      <div className="max-w-3xl mb-24 space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-50 leading-tight">
          Solusi Terintegrasi untuk Bisnis yang <span className="text-slate-400 dark:text-slate-500 italic">Lebih Berdaya</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl leading-relaxed font-medium">
          Kami menghadirkan layanan yang menggabungkan presisi teknologi dengan pemahaman mendalam atas tantangan nyata pengusaha. Bukan sekadar digitalisasi, melainkan penyelarasan sistem untuk pertumbuhan yang berkelanjutan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <motion.div 
            key={index} 
            whileHover={{ y: -5 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="group p-10 rounded-3xl bg-white/70 dark:bg-slate-900/40 aksana-glass shadow-sm space-y-6"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-500 group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-slate-50 dark:group-hover:bg-slate-50 dark:group-hover:text-slate-900 transition-all duration-500">
              {service.icon}
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{service.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm font-medium">
                {service.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

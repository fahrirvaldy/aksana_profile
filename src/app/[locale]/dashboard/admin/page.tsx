"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { 
  Loader2, 
  ArrowLeft, 
  ExternalLink, 
  Users, 
  MessageSquare,
  ShieldCheck,
  Search
} from "lucide-react";
import Link from "next/link";

interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  business_challenge: string;
  created_at: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (error || profile?.role !== 'admin') {
        router.push("/tools");
        return;
      }

      setIsAdmin(true);
      fetchLeads();
    };

    checkAdmin();
  }, [router]);

  const fetchLeads = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone_number, business_challenge, created_at')
      .eq('role', 'guest')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLeads(data as Lead[]);
    }
    setIsLoading(false);
  };

  const filteredLeads = leads.filter(lead => 
    lead.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.phone_number?.includes(searchQuery)
  );

  const formatWA = (phone: string) => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    }
    return `https://wa.me/${cleaned}`;
  };

  if (isLoading && !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="animate-spin text-slate-700" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 font-inter">
      {/* Navigation & Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="space-y-2">
          <Link href="/tools" className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-slate-50 transition-colors group mb-2">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Kembali ke Katalog
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Lead Management</h1>
            <div className="px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-500 text-[10px] font-bold uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-1.5 shadow-sm">
              <ShieldCheck size={12} /> Admin Mode
            </div>
          </div>
          <p className="text-slate-700 dark:text-slate-400">Kelola calon klien yang masuk melalui gerbang tools dan kontak.</p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama, email, atau WA..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-800 outline-none transition-all text-sm"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-slate-900 border border-black dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden aksana-glass">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-slate-300" size={32} />
            <p className="text-sm text-slate-700 font-medium">Sinkronisasi data...</p>
          </div>
        ) : filteredLeads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse shadow-sm">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-black dark:border-slate-800 shadow-sm">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-700">Calon Klien</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-700">Kontak</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-700">Keluhan Bisnis</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-700 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-700 dark:text-slate-50">{lead.full_name}</p>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 text-[10px] font-bold uppercase tracking-tighter">
                            New Lead
                          </span>
                          <span className="text-[10px] text-slate-700 font-medium italic">
                            {new Date(lead.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <p className="text-sm text-slate-700 dark:text-slate-400 font-medium">{lead.email}</p>
                        <p className="text-sm text-slate-700">{lead.phone_number}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="max-w-xs">
                        <p className="text-sm text-slate-700 dark:text-slate-400 line-clamp-2 italic leading-relaxed">
                          "{lead.business_challenge || 'Tidak ada pesan khusus.'}"
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <a 
                        href={formatWA(lead.phone_number)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-950 text-xs font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-sm"
                      >
                        <MessageSquare size={14} />
                        Hubungi via WA
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-400 mb-6">
              <Users size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-950 dark:text-slate-50 mb-2">
              {searchQuery ? "Pencarian tidak ditemukan" : "Belum ada calon klien yang mendaftar"}
            </h3>
            <p className="text-sm text-slate-700 max-w-sm leading-relaxed">
              {searchQuery ? "Cari gunakan kata kunci lain untuk menemukan data leads." : "Data akan muncul di sini secara real-time begitu seseorang mengisi formulir kontak atau gerbang tools."}
            </p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-8 flex justify-between items-center text-[10px] text-slate-700 font-bold uppercase tracking-widest px-2">
        <p>Total Leads: {filteredLeads.length}</p>
        <p>Aksana Business Lab &bull; Administrative Portal</p>
      </div>
    </div>
  );
}

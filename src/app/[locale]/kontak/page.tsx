"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function KontakPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);
    setSuccessMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .insert([
          { 
            full_name: formData.name, 
            email: formData.email,
            business_challenge: formData.message,
            role: 'guest'
          }
        ]);

      if (error) throw error;

      // Handle Success
      setSuccessMessage("Terima kasih! Pesan Anda telah kami terima. Tim Aksana akan segera menghubungi Anda.");
      setFormData({ name: "", email: "", message: "" });
    } catch (error: any) {
      // Handle Graceful Failure (Amber color as requested)
      setFormError(error.message || "Maaf, terjadi kendala saat mengirim pesan. Silakan coba beberapa saat lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-8 py-20">
      <div className="space-y-6 mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-950 dark:text-slate-50">Hubungi Kami</h1>
        <p className="text-slate-700 dark:text-slate-400 font-normal">
          Ada pertanyaan atau ingin berkolaborasi? Kami siap mendengarkan.
        </p>
      </div>

      <div className="p-8 md:p-12 rounded-[2.5rem] bg-white/95 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        {successMessage ? (
          <div className="text-center py-10 space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-slate-50 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <p className="text-lg font-medium text-slate-700 dark:text-slate-50 leading-relaxed">
              {successMessage}
            </p>
            <button 
              onClick={() => setSuccessMessage(null)}
              className="text-sm font-semibold text-slate-950 hover:text-slate-950 dark:hover:text-slate-50 transition-colors"
            >
              Kirim pesan lain
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-semibold text-slate-950 dark:text-slate-50">Nama Lengkap</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 focus:border-slate-400 outline-none transition-all font-medium"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-slate-950 dark:text-slate-50">Email</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full px-4 py-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 focus:border-slate-400 outline-none transition-all font-medium"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-semibold text-slate-950 dark:text-slate-50">Pesan</label>
              <textarea
                id="message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                placeholder="Bagaimana kami bisa membantu Anda?"
                className="w-full px-4 py-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 focus:border-slate-400 outline-none transition-all resize-none font-medium"
                required
                disabled={isLoading}
              ></textarea>
            </div>

            {formError && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 text-amber-600 dark:text-amber-500 text-sm font-medium shadow-sm">
                {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-950 font-bold transition-all hover:opacity-90 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Mengirim...
                </>
              ) : (
                "Kirim Pesan"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

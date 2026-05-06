"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Redirect to dashboard on success
      router.push("/dashboard");
    } catch (error: any) {
      // Graceful Failure UI (Amber/Orange)
      setAuthError(error.message || "Email atau password yang Anda masukkan salah.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-8 py-20">
      <div className="w-full max-w-md p-8 md:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Selamat Datang</h1>
          <p className="text-slate-500 dark:text-slate-400">Masuk ke akun Aksana Anda</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-slate-400 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
              <Link 
                href="/kontak" 
                className="text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-amber-600 transition-colors"
              >
                Lupa password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-slate-400 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all p-1"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-900 font-bold transition-all hover:opacity-90 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Memverifikasi...
                </>
              ) : (
                "Masuk"
              )}
            </button>

            {authError && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 text-amber-600 dark:text-amber-500 text-sm font-medium animate-in fade-in slide-in-from-top-1 duration-300">
                {authError}
              </div>
            )}
          </div>
        </form>

        <p className="text-center text-sm text-slate-500 leading-relaxed">
          Akses terbatas untuk klien eksklusif Aksana. <br />
          <Link href="/kontak" className="font-semibold text-slate-900 dark:text-slate-50 hover:underline underline-offset-4">
            Hubungi tim kami
          </Link> untuk mendapatkan akun.
        </p>
      </div>
    </div>
  );
}

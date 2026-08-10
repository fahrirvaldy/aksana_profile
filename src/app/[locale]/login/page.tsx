"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const t = useTranslations('LoginPage');
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

      // Redirect to tools on success (Dashboard is hidden)
      router.push("/tools");
    } catch (error: unknown) {
      // Graceful Failure UI (Amber/Orange)
      let message: string;
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      } else {
        message = t('errorMessage');
      }
      setAuthError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-8 py-20">
      <div className="w-full max-w-md p-10 md:p-14 rounded-[2.5rem] bg-white/95 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-8 shadow-sm">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-50">{t('title')}</h1>
          <p className="text-slate-700 dark:text-slate-400 font-normal">{t('subtitle')}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-slate-950 dark:text-slate-50">{t('emailLabel')}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('emailPlaceholder')}
              className="w-full px-4 py-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 focus:border-slate-400 outline-none transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label htmlFor="password" className="text-sm font-semibold text-slate-950 dark:text-slate-50">{t('passwordLabel')}</label>
              <Link 
                href="/kontak" 
                className="text-[11px] font-bold uppercase tracking-wider text-slate-700 hover:text-slate-950 transition-colors"
              >
                {t('forgotPassword')}
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 pr-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 focus:border-slate-400 outline-none transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-all p-1"
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
              className="w-full py-4 rounded-xl bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-950 font-bold transition-all hover:opacity-90 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  {t('verifying')}
                </>
              ) : (
                t('submitButton')
              )}
            </button>

            {authError && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 text-amber-600 dark:text-amber-500 text-sm font-medium animate-in fade-in slide-in-from-top-1 duration-300 shadow-sm">
                {authError}
              </div>
            )}
          </div>
        </form>

        <p className="text-center text-sm text-slate-700 leading-relaxed font-normal">
          {t('restrictedAccess')}
          <Link href="/kontak" className="font-bold text-slate-950 dark:text-slate-50 hover:underline underline-offset-4">
            {t('contactUs')}
          </Link>
          {t('getAccount')}
        </p>
      </div>
    </div>
  );
}

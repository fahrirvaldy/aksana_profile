"use client";import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import aksanaLogo from "@/assets/image/logo.png";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./layout/LanguageSwitcher";
import { Menu, X, UserCircle, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from "framer-motion";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const isLoggedIn = !isLoading && !!user;
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('Navigation');  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
  }, []);  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMobileMenuOpen(false);
    router.push("/login");
  };  const navLinks = [
    { name: t('services'), href: "/layanan" },
    { name: t('tools'), href: "/tools" },
    { name: t('contact'), href: "/kontak" },
  ];  return (
    <header className="fixed top-0 w-full z-50">
      <nav className={`
        w-full h-20 transition-all duration-500
        bg-white dark:bg-slate-950/90 dark:backdrop-blur-md
        ${isScrolled ? "border-b border-black dark:border-slate-800 shadow-sm" : "border-b border-transparent"}
      `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 w-full h-full flex justify-between items-center">
          {/* Branding Sisi Kiri */}
          <Link href="/" className="flex items-center gap-4 shrink-0 group">
            <Image 
              src={aksanaLogo} 
              alt="Aksana Logo" 
              width={32} 
              height={32} 
              priority
              className="object-contain dark:brightness-110 group-hover:scale-105 transition-transform duration-500" 
            />
            <span className="text-[14px] font-bold tracking-[0.4em] uppercase text-slate-950 dark:text-slate-50 hidden sm:block">
              Aksana Business Lab
            </span>
          </Link>          {/* Menu & Aksi Sisi Kanan */}
          <div className="flex items-center gap-6 lg:gap-10">
            {/* Menu Desktop */}
            <div className="hidden md:flex items-center gap-10">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link 
                    key={link.name}
                    href={link.href}
                    className={`relative py-1 text-base transition-colors ${
                      isActive 
                        ? "text-slate-950 dark:text-slate-50 font-semibold" 
                        : "text-slate-700 dark:text-slate-400 font-medium hover:text-slate-950 dark:hover:text-slate-50"
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-slate-900 dark:bg-slate-50 rounded-full"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>            <div className="flex items-center gap-4">
              <div className="hidden items-center gap-4 md:flex">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
              
              <div className="hidden md:block border-l border-black dark:border-slate-800 h-5 mx-2 shadow-sm"></div>              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-950 text-sm font-bold uppercase tracking-widest transition-all hover:opacity-90 active:scale-95 cursor-pointer"
                >
                  <LogOut size={18} />
                  <span>{t('logout') || 'Logout'}</span>
                </button>
              ) : (
                <Link 
                  href="/login"
                  className="hidden md:inline-flex px-6 py-2.5 rounded-xl border border-black dark:border-slate-800 text-sm font-bold uppercase tracking-widest text-slate-950 dark:text-slate-50 hover:bg-slate-900 hover:text-white dark:hover:bg-slate-50 dark:hover:text-slate-950 transition-all shadow-none"
                >
                  {t('login')}
                </Link>
              )}              {/* Mobile Menu Toggle */}
              <button 
                className="md:hidden p-2 text-slate-950 dark:text-slate-50 hover:text-slate-950 dark:hover:text-slate-50 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden w-full bg-white dark:bg-slate-950 border-b border-black dark:border-slate-800 overflow-hidden aksana-glass shadow-sm"
            >
              <div className="px-4 sm:px-6 md:px-8 py-10 space-y-6">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link 
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block text-base transition-colors ${
                        isActive 
                          ? "text-slate-950 dark:text-slate-50 font-bold" 
                          : "text-slate-700 dark:text-slate-400 font-medium"
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
                <div className="pt-8 border-t border-black dark:border-slate-800 flex items-center justify-between shadow-none">
                  <div className="flex items-center gap-4">
                    <LanguageSwitcher />
                    <ThemeToggle />
                  </div>
                  {isLoggedIn ? (
                    <button 
                      onClick={handleLogout}
                      className="px-8 py-3 rounded-xl bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-950 text-sm font-bold uppercase tracking-widest cursor-pointer"
                    >
                      {t('logout') || 'Logout'}
                    </button>
                  ) : (
                    <Link 
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-8 py-3 rounded-xl bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-950 text-sm font-bold uppercase tracking-widest"
                    >
                      {t('login')}
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}

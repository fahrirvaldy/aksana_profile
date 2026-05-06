"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import aksanaLogo from "@/assets/image/logo.png";
import { ThemeToggle } from "./ThemeToggle";
import { Menu, X, UserCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { AnimatePresence, motion } from "framer-motion";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkUser();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Layanan", href: "/layanan" },
    { name: "Tools", href: "/tools" },
    { name: "Kontak", href: "/kontak" },
  ];

  return (
    <header className="fixed top-0 w-full z-50">
      <nav className={`
        w-full h-20 transition-all duration-500
        bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl
        ${isScrolled ? "border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm" : "border-b border-transparent"}
      `}>
        <div className="max-w-7xl mx-auto px-8 w-full h-full flex justify-between items-center">
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
            <span className="text-[14px] font-bold tracking-[0.4em] uppercase text-slate-900 dark:text-slate-50 hidden sm:block">
              Aksana Business Lab
            </span>
          </Link>

          {/* Menu & Aksi Sisi Kanan */}
          <div className="flex items-center gap-10">
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
                        ? "text-slate-900 dark:text-slate-50 font-semibold" 
                        : "text-slate-600 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-slate-50"
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
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              
              <div className="hidden md:block border-l border-slate-200 dark:border-slate-800 h-5 mx-2"></div>

              {isLoggedIn ? (
                <Link 
                  href="/dashboard"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-900 text-sm font-bold uppercase tracking-widest transition-all hover:opacity-90 active:scale-95"
                >
                  <UserCircle size={18} />
                  <span>Dasbor</span>
                </Link>
              ) : (
                <Link 
                  href="/login"
                  className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-slate-50 hover:bg-slate-900 hover:text-white dark:hover:bg-slate-50 dark:hover:text-slate-900 transition-all"
                >
                  Login
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button 
                className="md:hidden p-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl"
            >
              <div className="px-8 py-10 space-y-6">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link 
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block text-base transition-colors ${
                        isActive 
                          ? "text-slate-900 dark:text-slate-50 font-bold" 
                          : "text-slate-600 dark:text-slate-400 font-medium"
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
                <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <ThemeToggle />
                  <Link 
                    href={isLoggedIn ? "/dashboard" : "/login"}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-8 py-3 rounded-xl bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-900 text-sm font-bold uppercase tracking-widest"
                  >
                    {isLoggedIn ? "Dasbor" : "Login"}
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}

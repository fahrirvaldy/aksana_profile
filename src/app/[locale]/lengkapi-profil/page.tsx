"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

interface Company {
  id: string;
  name: string;
}

export default function LengkapiProfilPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);

      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('id, name');

      if (companiesError) {
        setError('Gagal memuat daftar perusahaan.');
      } else {
        setCompanies(companiesData || []);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !fullName || !companyId) {
      setError('Nama Lengkap dan Perusahaan wajib diisi.');
      return;
    }

    setIsSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone_number: phoneNumber,
        company_id: companyId,
      })
      .eq('id', userId);

    if (updateError) {
      setError('Gagal menyimpan profil. Silakan coba lagi.');
      console.error('Profile update error:', updateError);
    } else {
      router.push('/dashboard'); // Redirect to dashboard after successful save
    }

    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-700" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-2xl font-bold text-center">Lengkapi Profil Anda</h2>
          <p className="mt-2 text-sm text-center text-slate-600 dark:text-slate-400">
            Informasi ini dibutuhkan untuk pengalaman yang lebih baik.
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSaveProfile}>
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-medium">Nama Lengkap</label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-slate-500 focus:border-slate-500"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="phoneNumber" className="text-sm font-medium">Nomor Telepon (Opsional)</label>
            <input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-slate-500 focus:border-slate-500"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="company" className="text-sm font-medium">Perusahaan</label>
            <select
              id="company"
              required
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-slate-500 focus:border-slate-500"
            >
              <option value="" disabled>Pilih perusahaan Anda</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="animate-spin" /> : 'Simpan dan Lanjutkan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

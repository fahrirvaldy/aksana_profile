"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';

export function ProfileChecker({ children }: { children: React.ReactNode }) {
  const { user, isLoading: loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) {
      return; // Wait until user session is loaded
    }

    // Don't run checker if user is not logged in, or is on the login/onboarding page already
    if (!user || pathname.includes('/login') || pathname.includes('/lengkapi-profil')) {
      return;
    }

    const checkProfile = async () => {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error("Error fetching profile for check:", error);
        return;
      }

      // If profile is incomplete, redirect to the onboarding page
      if (profile && !profile.full_name) {
        router.push('/lengkapi-profil');
      }
    };

    checkProfile();
  }, [user, loading, router, pathname]);

  return <>{children}</>;
}

"use client";

import { supabase } from "./client";
import { User } from "@supabase/supabase-js";
import { v4 as uuidv4 } from 'uuid';

// Nama tabel
const USER_TOOLS_HISTORY_TABLE = 'user_tools_history';
const L10_MEETING_HISTORY_TABLE = 'l10_meeting_history';

// Mengambil data untuk tool tertentu milik user
export const getToolData = async (user: User, toolSlug: string): Promise<Record<string, unknown> | null> => {
  try {
    const { data, error } = await supabase
      .from(USER_TOOLS_HISTORY_TABLE)
      .select('saved_state')
      .eq('profile_id', user.id)
      .eq('tool_slug', toolSlug);

    if (error) {
      throw error;
    }

    return (data && data.length > 0) ? data[0].saved_state as Record<string, unknown> : null;
  } catch (error: unknown) {
    console.error(`Error fetching data for ${toolSlug}. Full error:`, JSON.stringify(error, null, 2));
    return null;
  }
};

// Menyimpan atau memperbarui data untuk tool tertentu, dan mencatat riwayat untuk L10 Meeting
export const saveToolData = async (user: User, toolSlug: string, toolData: Record<string, unknown>): Promise<boolean> => {
  try {
    // 1. Simpan state terakhir ke user_tools_history (UPSERT)
    const { error: upsertError } = await supabase
      .from(USER_TOOLS_HISTORY_TABLE)
      .upsert({
        profile_id: user.id,
        tool_slug: toolSlug,
        saved_state: toolData,
        updated_at: new Date().toISOString(),
      }, { 
        onConflict: 'profile_id, tool_slug' 
      });

    if (upsertError) {
      throw upsertError;
    }

    // 2. Jika ini adalah L10 Meeting, simpan juga ke tabel riwayat (INSERT)
    if (toolSlug === 'l10-meeting') {
      const { error: insertError } = await supabase
        .from(L10_MEETING_HISTORY_TABLE)
        .insert({
          profile_id: user.id,
          meeting_id: uuidv4(), // Generate ID unik untuk setiap record riwayat
          meeting_data: toolData,
        });

      if (insertError) {
        // Jika insert riwayat gagal, log error tapi jangan sampai menggagalkan operasi utama
        console.error(`Error saving L10 meeting history. Full error:`, JSON.stringify(insertError, null, 2));
      }
    }

    return true;
  } catch (error) {
    console.error(`Error saving data for ${toolSlug}. Full error:`, JSON.stringify(error, null, 2));
    return false;
  }
};

// Mengambil riwayat L10 meeting untuk seorang pengguna
export const getL10MeetingHistory = async (user: User): Promise<any[] | null> => {
  try {
    const { data, error } = await supabase
      .from(L10_MEETING_HISTORY_TABLE)
      .select('*')
      .eq('profile_id', user.id)
      .order('saved_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error fetching L10 meeting history. Full error:`, JSON.stringify(error, null, 2));
    return null;
  }
}

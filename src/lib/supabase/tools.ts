
"use client";

import { supabase } from "./client";
import { User } from "@supabase/supabase-js";

// Menggunakan tabel yang benar
const TABLE_NAME = 'user_tools_history';

// Mengambil data untuk tool tertentu milik user
export const getToolData = async (user: User, toolSlug: string): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      // Mengambil dari kolom 'saved_state'
      .select('saved_state')
      .eq('profile_id', user.id)
      // Mencocokkan dengan kolom 'tool_slug' yang baru
      .eq('tool_slug', toolSlug);

    if (error) {
      throw error;
    }

    // Kembalikan 'saved_state' dari baris pertama, atau null jika tidak ada
    return (data && data.length > 0) ? data[0].saved_state : null;
  } catch (error: any) {
    console.error(`Error fetching data for ${toolSlug}. Full error:`, JSON.stringify(error, null, 2));
    return null;
  }
};

// Menyimpan atau memperbarui data untuk tool tertentu
export const saveToolData = async (user: User, toolSlug: string, toolData: any): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert({
        profile_id: user.id,
        // Menyimpan ke kolom 'tool_slug' yang baru
        tool_slug: toolSlug,
        // Menyimpan data ke kolom 'saved_state'
        saved_state: toolData,
      }, { 
        // Menggunakan constraint 'profile_id, tool_slug' yang baru
        onConflict: 'profile_id, tool_slug' 
      });

    if (error) {
      throw error;
    }
    return true;
  } catch (error) {
    console.error(`Error saving data for ${toolSlug}. Full error:`, JSON.stringify(error, null, 2));
    return false;
  }
};

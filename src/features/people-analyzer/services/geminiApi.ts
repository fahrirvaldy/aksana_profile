
import { Seat, PsychoScores } from "../types";

export const generatePsychometricProfile = async (divisions: string[]): Promise<Record<string, Seat> | null> => {
  const prompt = `Tentukan standar skor psikometrik (skala 0-100) yang ideal untuk masing-masing divisi/peran berikut: ${divisions.join(", ")}. Nilai 4 kategori ini: creativity (kreativitas/inovasi), leadership (kepemimpinan/pengaruh), detail (ketelitian/analisis), dan execution (kecepatan eksekusi/logika teknis). Berikan nilai yang logis sesuai sifat pekerjaannya.`

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: {
      parts: [{ text: "Anda adalah konsultan HR. Output harus murni JSON Array tanpa markdown." }]
    },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            divisionName: { type: "STRING" },
            req: {
              type: "OBJECT",
              properties: {
                creativity: { type: "INTEGER" },
                leadership: { type: "INTEGER" },
                detail: { type: "INTEGER" },
                execution: { type: "INTEGER" }
              }
            }
          }
        }
      }
    }
  };

  const maxRetries = 3;
  const delays = [1000, 3000, 5000];
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      
      const data = await response.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (textResponse) {
        const cleanedText = textResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsedArray = JSON.parse(cleanedText);
        
        const profiles: Record<string, Seat> = {};
        parsedArray.forEach((item: { divisionName: string, req: PsychoScores }) => {
          if (item.divisionName && item.req) {
             profiles[item.divisionName] = { req: item.req };
          }
        });
        return profiles;
      }
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i === maxRetries - 1) {
        console.error("AI Error after all retries:", error);
        return null;
      }
      await new Promise(res => setTimeout(res, delays[i]));
    }
  }
  return null;
};

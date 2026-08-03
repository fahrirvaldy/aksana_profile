
import React from 'react';

export const handleDownloadImage = async (captureRef: React.RefObject<HTMLDivElement | null>, t: (key: string) => string) => {
  if (!captureRef.current) return;
  
  try {
    const domtoimage = (await import('dom-to-image-more')).default;
    const dataUrl = await domtoimage.toPng(captureRef.current, {
      quality: 1.0,
      bgcolor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#f8fafc',
      filter: (node) => {
        return (node as HTMLElement).getAttribute ? (node as HTMLElement).getAttribute('data-export-ignore') !== 'true' : true;
      }
    });
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `aksana-report-${new Date().getTime()}.png`;
    link.click();
  } catch (err) {
    console.error("Gagal export:", err);
  }
};

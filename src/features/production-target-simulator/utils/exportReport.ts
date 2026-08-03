
export const downloadReport = async (sku: string, t: (key: string) => string) => {
  const element = document.getElementById('report-area');
  if (!element) return;
  
  const btn = document.getElementById('btn-download');
  if (!btn) return;
  const originalHTML = btn.innerHTML;
  btn.innerHTML = `<span>⏳</span> <span class="hidden sm:inline">${t('analysis.processing')}</span>`;

  try {
      const domtoimage = (await import('dom-to-image-more')).default;
      const isDark = document.documentElement.classList.contains('dark');
      
      const dataUrl = await domtoimage.toPng(element, {
          quality: 1.0,
          bgcolor: isDark ? '#0f172a' : '#fbfbfd',
      });

      const link = document.createElement('a');
      const cleanSkuName = sku.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() || t('analysis.untitled').replace(/\s+/g, '-').toLowerCase();
      link.download = `${t('analysis.reportFilename')}${cleanSkuName}.png`;
      link.href = dataUrl;
      link.click();
  } catch (err) {
      console.error(t('analysis.errorTitle'), err);
      alert(t('analysis.errorAlert'));
  } finally {
      btn.innerHTML = originalHTML;
  }
};

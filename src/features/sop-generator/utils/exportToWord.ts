
interface ExportData {
  title: string;
  divisionName: string;
  formData: Record<string, string>;
  t: (key: string, params?: Record<string, any>) => string;
}

export const exportToWord = ({ title, divisionName, formData, t }: ExportData) => {
  
  const tableRows = Object.entries(formData).map(([key, value]) => {
    // PROSES PENGGANTIAN KARAKTER DI LUAR TEMPLATE STRING HTML
    const processedValue = value.split(`\n`).join('<br>');
    return `
      <tr>
        <td style='padding:10px; background-color:#f3f4f6; font-weight:bold; width:30%;'>${key}</td>
        <td style='padding:10px;'>${processedValue}</td>
      </tr>
    `;
  }).join('');

  const content = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>${title}</title></head>
    <body>
      <h1 style='text-align:center;'>${t('export.docTitle')}</h1>
      <h2 style='text-align:center;'>${t('export.divisi', { name: divisionName })}</h2>
      <hr>
      <table border='1' style='width:100%; border-collapse:collapse;'>
        ${tableRows}
      </table>
      <br>
      <h3>${t('export.riskAnalysis')}</h3>
      <p>${t('export.riskRecommendation')}</p>
      <h3>${t('export.kpiTitle')}</h3>
      <ul>
        <li>${t('export.accuracy')}</li>
        <li>${t('export.sla')}</li>
      </ul>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title.replace(/\s+/g, '_')}.doc`;
  link.click();
  URL.revokeObjectURL(url);
};

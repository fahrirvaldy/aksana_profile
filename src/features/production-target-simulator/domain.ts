
export const calculateProductionResults = (salesInput: string, category: 'magnet' | 'profit', leadTime: number, stock: number) => {
  const parts = salesInput.split(/[,]/).map(s => s.trim()).filter(s => s !== "");
  const salesArray = parts.map(s => {
    const clean = s.replace(/\./g, "").replace(/,/g, ".");
    return parseFloat(clean);
  }).filter(n => !isNaN(n));

  if (salesArray.length < 2) return null;

  const sum = salesArray.reduce((a, b) => a + b, 0);
  const meanMonthly = sum / salesArray.length;
  const varianceMonthly = salesArray.reduce((a, b) => a + Math.pow(b - meanMonthly, 2), 0) / (salesArray.length - 1);
  const stdDevMonthly = Math.sqrt(varianceMonthly);
  const avgDailySales = meanMonthly / 30;
  const stdDevDaily = stdDevMonthly / Math.sqrt(30);
  const zScore = category === 'magnet' ? 2.05 : 1.28;
  const safetyStock = zScore * stdDevDaily * Math.sqrt(leadTime || 1);
  const leadTimeDemand = avgDailySales * (leadTime || 1);
  const rop = leadTimeDemand + safetyStock;
  const targetProduction = Math.max(0, (rop + leadTimeDemand) - stock);

  return {
    avgDailySales,
    stdDevMonthly,
    stdDevDaily,
    safetyStock,
    rop,
    targetProduction,
    zScore,
    leadTime: leadTime || 1,
    isAlert: stock <= rop
  };
};


import { Metrics } from "./types";

export const calculateDerived = (m: Metrics) => {
  const customers = Math.floor(m.leads * (m.conv / 100));
  const revenue = customers * m.trans * m.sale;
  const profit = revenue * (m.margin / 100);
  return { customers, revenue, profit };
};

export const calculateHealthMetrics = (
  currentDerived: { customers: number; profit: number },
  marketingCost: number,
  fixedCost: number,
  period: 'Bulan' | 'Tahun',
  currentMargin: number
) => {
  const cac = marketingCost / (currentDerived.customers || 1);
  const ltv = (currentDerived.profit / (currentDerived.customers || 1)) * (period === 'Bulan' ? 12 : 1);
  const bepRevenue = fixedCost / (currentMargin / 100 || 0.01);
  const ltvCacRatio = ltv / (cac || 1);

  return { cac, ltv, bepRevenue, ltvCacRatio };
};

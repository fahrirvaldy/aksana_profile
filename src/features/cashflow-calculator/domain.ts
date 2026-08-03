
import { Record } from "./types";

export const calculateMetrics = (records: Record[], initialBalance: number) => {
  if (records.length === 0) {
    return { 
      avgNetFlow: 0, 
      opsRatio: 0, 
      runway: 0, 
      score: 0, 
      finalBalance: initialBalance 
    };
  }

  const totalNetFlow = records.reduce((acc, r) => acc + r.netFlow, 0);
  const avgNetFlow = totalNetFlow / records.length;
  
  const totalInOps = records.reduce((acc, r) => acc + r.inOps, 0);
  const totalOutOps = records.reduce((acc, r) => acc + r.outOps, 0);
  const opsRatio = totalOutOps > 0 ? totalInOps / totalOutOps : (totalInOps > 0 ? 2 : 0);

  const finalBalance = records[records.length - 1].balance;
  const runway = avgNetFlow < 0 ? Math.abs(finalBalance / avgNetFlow) : Infinity;

  // Health Score Logic
  let score = 50;
  if (opsRatio > 1.1) score += 20;
  else if (opsRatio < 1) score -= 20;
  
  if (avgNetFlow > 0) score += 15;
  else score -= 10;

  if (runway > 6) score += 15;
  else if (runway < 2) score -= 15;

  score = Math.max(0, Math.min(100, score));

  return { avgNetFlow, opsRatio, runway, score, finalBalance };
};

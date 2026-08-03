
import { Employee, Seat, PsychoScores } from "./types";

export const calculateAnomalies = (empPsycho: PsychoScores, seatReq: PsychoScores) => {
  const anomalies: { trait: string, val: number, req: number }[] = [];
  if (empPsycho.creativity < seatReq.creativity - 15) anomalies.push({ trait: 'Kreativitas', val: empPsycho.creativity, req: seatReq.creativity });
  if (empPsycho.leadership < seatReq.leadership - 15) anomalies.push({ trait: 'Kepemimpinan', val: empPsycho.leadership, req: seatReq.leadership });
  if (empPsycho.detail < seatReq.detail - 15) anomalies.push({ trait: 'Ketelitian', val: empPsycho.detail, req: seatReq.detail });
  if (empPsycho.execution < seatReq.execution - 15) anomalies.push({ trait: 'Eksekusi', val: empPsycho.execution, req: seatReq.execution });
  return anomalies;
};

export const findBestFit = (activeEmp: Employee, seats: Record<string, Seat>): string | null => {
  let bestFit: string | null = null;
  let bestScore = -1;

  Object.keys(seats).forEach(role => {
    if (role === activeEmp.role) return;
    const req = seats[role].req;
    const empPsycho = activeEmp.psycho;
    
    const matchScore = 
      (100 - Math.abs(empPsycho.creativity - req.creativity)) +
      (100 - Math.abs(empPsycho.detail - req.detail)) +
      (100 - Math.abs(empPsycho.leadership - req.leadership)) +
      (100 - Math.abs(empPsycho.execution - req.execution));
    
    if (matchScore > bestScore && matchScore > 320) { 
      bestScore = matchScore;
      bestFit = role;
    }
  });

  return bestFit;
}

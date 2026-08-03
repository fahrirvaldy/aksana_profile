
export interface Record {
  id: number;
  name: string;
  inOps: number;
  inNonOps: number;
  outOps: number;
  outNonOps: number;
  totalIn: number;
  totalOut: number;
  netFlow: number;
  balance: number;
}

export interface CashflowCalculatorInitialData {
  periodType?: PeriodType;
  initialBalance?: number;
  initialBalanceSet?: boolean;
  records?: Record[];
}

export type PeriodType = 'harian' | 'mingguan' | 'bulanan';
export type TabType = 'input' | 'dashboard' | 'report';

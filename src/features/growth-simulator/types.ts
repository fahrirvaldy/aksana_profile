
export interface Metrics {
  leads: number;
  conv: number;
  trans: number;
  sale: number;
  margin: number;
}

export interface GrowthSimulatorInitialData {
  currency?: 'IDR' | 'USD';
  period?: 'Bulan' | 'Tahun';
  globalGrowth?: number;
  current?: Metrics;
  target?: Metrics;
  marketingCost?: number;
  fixedCost?: number;
}

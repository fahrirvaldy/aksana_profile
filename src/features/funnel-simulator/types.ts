
export interface FunnelInputs {
  budget: number;
  aov: number;
  cpm: number;
  ctr: number;
  visit: number;
  atc: number;
  checkout: number;
}

export interface Profiling {
  industry: string;
  channel: string;
}

export interface FunnelSimulatorInitialData {
  inputs?: FunnelInputs;
  profiling?: Profiling;
}

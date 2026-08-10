
export interface PsychoScores {
  creativity: number;
  leadership: number;
  detail: number;
  execution: number;
}

export interface Seat {
  req: PsychoScores;
}

export interface Employee {
  id: number;
  name: string;
  role: string;
  psycho: PsychoScores;
}

export interface PeopleAnalyzerData {
  [key: string]: any;
  companyName: string;
  seats: Record<string, Seat>;
  employees: Employee[];
}

export type ViewType = 'setup' | 'dashboard' | 'assessment';


export interface L10Config {
  companyName: string;
  divisions: string[];
  rocks: string[];
}

export interface KPI {
  kpi: string;
  target: string;
  realisasi: string;
  jenis: 'output' | 'outcome';
  status: 'on' | 'off';
}

export interface TodoItem {
  id: number;
  text: string;
  owner: string;
  isDone: boolean;
  deadline: string;
}

export interface IDSIssue {
  id: string;
  source: string;
  text: string;
  isResolved: boolean;
  isSelectedForDiscussion: boolean;
  votes: number;
}

export interface ChainRow {
  effect: string;
  cause: string;
}

export interface IDSTheme {
  topic: string;
  currentCond: string;
  desiredCond: string;
  analysis: {
    man: string;
    method: string;
    machine: string;
    material: string;
    environment: string;
  };
  chain: ChainRow[];
  rootCause: string;
  plan: {
    what: string;
    who: string;
    when: string;
    where: string;
    why: string;
    cost: string;
  };
}

export interface L10Data {
  [key: string]: any;
  config: L10Config;
  meetingDate: string;
  attendance: Record<number, boolean>;
  goodNews: {
    owner: string;
    integrator: string;
    team: string;
  };
  scorecards: Record<string, KPI[]>;
  rocksStatus: Array<{ pic: string; status: 'on' | 'off'; notes: string }>;
  headlines: {
    customer: string[];
    internal: string[];
  };
  todoList: TodoItem[];
  idsSession: {
    issues: IDSIssue[];
    themes: IDSTheme[];
    solutions: string;
  };
  ratings: Record<number, number | string>;
}

import { L10Data, IDSTheme } from "./types";

export const generateDefaultTheme = (index: number): IDSTheme => ({
  topic: `Tema Diskusi Masalah ${index}`,
  currentCond: "",
  desiredCond: "",
  analysis: { man: "", method: "", machine: "", material: "", environment: "" },
  chain: Array(5).fill(null).map(() => ({ effect: "", cause: "" })),
  rootCause: "",
  plan: { what: "", who: "", when: "", where: "", why: "", cost: "" }
});

export const DEFAULT_DATA: L10Data = {
  config: {
    companyName: "Aksana Business Lab",
    divisions: ["Marketing", "Sales", "Operation", "Finance"],
    rocks: [""]
  },
  meetingDate: new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
  attendance: {},
  goodNews: { owner: "", integrator: "", team: "" },
  scorecards: {},
  rocksStatus: [],
  headlines: { customer: [""], internal: [""] },
  todoList: [],
  idsSession: {
    issues: [],
    themes: [generateDefaultTheme(1), generateDefaultTheme(2), generateDefaultTheme(3)],
    solutions: ""
  },
  ratings: {},
  timer: {
    isTimerRunning: false,
    timeLeft: 5400,
    timerEndTime: null,
  }
};

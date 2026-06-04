"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Plus, 
  RefreshCw, 
  CheckCircle2,
  Users,
  MessageSquare,
  FileText,
  X,
  Loader2,
  Trophy,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  pdf
} from "@react-pdf/renderer";

// --- Interfaces ---
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
}

export interface IDSIssue {
  id: string;
  source: string;
  text: string;
  isResolved: boolean;
}

export interface L10Data {
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
    notes: string;
    solutions: string;
  };
  ratings: Record<number, number>;
}

interface L10MeetingProps {
  user?: { id: string; [key: string]: unknown };
  onSave?: (data: L10Data) => void;
  isSyncing?: boolean;
  initialData?: L10Data;
}

// --- Default Data ---
const DEFAULT_DATA: L10Data = {
  config: {
    companyName: "Aksana Business Lab",
    divisions: ["Marketing", "Sales", "Operation", "Finance"], // Bentuk array awal baku
    rocks: [""]
  },
  meetingDate: new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
  attendance: {},
  goodNews: { owner: "", integrator: "", team: "" },
  scorecards: {},
  rocksStatus: [],
  headlines: { customer: [""], internal: [""] },
  todoList: [],
  idsSession: { issues: [], notes: "", solutions: "" },
  ratings: {}
};

// ============================================================================
// 📄 ARCHITECTURE: @react-pdf/renderer Layout Definition Matrix
// Optimized for OKLCH/LAB Color Fidelity (Hex Mapping)
// ============================================================================
const pdfStyles = StyleSheet.create({
  page: { 
    padding: 40, 
    backgroundColor: "#fbfcfd", 
    fontSize: 10, 
    color: "#1e293b", 
    fontFamily: "Helvetica" 
  },
  header: { 
    borderBottom: "3pt solid #3b82f6", 
    paddingBottom: 12, 
    marginBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end"
  },
  headerLeft: {
    flex: 1
  },
  title: { 
    fontSize: 22, 
    fontWeight: "bold", 
    color: "#0f172a", 
    letterSpacing: -0.5
  },
  subtitle: { 
    fontSize: 11, 
    color: "#3b82f6", 
    marginTop: 2, 
    textTransform: "uppercase",
    fontWeight: "bold",
    letterSpacing: 1
  },
  metaDate: { 
    fontSize: 9, 
    color: "#64748b", 
    marginTop: 4 
  },
  section: { 
    marginBottom: 24, 
    padding: 16, 
    backgroundColor: "#ffffff", 
    borderRadius: 12,
    border: "1pt solid #e2e8f0"
  },
  sectionTitle: { 
    fontSize: 13, 
    fontWeight: "bold", 
    marginBottom: 12, 
    color: "#0f172a", 
    borderBottom: "1pt solid #f1f5f9", 
    paddingBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  row: { 
    flexDirection: "row", 
    borderBottom: "1pt solid #f1f5f9", 
    paddingVertical: 8, 
    alignItems: "center" 
  },
  tableHeader: { 
    flexDirection: "row", 
    backgroundColor: "#f8fafc", 
    padding: 8, 
    borderRadius: 6,
    marginBottom: 4
  },
  tableHeaderLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  cellCol1: { width: "35%", paddingHorizontal: 4 },
  cellCol2: { width: "20%", paddingHorizontal: 4 },
  cellCol3: { width: "15%", paddingHorizontal: 4 },
  cellCol4: { width: "15%", paddingHorizontal: 4 },
  cellCol5: { width: "15%", paddingHorizontal: 4 },
  
  badge: { 
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 99, 
    fontSize: 7, 
    fontWeight: "bold", 
    textAlign: "center",
    textTransform: "uppercase"
  },
  badgeOn: { 
    backgroundColor: "#dcfce7", 
    color: "#15803d" 
  },
  badgeOff: { 
    backgroundColor: "#fee2e2", 
    color: "#b91c1c" 
  },
  badgeInfo: { 
    backgroundColor: "#f3e8ff", 
    color: "#7e22ce" 
  },
  
  textBold: { fontWeight: "bold", color: "#334155" },
  textArea: { 
    marginTop: 8, 
    padding: 10, 
    backgroundColor: "#f8fafc", 
    borderRadius: 8, 
    minHeight: 50, 
    fontSize: 9, 
    lineHeight: 1.5,
    color: "#475569",
    border: "0.5pt solid #e2e8f0"
  },
  ratingCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    justifyContent: "center",
    alignItems: "center"
  },
  ratingValue: {
    fontSize: 24,
    fontWeight: "bold"
  }
});

const L10PDFDocument = ({ data, attendees, averageRating }: { data: L10Data; attendees: string[]; averageRating: string }) => (
  <Document author="Aksana L10 Engine" title={`L10 Report - ${data.config.companyName}`}>
    {/* PAGE 1: EXECUTIVE SUMMARY */}
    <Page size="A4" orientation="landscape" style={pdfStyles.page}>
      <View style={pdfStyles.header}>
        <View style={pdfStyles.headerLeft}>
          <Text style={pdfStyles.title}>LEVEL 10 MEETING REPORT</Text>
          <Text style={pdfStyles.subtitle}>{data.config.companyName}</Text>
          <Text style={pdfStyles.metaDate}>Sesi Rapat: {data.meetingDate}</Text>
        </View>
        <View style={pdfStyles.ratingCircle}>
          <Text style={pdfStyles.ratingValue}>{averageRating}</Text>
          <Text style={{ fontSize: 6, fontWeight: "bold" }}>RATING</Text>
        </View>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Attendance & Team Pulse</Text>
        <View style={{ flexDirection: "row", marginBottom: 16 }}>
          <View style={{ flex: 1 }}>
            <Text style={[pdfStyles.textBold, { marginBottom: 4 }]}>Peserta Hadir:</Text>
            <Text style={{ color: "#64748b", fontSize: 9 }}>
              {attendees.filter((_, idx) => data.attendance[idx]).join(", ") || "Tidak ada data kehadiran."}
            </Text>
          </View>
        </View>
        
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={pdfStyles.textBold}>Kabar Syukur (Owner):</Text>
            <Text style={pdfStyles.textArea}>{data.goodNews.owner || "Tidak ada kabar syukur terekam."}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={pdfStyles.textBold}>Kabar Syukur (Integrator):</Text>
            <Text style={pdfStyles.textArea}>{data.goodNews.integrator || "Tidak ada kabar syukur terekam."}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={pdfStyles.textBold}>Kabar Syukur (Team):</Text>
            <Text style={pdfStyles.textArea}>{data.goodNews.team || "Tidak ada kabar syukur terekam."}</Text>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={[pdfStyles.section, { flex: 1 }]}>
          <Text style={pdfStyles.sectionTitle}>Customer Headlines</Text>
          {(data.headlines.customer || []).filter(h => h.trim()).length > 0 ? (
            data.headlines.customer.map((h, idx) => h.trim() && (
              <Text key={idx} style={{ paddingVertical: 4, fontSize: 9, color: "#475569" }}>• {h}</Text>
            ))
          ) : (
            <Text style={{ fontSize: 9, color: "#94a3b8", italic: true }}>Tidak ada headline pelanggan.</Text>
          )}
        </View>
        <View style={[pdfStyles.section, { flex: 1 }]}>
          <Text style={pdfStyles.sectionTitle}>Internal Headlines</Text>
          {(data.headlines.internal || []).filter(h => h.trim()).length > 0 ? (
            data.headlines.internal.map((h, idx) => h.trim() && (
              <Text key={idx} style={{ paddingVertical: 4, fontSize: 9, color: "#475569" }}>• {h}</Text>
            ))
          ) : (
            <Text style={{ fontSize: 9, color: "#94a3b8", italic: true }}>Tidak ada headline internal.</Text>
          )}
        </View>
      </View>
    </Page>

    {/* PAGE 2: KPI SCORECARDS */}
    <Page size="A4" orientation="landscape" style={pdfStyles.page}>
      <View style={pdfStyles.header}>
        <View style={pdfStyles.headerLeft}>
          <Text style={pdfStyles.title}>KPI SCORECARDS METRICS</Text>
          <Text style={pdfStyles.subtitle}>Weekly Operational Performance</Text>
        </View>
      </View>

      {data.config.divisions.map((division) => {
        const divId = division.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const kpis = data.scorecards[divId] || [];
        return (
          <View key={division} style={pdfStyles.section} wrap={false}>
            <Text style={pdfStyles.sectionTitle}>Divisi: {division}</Text>
            <View style={pdfStyles.tableHeader}>
              <View style={pdfStyles.cellCol1}><Text style={pdfStyles.tableHeaderLabel}>KPI Metric</Text></View>
              <View style={pdfStyles.cellCol2}><Text style={pdfStyles.tableHeaderLabel}>Target</Text></View>
              <View style={pdfStyles.cellCol3}><Text style={pdfStyles.tableHeaderLabel}>Realisasi</Text></View>
              <View style={pdfStyles.cellCol4}><Text style={pdfStyles.tableHeaderLabel}>Jenis</Text></View>
              <View style={pdfStyles.cellCol5}><Text style={pdfStyles.tableHeaderLabel}>Status</Text></View>
            </View>
            {kpis.length === 0 ? (
              <Text style={{ padding: 10, color: "#94a3b8", italic: true, fontSize: 9 }}>Tidak ada data KPI untuk divisi ini.</Text>
            ) : (
              kpis.map((k, idx) => (
                <View key={idx} style={pdfStyles.row}>
                  <View style={pdfStyles.cellCol1}><Text style={{ fontWeight: "bold" }}>{k.kpi}</Text></View>
                  <View style={pdfStyles.cellCol2}><Text>{k.target}</Text></View>
                  <View style={pdfStyles.cellCol3}><Text style={{ color: "#3b82f6", fontWeight: "bold" }}>{k.realisasi}</Text></View>
                  <View style={pdfStyles.cellCol4}><Text style={{ textTransform: "uppercase", fontSize: 8 }}>{k.jenis}</Text></View>
                  <View style={pdfStyles.cellCol5}>
                    <Text style={[pdfStyles.badge, k.status === 'on' ? pdfStyles.badgeOn : pdfStyles.badgeOff]}>
                      {k.status === 'on' ? "ON TRACK" : "OFF TRACK"}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        );
      })}
    </Page>

    {/* PAGE 3: ROCKS & ACTION ITEMS */}
    <Page size="A4" orientation="landscape" style={pdfStyles.page}>
      <View style={pdfStyles.header}>
        <View style={pdfStyles.headerLeft}>
          <Text style={pdfStyles.title}>STRATEGIC ROCKS & TO-DO LIST</Text>
          <Text style={pdfStyles.subtitle}>90-Day Priorities & Accountability</Text>
        </View>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Rock Review (Prioritas 90 Hari)</Text>
        <View style={pdfStyles.tableHeader}>
          <View style={{ width: "20%" }}><Text style={pdfStyles.tableHeaderLabel}>PIC</Text></View>
          <View style={{ width: "45%" }}><Text style={pdfStyles.tableHeaderLabel}>Rock Description</Text></View>
          <View style={{ width: "15%" }}><Text style={pdfStyles.tableHeaderLabel}>Status</Text></View>
          <View style={{ width: "20%" }}><Text style={pdfStyles.tableHeaderLabel}>Notes</Text></View>
        </View>
        {data.config.rocks.map((rock, i) => {
          const status = data.rocksStatus[i] || { pic: "-", status: "on", notes: "-" };
          return (
            <View key={i} style={pdfStyles.row}>
              <View style={{ width: "20%" }}><Text style={{ fontWeight: "bold" }}>{status.pic || "Unassigned"}</Text></View>
              <View style={{ width: "45%" }}><Text>{rock || "No description provided."}</Text></View>
              <View style={{ width: "15%" }}>
                <Text style={[pdfStyles.badge, status.status === 'on' ? pdfStyles.badgeOn : pdfStyles.badgeOff]}>
                  {status.status === 'on' ? "ON TRACK" : "OFF TRACK"}
                </Text>
              </View>
              <View style={{ width: "20%" }}><Text style={{ fontSize: 8, color: "#64748b" }}>{status.notes || "-"}</Text></View>
            </View>
          );
        })}
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>To-Do List (Review Akuntabilitas)</Text>
        <View style={pdfStyles.tableHeader}>
          <View style={{ width: "12%" }}><Text style={pdfStyles.tableHeaderLabel}>Status</Text></View>
          <View style={{ width: "63%" }}><Text style={pdfStyles.tableHeaderLabel}>Tugas / Action Item</Text></View>
          <View style={{ width: "25%" }}><Text style={pdfStyles.tableHeaderLabel}>Owner</Text></View>
        </View>
        {data.todoList.length === 0 ? (
          <Text style={{ padding: 10, color: "#94a3b8", italic: true, fontSize: 9 }}>Tidak ada tugas yang terekam.</Text>
        ) : (
          data.todoList.map((todo) => (
            <View key={todo.id} style={pdfStyles.row}>
              <View style={{ width: "12%" }}>
                <Text style={[pdfStyles.badge, todo.isDone ? pdfStyles.badgeOn : pdfStyles.badgeOff]}>
                  {todo.isDone ? "DONE" : "PENDING"}
                </Text>
              </View>
              <View style={{ width: "63%" }}>
                <Text style={{ color: todo.isDone ? "#94a3b8" : "#1e293b", textDecoration: todo.isDone ? "line-through" : "none" }}>
                  {todo.text}
                </Text>
              </View>
              <View style={{ width: "25%" }}><Text style={{ fontWeight: "bold", color: "#3b82f6" }}>{todo.owner}</Text></View>
            </View>
          ))
        )}
      </View>
    </Page>

    {/* PAGE 4: IDS RESOLUTIONS */}
    <Page size="A4" orientation="landscape" style={pdfStyles.page}>
      <View style={pdfStyles.header}>
        <View style={pdfStyles.headerLeft}>
          <Text style={pdfStyles.title}>IDS SESSION RESOLUTIONS</Text>
          <Text style={pdfStyles.subtitle}>Identify, Discuss, Solve</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 16, height: "100%" }}>
        <View style={{ flex: 1 }}>
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>1. Issues Identified</Text>
            {(data.idsSession?.issues || []).map((issue) => (
              <View key={issue.id} style={{ marginBottom: 6, flexDirection: "row", alignItems: "flex-start" }}>
                <Text style={{ width: 15, fontSize: 8, color: "#3b82f6", fontWeight: "bold" }}>{issue.isResolved ? "✓" : "•"}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 9, fontWeight: "bold", color: "#64748b", textTransform: "uppercase", marginBottom: 1 }}>[{issue.source}]</Text>
                  <Text style={{ fontSize: 10, color: issue.isResolved ? "#94a3b8" : "#1e293b" }}>{issue.text}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ flex: 1.5 }}>
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>2. Discussion Notes</Text>
            <Text style={[pdfStyles.textArea, { minHeight: 120 }]}>{data.idsSession.notes || "Tidak ada catatan diskusi khusus."}</Text>
          </View>
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>3. Solutions & Execution</Text>
            <Text style={[pdfStyles.textArea, { minHeight: 120, borderLeft: "4pt solid #7e22ce", backgroundColor: "#faf5ff" }]}>
              {data.idsSession.solutions || "Tidak ada item solusi yang dihasilkan."}
            </Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

// ============================================================================
// 📊 Main Component View Layer Engine
// ============================================================================
export default function L10Meeting({ onSave, isSyncing, initialData }: L10MeetingProps) {
  const getAttendees = () => data.config.divisions.length > 0 
    ? ["Owner", "Integrator", ...data.config.divisions] 
    : ["Owner", "Integrator", "Marketing", "Sales", "Operation", "Finance", "HRD", "Product", "R&D"];

  const [data, setData] = useState<L10Data>(initialData || DEFAULT_DATA);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showSetup, setShowSetup] = useState(!initialData);
  
  const [timeLeft, setTimeLeft] = useState(5400); // 90 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerEndTimeRef = useRef<number | null>(null);

  const [isExporting, setIsExporting] = useState(false);

  // Sync data with parent component
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSave) onSave(data);
    }, 1500);
    return () => clearTimeout(timer);
  }, [data, onSave]);

  // Timer logic
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isTimerRunning) {
      timerEndTimeRef.current = Date.now() + timeLeft * 1000;
      intervalId = setInterval(() => {
        if (timerEndTimeRef.current) {
          const remainingMs = timerEndTimeRef.current - Date.now();
          if (remainingMs <= 0) {
            setTimeLeft(0);
            setIsTimerRunning(false);
            clearInterval(intervalId);
          } else {
            setTimeLeft(Math.ceil(remainingMs / 1000));
          }
        }
      }, 250);
    }
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalSlides = 7 + data.config.divisions.length;
  const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, totalSlides - 1));
  const prevSlide = () => setCurrentSlide(prev => Math.max(prev - 1, 0));

  const updateData = (path: string, value: any) => {
    setData(prev => {
      // Fungsi rekursif pembantu untuk memperbarui state secara aman (immutable)
      const setDeep = (obj: any, pathKeys: string[], val: any): any => {
        if (pathKeys.length === 0) return val;
        
        const [currentKey, ...remainingKeys] = pathKeys;
        const isArray = Array.isArray(obj);
        
        // Salin struktur data saat ini (array atau objek)
        const cloned = isArray ? [...(obj || [])] : { ...(obj || {}) };
        
        // Ambil indeks/key saat ini
        const targetKey = isArray ? parseInt(currentKey, 10) : currentKey;
        
        // Rekursi masuk lebih dalam ke nested objek
        cloned[targetKey] = setDeep(cloned[targetKey], remainingKeys, val);
        return cloned;
      };

      const keys = path.split('.');
      return setDeep(prev, keys, value);
    });
  };

  const attendees = useMemo(() => getAttendees(), [data.config.divisions]);

  const averageRating = useMemo(() => {
    const attendees = data.config.divisions.length > 0 
      ? ["Owner", "Integrator", ...data.config.divisions] 
      : ["Owner", "Integrator", "Marketing", "Sales", "Operation", "Finance", "HRD", "Product", "R&D"];

    let totalScore = 0;
    let activeCount = 0;

    attendees.forEach((_, idx) => {
      if (data.attendance && data.attendance[idx] === true) {
        const scoreRaw = data.ratings ? data.ratings[idx] : undefined;
        const ratingValue = scoreRaw !== undefined && scoreRaw !== "" ? parseFloat(String(scoreRaw)) : 0;
        
        if (ratingValue > 0 && !isNaN(ratingValue)) {
          totalScore += ratingValue;
          activeCount++;
        }
      }
    });

    return activeCount > 0 ? (totalScore / activeCount).toFixed(1) : "0.0";
  }, [data]);

  const pullOffTrackData = () => {
    const issuesList = data.idsSession?.issues || [];
    const existingTexts = new Set(issuesList.map(i => i.text.toLowerCase()));
    const newIssues: IDSIssue[] = [];

    // Pull from Scorecards
    Object.entries(data.scorecards).forEach(([div, kpis]) => {
      kpis.forEach(k => {
        if (k.status === 'off' && !existingTexts.has(k.kpi.toLowerCase())) {
          newIssues.push({
            id: `sc-${div}-${Date.now()}-${Math.random()}`,
            source: div.toUpperCase(),
            text: k.kpi,
            isResolved: false
          });
        }
      });
    });

    // Pull from Rocks
    data.rocksStatus.forEach((r, i) => {
      const rockText = data.config.rocks[i];
      if (r.status === 'off' && rockText && !existingTexts.has(rockText.toLowerCase())) {
        const picLabel = r.pic ? `ROCK - ${r.pic.toUpperCase()}` : "ROCK";
        newIssues.push({
          id: `rock-${i}-${Date.now()}-${Math.random()}`,
          source: picLabel,
          text: rockText,
          isResolved: false
        });
      }
    });

    if (newIssues.length > 0) {
      updateData('idsSession.issues', [...issuesList, ...newIssues]);
    }
  };

  const handleIssueCheck = (index: number, checked: boolean) => {
    const issuesList = [...(data.idsSession?.issues || [])];
    if (issuesList[index]) {
      issuesList[index].isResolved = checked;
      // Move resolved issues to the bottom
      const sortedIssues = issuesList.sort((a, b) => Number(a.isResolved) - Number(b.isResolved));
      updateData('idsSession.issues', sortedIssues);
    }
  };

  // --- PDF EXPORT ENGINE: @react-pdf/renderer Implementation ---
  const handleExportPDF = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const docBlob = await pdf(
        <L10PDFDocument 
          data={data} 
          attendees={attendees} 
          averageRating={averageRating} 
        />
      ).toBlob();
      
      const downloadUrl = URL.createObjectURL(docBlob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `L10_Report_${data.config.companyName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("Gagal mengekspor PDF. Pastikan data valid.");
    } finally {
      setIsExporting(false);
    }
  };

  const renderSlide = () => {
    if (currentSlide === 0) return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4">
          <div className="mx-auto w-24 h-24 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-600 mb-6 border border-blue-500/20">
            <Trophy size={48} />
          </div>
          <h1 className="text-6xl font-black tracking-tight text-slate-900 dark:text-white">LEVEL 10 MEETING</h1>
          <p className="text-3xl text-blue-500 font-bold uppercase tracking-widest">{data.config.companyName}</p>
        </motion.div>
        
        <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/40 dark:border-slate-800 shadow-xl max-w-md w-full">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Tanggal Rapat Efektif</p>
          <input 
            type="text" 
            value={data.meetingDate}
            onChange={(e) => updateData('meetingDate', e.target.value)}
            className="text-2xl font-bold bg-transparent border-none text-center focus:ring-0 outline-none w-full text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>
    );

    if (currentSlide === 1) return (
      <div className="space-y-6 h-full flex flex-col">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-1">Segmen Awal</h2>
            <p className="text-slate-500 font-medium">Kehadiran & Kabar Baik (5 Menit)</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0 overflow-hidden pb-4">
          <div className="bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 flex flex-col shadow-sm">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-slate-800 dark:text-slate-200"><Users size={20} className="text-blue-500" /> Daftar Hadir</h3>
            <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-1 custom-scrollbar">
              {attendees.map((role, i) => (
                <label key={i} className={`cursor-pointer transition-all rounded-xl p-4 flex items-center gap-3 border ${data.attendance[i] ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800/80'}`}>
                  <input 
                    type="checkbox" 
                    checked={data.attendance[i] || false}
                    onChange={(e) => updateData(`attendance.${i}`, e.target.checked)}
                    className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`font-bold text-sm truncate ${data.attendance[i] ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-200'}`}>{role}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 flex flex-col shadow-sm">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-slate-800 dark:text-slate-200"><MessageSquare size={20} className="text-emerald-500" /> Good News</h3>
            <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
              {['owner', 'integrator', 'team'].map((pic) => (
                <div key={pic} className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">{pic}</label>
                  <textarea 
                    value={data.goodNews[pic as keyof typeof data.goodNews]}
                    onChange={(e) => updateData(`goodNews.${pic}`, e.target.value)}
                    placeholder={`Kabar baik dari ${pic}...`}
                    className="w-full p-4 rounded-xl bg-white/40 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none h-20 resize-none font-medium text-sm text-slate-800 dark:text-slate-200 transition-shadow"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );

    const divisionIndex = currentSlide - 2;
    if (divisionIndex >= 0 && divisionIndex < data.config.divisions.length) {
      const division = data.config.divisions[divisionIndex];
      const divId = division.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const kpis = data.scorecards[divId] || [];

      return (
        <div className="space-y-6 h-full flex flex-col">
          <div>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-1">Scorecard: {division}</h2>
            <p className="text-slate-500 font-medium">Review KPI Mingguan</p>
          </div>
          <div className="bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 flex flex-col flex-1 min-h-0 overflow-hidden pb-6 shadow-sm">
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <table className="w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <th className="px-4 pb-2">KPI Metric</th>
                    <th className="px-4 pb-2">Target</th>
                    <th className="px-4 pb-2">Realisasi</th>
                    <th className="px-4 pb-2 text-center">Jenis</th>
                    <th className="px-4 pb-2 text-center">Status</th>
                    <th className="px-4 pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {kpis.map((k, i) => (
                    <tr key={i} className="bg-white/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-xl group overflow-hidden">
                      <td className="p-3"><input type="text" value={k.kpi} onChange={(e) => {
                        const newKpis = [...kpis]; newKpis[i].kpi = e.target.value; updateData(`scorecards.${divId}`, newKpis);
                      }} className="bg-transparent border-none focus:ring-0 w-full font-bold text-sm text-slate-800 dark:text-slate-200" /></td>
                      <td className="p-3"><input type="text" value={k.target} onChange={(e) => {
                        const newKpis = [...kpis]; newKpis[i].target = e.target.value; updateData(`scorecards.${divId}`, newKpis);
                      }} className="bg-transparent border-none focus:ring-0 w-full font-medium text-sm text-slate-600 dark:text-slate-400" /></td>
                      <td className="p-3"><input type="text" value={k.realisasi} onChange={(e) => {
                        const newKpis = [...kpis]; newKpis[i].realisasi = e.target.value; updateData(`scorecards.${divId}`, newKpis);
                      }} className="bg-transparent border-none focus:ring-0 w-full font-mono text-sm text-blue-600 dark:text-blue-400" /></td>
                      <td className="p-3 text-center">
                        <button onClick={() => {
                          const newKpis = [...kpis]; newKpis[i].jenis = k.jenis === 'output' ? 'outcome' : 'output'; updateData(`scorecards.${divId}`, newKpis);
                        }} className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${k.jenis === 'outcome' ? 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20' : 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20'}`}>{k.jenis}</button>
                      </td>
                      <td className="p-3 text-center">
                        <button onClick={() => {
                          const newKpis = [...kpis]; newKpis[i].status = k.status === 'on' ? 'off' : 'on'; updateData(`scorecards.${divId}`, newKpis);
                        }} className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${k.status === 'on' ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20'}`}>{k.status === 'on' ? 'On Track' : 'Off Track'}</button>
                      </td>
                      <td className="p-3 text-center">
                        <button onClick={() => {
                          const newKpis = kpis.filter((_, idx) => idx !== i); updateData(`scorecards.${divId}`, newKpis);
                        }} className="p-1.5 opacity-0 group-hover:opacity-100 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"><Trash2 size={14}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {kpis.length === 0 && (
                <div className="text-center py-12 text-slate-400 font-medium">Belum ada metrik untuk divisi ini.</div>
              )}
            </div>
            <button 
              onClick={() => updateData(`scorecards.${divId}`, [...kpis, { kpi: "Metric Baru", target: "0", realisasi: "-", jenis: 'output', status: 'on' }])}
              className="mt-4 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-blue-500 hover:border-blue-500 transition-all font-bold text-sm bg-slate-50/50 dark:bg-slate-900/20"
            >
              <Plus size={16} /> Tambah Metrik KPI
            </button>
          </div>
        </div>
      );
    }

    const rockReviewSlideIndex = 2 + data.config.divisions.length;
    if (currentSlide === rockReviewSlideIndex) {
      const rocks = data.config.rocks;
      return (
        <div className="space-y-6 h-full flex flex-col">
          <div>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-1">Rock Review</h2>
            <p className="text-slate-500 font-medium">Prioritas Strategis 90 Hari</p>
          </div>
          <div className="bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 flex flex-col flex-1 min-h-0 overflow-hidden pb-6 shadow-sm">
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <table className="w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <th className="px-4 pb-2 w-[20%]">PIC / Tim</th>
                    <th className="px-4 pb-2 w-[40%]">Target (Rock)</th>
                    <th className="px-4 pb-2 text-center">Status</th>
                    <th className="px-4 pb-2">Catatan Progres</th>
                  </tr>
                </thead>
                <tbody>
                  {rocks.map((rock, i) => (
                    <tr key={i} className="bg-white/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden group">
                      <td className="p-3"><input type="text" value={data.rocksStatus[i]?.pic || ""} onChange={(e) => {
                        const newStatus = [...data.rocksStatus]; if(!newStatus[i]) newStatus[i] = {pic: "", status: "on", notes: ""};
                        newStatus[i].pic = e.target.value; updateData('rocksStatus', newStatus);
                      }} placeholder="Nama PIC" className="bg-transparent border-none focus:ring-0 w-full font-bold text-sm text-slate-800 dark:text-slate-200" /></td>
                      <td className="p-3 font-bold text-sm text-slate-600 dark:text-slate-300 max-w-xs truncate">{rock}</td>
                      <td className="p-3 text-center">
                        <button onClick={() => {
                          const newStatus = [...data.rocksStatus]; if(!newStatus[i]) newStatus[i] = {pic: "", status: "on", notes: ""};
                          newStatus[i].status = newStatus[i].status === 'on' ? 'off' : 'on'; updateData('rocksStatus', newStatus);
                        }} className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${data.rocksStatus[i]?.status === 'off' ? 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20' : 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20'}`}>{data.rocksStatus[i]?.status === 'off' ? 'Off Track' : 'On Track'}</button>
                      </td>
                      <td className="p-3"><input type="text" value={data.rocksStatus[i]?.notes || ""} onChange={(e) => {
                        const newStatus = [...data.rocksStatus]; if(!newStatus[i]) newStatus[i] = {pic: "", status: "on", notes: ""};
                        newStatus[i].notes = e.target.value; updateData('rocksStatus', newStatus);
                      }} placeholder="Update status..." className="bg-transparent border-none focus:ring-0 w-full italic text-sm text-slate-600 dark:text-slate-400" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    if (currentSlide === 3 + data.config.divisions.length) return (
      <div className="space-y-6 h-full flex flex-col">
        <div>
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-1">Headlines</h2>
          <p className="text-slate-500 font-medium">Berita Penting Rapat</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0 overflow-hidden pb-4">
          {['customer', 'internal'].map(type => (
            <div key={type} className="bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 flex flex-col space-y-4 shadow-sm">
              <h3 className={`text-xl font-bold flex items-center gap-2 ${type === 'customer' ? 'text-blue-500' : 'text-emerald-500'}`}><FileText size={20} /> {type === 'customer' ? 'Customer Headlines' : 'Internal Headlines'}</h3>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                {(data.headlines[type as keyof typeof data.headlines] || []).map((h, i) => (
                  <div key={i} className="flex gap-3 items-center group bg-slate-50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-200 dark:border-slate-800 focus-within:ring-2 focus-within:ring-blue-500/20">
                    <span className="text-sm font-black text-slate-300 w-4">{i + 1}.</span>
                    <input type="text" value={h} onChange={(e) => {
                      const newH = [...data.headlines[type as keyof typeof data.headlines]]; newH[i] = e.target.value; updateData(`headlines.${type}`, newH);
                    }} placeholder="Masukkan berita..." className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm font-semibold text-slate-800 dark:text-slate-200" />
                    <button onClick={() => {
                      const newH = data.headlines[type as keyof typeof data.headlines].filter((_, idx) => idx !== i); updateData(`headlines.${type}`, newH);
                    }} className="opacity-0 group-hover:opacity-100 text-rose-500 p-1.5 hover:bg-rose-500/10 rounded-md transition-all"><Trash2 size={16}/></button>
                  </div>
                ))}
                <button onClick={() => updateData(`headlines.${type}`, [...data.headlines[type as keyof typeof data.headlines], ""])} className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-blue-500 transition-all font-bold text-xs bg-slate-50/50 dark:bg-slate-900/20">+ Tambah Headline Baru</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    if (currentSlide === 4 + data.config.divisions.length) return (
      <div className="space-y-6 h-full flex flex-col">
        <div>
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-1">To-Do List</h2>
          <p className="text-slate-500 font-medium">Review Minggu Lalu & Action Plan</p>
        </div>
        <div className="bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 flex flex-col flex-1 min-h-0 overflow-hidden pb-6 shadow-sm">
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {data.todoList.map((todo, i) => (
              <div key={todo.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl group border border-slate-200 dark:border-slate-800 transition-all hover:bg-white dark:hover:bg-slate-800/60 shadow-sm">
                <button onClick={() => {
                  const newList = [...data.todoList]; newList[i].isDone = !todo.isDone; updateData('todoList', newList);
                }} className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${todo.isDone ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700'}`}>{todo.isDone && <CheckCircle2 size={18} />}</button>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <input type="text" value={todo.text} onChange={(e) => {
                    const newList = [...data.todoList]; newList[i].text = e.target.value; updateData('todoList', newList);
                  }} placeholder="Apa tugasnya?" className={`bg-transparent border-none focus:ring-0 w-full font-bold text-base p-0 text-slate-800 dark:text-slate-200 ${todo.isDone ? 'line-through opacity-40' : ''}`} />
                  <div className="flex items-center gap-1.5"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Owner:</span>
                    <input type="text" value={todo.owner} onChange={(e) => {
                      const newList = [...data.todoList]; newList[i].owner = e.target.value; updateData('todoList', newList);
                    }} className="bg-transparent border-none focus:ring-0 text-xs font-bold text-blue-500 p-0 h-auto w-40" />
                  </div>
                </div>
                <button onClick={() => {
                  const newList = data.todoList.filter(t => t.id !== todo.id); updateData('todoList', newList);
                }} className="opacity-0 group-hover:opacity-100 text-rose-500 p-2 hover:bg-rose-500/10 rounded-lg transition-all"><Trash2 size={18}/></button>
              </div>
            ))}
            {data.todoList.length === 0 && (
              <div className="text-center py-12 text-slate-400 font-medium">Belum ada tugas untuk minggu ini.</div>
            )}
            <button onClick={() => updateData('todoList', [...data.todoList, { id: Date.now(), text: "", owner: "PIC", isDone: false }])} className="w-full p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-blue-500 hover:border-blue-500 transition-all font-bold text-sm bg-slate-50/50 dark:bg-slate-900/20">+ Tambah To-Do List Baru</button>
          </div>
        </div>
      </div>
    );

    if (currentSlide === 5 + data.config.divisions.length) return (
      <div className="space-y-6 h-full flex flex-col">
        <div className="flex justify-between items-center flex-shrink-0">
          <div><h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-1">IDS Session</h2><p className="text-slate-500 font-medium">Identify, Discuss, Solve (60 Menit)</p></div>
          <button onClick={pullOffTrackData} className="flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold transition-all shadow-lg active:scale-95 text-sm"><RefreshCw size={18} /> Tarik Data Off-Track</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 overflow-hidden pb-4">
          <div className="bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 flex flex-col overflow-hidden shadow-sm">
            <h3 className="text-base font-black border-b border-slate-200 dark:border-slate-800 pb-4 text-blue-500 uppercase tracking-wider flex-shrink-0">1. Identify (Issues)</h3>
            <div className="flex-1 overflow-y-auto space-y-3 mt-5 pr-1 custom-scrollbar">
              {(data.idsSession?.issues || []).map((issue, i) => (
                <div key={issue.id} className={`flex items-start gap-3 p-4 rounded-2xl group border transition-all ${issue.isResolved ? 'bg-slate-100/50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 opacity-50' : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm'}`}>
                  <input type="checkbox" checked={issue.isResolved} onChange={(e) => handleIssueCheck(i, e.target.checked)} className="mt-1.5 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                  <div className="flex-1 min-w-0 space-y-1"><span className="inline-block px-2.5 py-1 rounded-lg text-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-extrabold uppercase tracking-widest">{issue.source}</span>
                    <input type="text" value={issue.text} onChange={(e) => {
                      const newI = [...(data.idsSession?.issues || [])]; newI[i].text = e.target.value; updateData('idsSession.issues', newI);
                    }} className={`bg-transparent border-none focus:ring-0 w-full p-0 text-sm font-bold text-slate-800 dark:text-slate-200 transition-all ${issue.isResolved ? 'line-through font-medium text-slate-400' : ''}`} />
                  </div>
                  <button onClick={() => {
                    const newI = (data.idsSession?.issues || []).filter((_, idx) => idx !== i); updateData('idsSession.issues', newI);
                  }} className="opacity-0 group-hover:opacity-100 text-rose-500 p-1.5 hover:bg-rose-500/10 rounded-lg transition-all flex-shrink-0"><Trash2 size={16}/></button>
                </div>
              ))}
              <button onClick={() => updateData('idsSession.issues', [...(data.idsSession?.issues || []), { id: `manual-${Date.now()}`, source: 'Manual', text: 'Masalah baru...', isResolved: false }])} className="w-full py-3.5 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-blue-500 transition-all font-bold text-xs bg-slate-50/50 dark:bg-slate-900/20">+ Input Masalah Baru</button>
            </div>
          </div>
          <div className="bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 flex flex-col shadow-sm">
            <h3 className="text-base font-black border-b border-slate-200 dark:border-slate-800 pb-4 text-emerald-500 uppercase tracking-wider flex-shrink-0">2. Discuss (Notes)</h3>
            <textarea value={data.idsSession.notes} onChange={(e) => updateData('idsSession.notes', e.target.value)} placeholder="Tulis catatan diskusi penting di sini..." className="flex-1 bg-transparent border-none focus:ring-0 text-base font-medium leading-relaxed resize-none custom-scrollbar text-slate-800 dark:text-slate-200 mt-5 outline-none" />
          </div>
          <div className="bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 flex flex-col shadow-sm">
            <h3 className="text-base font-black border-b border-slate-200 dark:border-slate-800 pb-4 text-purple-500 uppercase tracking-wider flex-shrink-0">3. Solve (Action Items)</h3>
            <textarea value={data.idsSession.solutions} onChange={(e) => updateData('idsSession.solutions', e.target.value)} placeholder="Apa solusi finalnya? Masukkan ke To-Do List jika perlu..." className="flex-1 bg-transparent border-none focus:ring-0 text-base font-bold leading-relaxed resize-none custom-scrollbar text-purple-700 dark:text-purple-400 mt-5 outline-none" />
          </div>
        </div>
      </div>
    );

    if (currentSlide === 6 + data.config.divisions.length) return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-10 overflow-hidden">
        <div className="space-y-2 flex-shrink-0"><h2 className="text-5xl font-black text-slate-900 dark:text-white">Conclude</h2><p className="text-slate-500 font-bold italic tracking-wide">"Seberapa efektif rapat ini bagi pencapaian visi?" (1 - 10)</p></div>
        <div className="space-y-1 flex-shrink-0 relative">
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-[12rem] font-black leading-none tracking-tighter text-blue-600 drop-shadow-2xl">{averageRating}</motion.div>
          <p className="text-sm font-black text-slate-400 uppercase tracking-[0.4em]">Composite Quality Score</p>
        </div>
        <div className="bg-white/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-10 rounded-[3rem] max-w-5xl w-full flex flex-wrap justify-center gap-6 overflow-y-auto max-h-[250px] custom-scrollbar shadow-xl backdrop-blur-sm">
          {attendees.map((role, i) => data.attendance[i] ? (
            <div key={i} className="flex flex-col items-center gap-2.5 w-28">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate w-full text-center" title={role}>{role}</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                placeholder="0"
                value={data.ratings?.[i] !== undefined ? data.ratings[i] : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  // Validasi batas nilai 0 - 10 secara reaktif
                  if (val === "" || (parseFloat(val) >= 0 && parseFloat(val) <= 10)) {
                    updateData(`ratings.${i}`, val);
                  }
                }}
                disabled={!data.attendance?.[i]}
                className={`w-24 px-4 py-3 rounded-xl border font-bold text-center text-lg outline-none transition-all ${
                  data.attendance?.[i]
                    ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10"
                    : "bg-slate-100 dark:bg-slate-950 border-transparent text-slate-400 cursor-not-allowed"
                }`}
              />
            </div>
          ) : null)}
          {Object.values(data.attendance).filter(Boolean).length === 0 && (
            <p className="text-base font-bold text-slate-400 py-6">Pilih peserta yang hadir untuk memberikan rating.</p>
          )}
        </div>
      </div>
    );
    return null;
  };

  return (
    <div className="relative h-full w-full flex flex-col bg-slate-50 dark:bg-slate-950 p-1 select-none overflow-hidden">
      {/* Top Navigation & Status */}
      <div className="flex justify-between items-center p-8 z-40 flex-shrink-0">
        <div className="flex items-center gap-5">
          <div className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-8 py-3.5 rounded-3xl flex items-center gap-5 shadow-lg border border-slate-200/50 dark:border-slate-800/50 ${timeLeft < 300 ? 'bg-rose-500/10 text-rose-600' : 'text-blue-600 dark:text-blue-400'}`}>
            <Clock size={24} /><span className="text-3xl font-black font-mono tracking-tighter">{formatTime(timeLeft)}</span>
            <div className="flex gap-4 border-l border-slate-200 dark:border-slate-800 pl-5">
              <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="hover:scale-110 transition-transform active:scale-95 text-slate-700 dark:text-slate-300">{isTimerRunning ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}</button>
              <button onClick={() => { setTimeLeft(5400); setIsTimerRunning(false); }} className="hover:scale-110 transition-transform active:scale-95 text-slate-400"><RotateCcw size={20} /></button>
            </div>
          </div>
          
          <button 
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-3 px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-black shadow-xl hover:scale-105 transition-all text-xs active:scale-95 disabled:opacity-50 disabled:grayscale"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {isExporting ? "GENERATING PDF..." : "EXPORT L10 REPORT"}
          </button>

          {isSyncing && (
            <div className="flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 rounded-full text-blue-600 text-xs font-black animate-pulse border border-blue-500/20"><Loader2 size={14} className="animate-spin" />SYNCING...</div>
          )}
        </div>
        <button onClick={() => setShowSetup(true)} className="p-4 rounded-3xl bg-white dark:bg-slate-900 shadow-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-blue-500 hover:rotate-90 transition-all duration-700 active:scale-90"><Settings size={24} /></button>
      </div>

      {/* Slide Canvas */}
      <div className="flex-1 px-16 pb-12 pt-4 relative overflow-hidden min-h-0">
        <div className="w-full h-full bg-transparent flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div key={currentSlide} initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.98 }} transition={{ type: "spring", stiffness: 100, damping: 20 }} className="h-full w-full">
              {renderSlide()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-12 right-20 flex gap-4 z-40">
        <button onClick={prevSlide} disabled={currentSlide === 0} className="w-16 h-16 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-blue-600 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-xl active:scale-90"><ChevronLeft size={32} /></button>
        <button onClick={nextSlide} disabled={currentSlide === totalSlides - 1} className="w-16 h-16 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-blue-600 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-xl active:scale-90"><ChevronRight size={32} /></button>
      </div>

      {/* Setup Modal */}
      <AnimatePresence>
        {showSetup && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-slate-950/80 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-white dark:bg-slate-900 max-w-2xl w-full p-12 rounded-[3.5rem] shadow-2xl border border-white/20 dark:border-slate-800 relative max-h-[90vh] flex flex-col overflow-hidden">
              <button onClick={() => setShowSetup(false)} className="absolute top-8 right-8 text-slate-400 hover:text-rose-500 transition-all active:scale-90"><X size={28} /></button>
              <div className="space-y-8 flex flex-col flex-1 min-h-0">
                <div className="text-center flex-shrink-0 space-y-1"><h2 className="text-3xl font-black text-slate-900 dark:text-white">Meeting Engine Setup</h2><p className="text-slate-500 font-bold tracking-tight">Konfigurasi struktur rapat untuk efisiensi maksimal.</p></div>
                <div className="space-y-6 flex-1 overflow-y-auto pr-3 custom-scrollbar pb-4">
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company / Organization</label>
                    <input type="text" value={data.config.companyName} onChange={(e) => updateData('config.companyName', e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-blue-500/10 font-black text-lg text-slate-900 dark:text-white outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 dark:text-slate-500 tracking-wider mb-3">
                      DIVISI PESERTA RAPAT
                    </label>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 mb-3">
                      {data.config.divisions.map((division, i) => (
                        <div key={i} className="flex items-center gap-3 group">
                          <input
                            type="text"
                            value={division}
                            placeholder={`Nama Divisi ${i + 1}`}
                            onChange={(e) => {
                              const newDivisions = [...data.config.divisions];
                              newDivisions[i] = e.target.value;
                              updateData('config.divisions', newDivisions);
                            }}
                            className="flex-1 px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-blue-500/10 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none transition-all"
                          />
                          <button
                            onClick={() => {
                              const newDivisions = data.config.divisions.filter((_, idx) => idx !== i);
                              updateData('config.divisions', newDivisions);
                              
                              // Opsional: Bersihkan data kpi atau rating terkait indeks ini jika diperlukan
                              if (data.ratings) {
                                const newRatings = { ...data.ratings };
                                delete newRatings[i + 2]; // +2 Menyesuaikan offset Owner & Integrator
                                updateData('ratings', newRatings);
                              }
                            }}
                            className="p-3 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        updateData('config.divisions', [...data.config.divisions, ""]);
                      }}
                      className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-blue-500 hover:border-blue-500 transition-all font-black text-xs bg-slate-50/50 dark:bg-slate-900/10 flex items-center justify-center gap-2"
                    >
                      <Plus size={14} /> + TAMBAH DIVISI BARU
                    </button>
                  </div>
                  <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quarterly Rocks (Priorities)</label>
                    <div className="space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                      {data.config.rocks.map((rock, i) => (
                        <div key={i} className="flex gap-3 group">
                          <input type="text" value={rock} onChange={(e) => {
                            const newRocks = [...data.config.rocks]; newRocks[i] = e.target.value; updateData('config.rocks', newRocks);
                          }} className="flex-1 px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-blue-500/10 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none transition-all" />
                          <button onClick={() => updateData('config.rocks', data.config.rocks.filter((_, idx) => idx !== i))} className="p-3 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"><Trash2 size={18}/></button>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => updateData('config.rocks', [...data.config.rocks, ""])} className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-blue-500 hover:border-blue-500 transition-all font-black text-xs bg-slate-50/50 dark:bg-slate-900/10">+ ADD NEW ROCK</button>
                  </div>
                </div>
                <button onClick={() => setShowSetup(false)} className="w-full py-5 rounded-[2rem] bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-black text-lg shadow-2xl active:scale-[0.97] transition-all flex-shrink-0">LAUNCH MEETING SESSION</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

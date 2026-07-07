'use client';

import { User } from "@supabase/supabase-js";
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
  FileText,
  X,
  Loader2,
  Trophy,
  Download,
  Cloud,
  FileSpreadsheet,
  Layers,
  HelpCircle
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
import { useTranslations } from 'next-intl';

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
    themes: IDSTheme[]; // Menggantikan variabel notes string lama
    solutions: string;
  };
  ratings: Record<number, number | string>;
}

interface L10MeetingProps {
  user?: User;
  onSave?: (data: L10Data) => void;
  isSyncing?: boolean;
  initialData?: L10Data;
}

// --- Components ---
const AutoResizeTextarea = ({ 
  value, 
  onChange, 
  placeholder, 
  className,
  rows = 1,
  onBlur,
  disabled
}: { 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; 
  placeholder?: string; 
  className?: string;
  rows?: number;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = (element: HTMLTextAreaElement) => {
    if (element) {
      element.style.height = 'auto';
      element.style.height = `${element.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight(textareaRef.current);
    }
  }, [value]);

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    adjustHeight(e.currentTarget);
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      onInput={handleInput}
      onBlur={onBlur}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className={`${className} resize-none overflow-hidden w-full`}
    />
  );
};

// --- Pembuat Template Tema Kosong Baku ---
const generateDefaultTheme = (index: number): IDSTheme => ({
  topic: `Tema Diskusi Masalah ${index}`,
  currentCond: "",
  desiredCond: "",
  analysis: { man: "", method: "", machine: "", material: "", environment: "" },
  chain: Array(5).fill(null).map(() => ({ effect: "", cause: "" })),
  rootCause: "",
  plan: { what: "", who: "", when: "", where: "", why: "", cost: "" }
});

// --- Default Data Baru Bersinkronisasi ---
const DEFAULT_DATA: L10Data = {
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
  ratings: {}
};

// ============================================================================
// 📄 ARCHITECTURE: @react-pdf/renderer Layout Definition Matrix
// Optimized for Structured 5M Fishbone Metrics Report Presentation
// ============================================================================
const pdfStyles = StyleSheet.create({
  page: { 
    padding: 30, 
    backgroundColor: "#fbfcfd", 
    fontSize: 9, 
    color: "#1e293b", 
    fontFamily: "Helvetica" 
  },
  header: { 
    borderBottom: "2pt solid #3b82f6", 
    paddingBottom: 8, 
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end"
  },
  headerLeft: { flex: 1 },
  title: { fontSize: 18, fontWeight: "bold", color: "#0f172a", letterSpacing: -0.5 },
  subtitle: { fontSize: 10, color: "#3b82f6", marginTop: 2, textTransform: "uppercase", fontWeight: "bold", letterSpacing: 0.5 },
  metaDate: { fontSize: 8, color: "#64748b", marginTop: 2 },
  section: { 
    marginBottom: 14, 
    padding: 14, 
    backgroundColor: "#ffffff", 
    borderRadius: 8,
    border: "1pt solid #e2e8f0"
  },
  sectionTitle: { 
    fontSize: 11, 
    fontWeight: "bold", 
    marginBottom: 8, 
    color: "#0f172a", 
    borderBottom: "1pt solid #f1f5f9", 
    paddingBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  row: { 
    flexDirection: "row", 
    borderBottom: "1pt solid #f1f5f9", 
    paddingVertical: 8, 
    paddingHorizontal: 4, 
    alignItems: "center" 
  },
  tableHeader: { 
    flexDirection: "row", 
    backgroundColor: "#f8fafc", 
    padding: 6, 
    borderRadius: 4,
    marginBottom: 3
  },
  tableHeaderLabel: { fontSize: 8, fontWeight: "bold", color: "#64748b", textTransform: "uppercase" },
  cellCol1: { width: "35%", paddingHorizontal: 2 },
  cellCol2: { width: "20%", paddingHorizontal: 2 },
  cellCol3: { width: "15%", paddingHorizontal: 2 },
  cellCol4: { width: "15%", paddingHorizontal: 2 },
  cellCol5: { width: "15%", paddingHorizontal: 2 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, fontSize: 7, fontWeight: "bold", textAlign: "center", textTransform: "uppercase" },
  badgeOn: { backgroundColor: "#dcfce7", color: "#15803d" },
  badgeOff: { backgroundColor: "#fee2e2", color: "#b91c1c" },
  textBold: { fontWeight: "bold", color: "#334155" },
  textArea: { 
    marginTop: 4, 
    padding: 6, 
    backgroundColor: "#f8fafc", 
    borderRadius: 4, 
    minHeight: 30, 
    fontSize: 8, 
    lineHeight: 1.4,
    color: "#475569",
    border: "0.5pt solid #e2e8f0"
  },
  ratingCircle: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: "#3b82f6", color: "#ffffff", justifyContent: "center", alignItems: "center" },
  ratingValue: { fontSize: 16, fontWeight: "bold" },
  grid2Col: { flexDirection: "row", gap: 10, marginBottom: 8 },
  grid5Col: { flexDirection: "row", gap: 6, marginBottom: 8 },
  colBlock: { flex: 1 },
  fishboneLabel: { fontSize: 7, fontWeight: "bold", color: "#475569", textTransform: "uppercase", marginBottom: 2 }
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
          <Text style={{ fontSize: 5, fontWeight: "bold" }}>RATING</Text>
        </View>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Attendance & Team Pulse</Text>
        <View style={{ flexDirection: "row", marginBottom: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={[pdfStyles.textBold, { marginBottom: 2 }]}>Peserta Hadir:</Text>
            <Text style={{ color: "#64748b", fontSize: 8 }}>
              {attendees.filter((_, idx) => data.attendance[idx]).join(", ") || "Tidak ada data kehadiran."}
            </Text>
          </View>
        </View>
        
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={pdfStyles.textBold}>Kabar Syukur (Owner):</Text>
            <Text style={pdfStyles.textArea}>{data.goodNews.owner || "-"}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={pdfStyles.textBold}>Kabar Syukur (Integrator):</Text>
            <Text style={pdfStyles.textArea}>{data.goodNews.integrator || "-"}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={pdfStyles.textBold}>Kabar Syukur (Team):</Text>
            <Text style={pdfStyles.textArea}>{data.goodNews.team || "-"}</Text>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={[pdfStyles.section, { flex: 1 }]}>
          <Text style={pdfStyles.sectionTitle}>Customer Headlines</Text>
          {(data.headlines.customer || []).filter(h => h.trim()).length > 0 ? (
            data.headlines.customer.map((h, idx) => h.trim() && (
              <Text key={idx} style={{ paddingVertical: 2, fontSize: 8, color: "#475569" }}>• {h}</Text>
            ))
          ) : (
            <Text style={{ fontSize: 8, color: "#94a3b8", fontStyle: "italic" }}>Tidak ada headline pelanggan.</Text>
          )}
        </View>
        <View style={[pdfStyles.section, { flex: 1 }]}>
          <Text style={pdfStyles.sectionTitle}>Internal Headlines</Text>
          {(data.headlines.internal || []).filter(h => h.trim()).length > 0 ? (
            data.headlines.internal.map((h, idx) => h.trim() && (
              <Text key={idx} style={{ paddingVertical: 2, fontSize: 8, color: "#475569" }}>• {h}</Text>
            ))
          ) : (
            <Text style={{ fontSize: 8, color: "#94a3b8", fontStyle: "italic" }}>Tidak ada headline internal.</Text>
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
              <Text style={{ padding: 6, color: "#94a3b8", fontStyle: "italic", fontSize: 8 }}>Tidak ada data KPI untuk divisi ini.</Text>
            ) : (
              kpis.map((k, idx) => (
                <View key={idx} style={pdfStyles.row}>
                  <View style={pdfStyles.cellCol1}><Text style={{ fontWeight: "bold" }}>{k.kpi}</Text></View>
                  <View style={pdfStyles.cellCol2}><Text>{k.target}</Text></View>
                  <View style={pdfStyles.cellCol3}><Text style={{ color: "#3b82f6", fontWeight: "bold" }}>{k.realisasi}</Text></View>
                  <View style={pdfStyles.cellCol4}><Text style={{ textTransform: "uppercase", fontSize: 7 }}>{k.jenis}</Text></View>
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
              <View style={{ width: "45%" }}><Text>{rock || "No description."}</Text></View>
              <View style={{ width: "15%" }}>
                <Text style={[pdfStyles.badge, status.status === 'on' ? pdfStyles.badgeOn : pdfStyles.badgeOff]}>
                  {status.status === 'on' ? "ON TRACK" : "OFF TRACK"}
                </Text>
              </View>
              <View style={{ width: "20%" }}><Text style={{ fontSize: 7, color: "#64748b" }}>{status.notes || "-"}</Text></View>
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
          <Text style={{ padding: 6, color: "#94a3b8", fontStyle: "italic", fontSize: 8 }}>Tidak ada tugas yang terekam.</Text>
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

    {/* PAGE 4: ARSITEKTUR STRUKTUR BARU - FISHBONE & 5W1H METRICS */}
    <Page size="A4" orientation="landscape" style={pdfStyles.page}>
      <View style={pdfStyles.header}>
        <View style={pdfStyles.headerLeft}>
          <Text style={pdfStyles.title}>IDS DISCUSS: FISHBONE & 5W1H ANALYSIS</Text>
          <Text style={pdfStyles.subtitle}>Sistem Manajemen Mutu Korporat</Text>
        </View>
      </View>

      {(data.idsSession?.themes || []).map((theme, tIdx) => (
        <View key={tIdx} style={pdfStyles.section} wrap={false}>
          <Text style={[pdfStyles.sectionTitle, { color: "#7e22ce", borderColor: "#e9d5ff" }]}>
            {theme.topic || `Tema Analisis Masalah ${tIdx + 1}`}
          </Text>

          {/* Kondisi Sekarang vs Diinginkan */}
          <View style={pdfStyles.grid2Col}>
            <View style={pdfStyles.colBlock}>
              <Text style={pdfStyles.textBold}>1. Kondisi Sekarang:</Text>
              <Text style={pdfStyles.textArea}>{theme.currentCond || "-"}</Text>
            </View>
            <View style={pdfStyles.colBlock}>
              <Text style={pdfStyles.textBold}>2. Kondisi Diinginkan:</Text>
              <Text style={pdfStyles.textArea}>{theme.desiredCond || "-"}</Text>
            </View>
          </View>

          {/* Analisis Fishbone 5M */}
          <Text style={[pdfStyles.textBold, { marginTop: 4, marginBottom: 2 }]}>3. Analisis Kondisi Lapangan (Fishbone 5M):</Text>
          <View style={pdfStyles.grid5Col}>
            <View style={pdfStyles.colBlock}>
              <Text style={pdfStyles.fishboneLabel}>Man</Text>
              <Text style={pdfStyles.textArea}>{theme.analysis.man || "-"}</Text>
            </View>
            <View style={pdfStyles.colBlock}>
              <Text style={pdfStyles.fishboneLabel}>Method</Text>
              <Text style={pdfStyles.textArea}>{theme.analysis.method || "-"}</Text>
            </View>
            <View style={pdfStyles.colBlock}>
              <Text style={pdfStyles.fishboneLabel}>Machine</Text>
              <Text style={pdfStyles.textArea}>{theme.analysis.machine || "-"}</Text>
            </View>
            <View style={pdfStyles.colBlock}>
              <Text style={pdfStyles.fishboneLabel}>Material</Text>
              <Text style={pdfStyles.textArea}>{theme.analysis.material || "-"}</Text>
            </View>
            <View style={pdfStyles.colBlock}>
              <Text style={pdfStyles.fishboneLabel}>Environment</Text>
              <Text style={pdfStyles.textArea}>{theme.analysis.environment || "-"}</Text>
            </View>
          </View>

          {/* Rantai Sebab Akibat & Akar Masalah */}
          <View style={pdfStyles.grid2Col}>
            <View style={pdfStyles.colBlock}>
              <Text style={pdfStyles.textBold}>4. Analisis Sebab Akibat (5-Why Chain):</Text>
              {(theme.chain || []).map((c, cIdx) => (
                <Text key={cIdx} style={{ fontSize: 8, color: "#475569", marginVertical: 1 }}>
                  • {c.effect || "[Kosong]"} karena {c.cause || "[Kosong]"}
                </Text>
              ))}
              <Text style={[pdfStyles.textBold, { marginTop: 4, color: "#b91c1c" }]}>
                Akar Masalah Utama: <Text style={{ fontWeight: "normal", color: "#1e293b" }}>{theme.rootCause || "-"}</Text>
              </Text>
            </View>

            {/* Rencana Perbaikan 5W1H */}
            <View style={pdfStyles.colBlock}>
              <Text style={pdfStyles.textBold}>5. Rencana Perbaikan (5W+1H Metrics):</Text>
              <View style={{ backgroundColor: "#faf5ff", padding: 6, borderRadius: 4, marginTop: 2, borderLeft: "2pt solid #7e22ce" }}>
                <Text style={{ fontSize: 8 }}><Text style={{ fontWeight: "bold" }}>What (Tindakan):</Text> {theme.plan.what || "-"}</Text>
                <Text style={{ fontSize: 8 }}><Text style={{ fontWeight: "bold" }}>Who (PIC):</Text> {theme.plan.who || "-"}</Text>
                <Text style={{ fontSize: 8 }}><Text style={{ fontWeight: "bold" }}>When (Tenggat):</Text> {theme.plan.when || "-"}</Text>
                <Text style={{ fontSize: 8 }}><Text style={{ fontWeight: "bold" }}>Where (Lokasi):</Text> {theme.plan.where || "-"}</Text>
                <Text style={{ fontSize: 8 }}><Text style={{ fontWeight: "bold" }}>Why (Urgensi):</Text> {theme.plan.why || "-"}</Text>
                <Text style={{ fontSize: 8, color: "#7e22ce", fontWeight: "bold", marginTop: 2 }}>Cost (Biaya): {theme.plan.cost || "-"}</Text>
              </View>
            </View>
          </View>
        </View>
      ))}

      {/* Bagian Akhir Solusi Global */}
      <View style={pdfStyles.section} wrap={false}>
        <Text style={pdfStyles.sectionTitle}>Keputusan / Solusi Final Rapat</Text>
        <Text style={pdfStyles.textArea}>{data.idsSession.solutions || "Tidak ada item solusi spesifik."}</Text>
      </View>
    </Page>
  </Document>
);

// ============================================================================
// 📊 Main Component View Layer Engine
// ============================================================================
export default function L10Meeting({ onSave, isSyncing, initialData }: L10MeetingProps) {
  const t = useTranslations("Tools.L10");

  const getAttendees = () => data.config.divisions.length > 0 
    ? [t("slides.start.owner"), t("slides.start.integrator"), ...data.config.divisions] 
    : [t("slides.start.owner"), t("slides.start.integrator"), "Marketing", "Sales", "Operation", "Finance", "HRD", "Product", "R&D"];

  const [data, setData] = useState<L10Data>(() => {
    if (initialData) {
      // Pastikan struktur themes baru siap digunakan jika meload data lama
      const merged = { ...initialData };
      if (!merged.idsSession) merged.idsSession = { issues: [], themes: [], solutions: "" };
      if (!merged.idsSession.themes || merged.idsSession.themes.length === 0) {
        merged.idsSession.themes = [generateDefaultTheme(1), generateDefaultTheme(2), generateDefaultTheme(3)];
      }
      return merged as L10Data;
    }
    return DEFAULT_DATA;
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const [showSetup, setShowSetup] = useState(!initialData);
  const [activeThemeTab, setActiveThemeTab] = useState<number>(0); // State Tab Pengendali Tema Baru
  
  const [timeLeft, setTimeLeft] = useState(5400); // 90 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerEndTimeRef = useRef<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  // Sinkronisasi data mutakhir ke komponen induk
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSave) onSave(data);
    }, 1500);
    return () => clearTimeout(timer);
  }, [data, onSave]);

  // Logika jam interval presisi tinggi
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

  const totalSlides = 10 + data.config.divisions.length;
  const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, totalSlides - 1));
  const prevSlide = () => setCurrentSlide(prev => Math.max(prev - 1, 0));

  const updateData = (path: string, value: any) => {
    setData(prev => {
      const setDeep = (obj: any, pathKeys: string[], val: any): any => {
        if (pathKeys.length === 0) return val;
        
        const [currentKey, ...remainingKeys] = pathKeys;
        const isArray = Array.isArray(obj);
        const cloned = isArray ? [...(obj || [])] : { ...(obj || {}) };
        const targetKey = isArray ? parseInt(currentKey, 10) : currentKey;
        
        cloned[targetKey] = setDeep(cloned[targetKey], remainingKeys, val);
        return cloned;
      };

      const keys = path.split('.');
      return setDeep(prev, keys, value);
    });
  };

  const attendees = useMemo(() => getAttendees(), [data.config.divisions, t]);

  const averageRating = useMemo(() => {
    const listRoles = data.config.divisions.length > 0 
      ? ["Owner", "Integrator", ...data.config.divisions] 
      : ["Owner", "Integrator", "Marketing", "Sales", "Operation", "Finance", "HRD", "Product", "R&D"];

    let totalScore = 0;
    let activeCount = 0;

    listRoles.forEach((_, idx) => {
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

    // Tarik target dari KPI Scorecard yang 'off'
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

    // Tarik prioritas dari 90-Day Rocks yang 'off'
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
      const sortedIssues = issuesList.sort((a, b) => Number(a.isResolved) - Number(b.isResolved));
      updateData('idsSession.issues', sortedIssues);
    }
  };

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
      link.download = `L10_Quality_Report_${data.config.companyName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("Gagal mengekspor berkas laporan L10.");
    } finally {
      setIsExporting(false);
    }
  };

  const renderSlide = () => {
    if (currentSlide === 0) return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4">
          <div className="mx-auto w-24 h-24 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-600 mb-6 border border-blue-500/20 shadow-sm">
            <Trophy size={48} />
          </div>
          <h1 className="text-6xl font-black tracking-tight text-black dark:text-white">LEVEL 10 MEETING</h1>
          <p className="text-3xl text-blue-500 font-bold uppercase tracking-widest">{data.config.companyName}</p>
        </motion.div>
        
        <div className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl p-8 max-w-md w-full shadow-sm">
          <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-2">Tanggal Rapat Efektif</p>
          <AutoResizeTextarea 
            value={data.meetingDate}
            onChange={(e) => updateData('meetingDate', e.target.value)}
            className="text-2xl font-bold bg-transparent text-black dark:text-[#EEEEEE] text-center focus:ring-0 outline-none w-full p-0 border-none"
          />
        </div>
      </div>
    );

    if (currentSlide === 1) return (
      <div className="space-y-6 flex-1 flex flex-col">
        <div>
          <h2 className="text-4xl font-bold text-black dark:text-white mb-1">Daftar Hadir</h2>
          <p className="text-black font-normal">Pastikan semua peserta terdata (5 Menit Total)</p>
        </div>
        <div className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col shadow-sm flex-1 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pr-1 flex-1">
            {attendees.map((role, i) => (
              <label key={i} className={`cursor-pointer transition-all rounded-xl p-4 flex items-center gap-3 border ${data.attendance[i] ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80'}`}>
                <input 
                  type="checkbox" 
                  checked={data.attendance[i] || false}
                  onChange={(e) => updateData(`attendance.${i}`, e.target.checked)}
                  className="w-5 h-5 rounded-lg bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                />
                <span className={`font-bold text-sm truncate ${data.attendance[i] ? 'text-blue-700 dark:text-blue-300' : 'text-black dark:text-[#EEEEEE]'}`}>{role}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    );

    if (currentSlide === 2) return (
      <div className="space-y-6 flex-1 flex flex-col">
        <div>
          <h2 className="text-4xl font-bold text-black dark:text-white mb-1">Good News</h2>
          <p className="text-black font-normal">Bagikan kabar baik personal & profesional</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full h-auto items-start pb-6">
          {['owner', 'integrator', 'team'].map((pic) => (
            <div key={pic} className="w-full h-auto min-h-[12rem] flex flex-col p-5 rounded-xl bg-white text-black border border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus-within:ring-2 focus-within:ring-emerald-500 transition-all shadow-sm">
              <label className="text-base font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 px-1 text-center mb-2">{pic}</label>
              <AutoResizeTextarea 
                value={data.goodNews[pic as keyof typeof data.goodNews]}
                onChange={(e) => updateData(`goodNews.${pic}`, e.target.value)}
                placeholder={`Kabar baik dari ${pic}...`}
                className="w-full h-auto bg-transparent text-black dark:text-[#EEEEEE] focus:ring-0 outline-none font-medium text-sm placeholder-slate-400 dark:placeholder-slate-500 mt-2 resize-none overflow-hidden"
              />
            </div>
          ))}
        </div>
      </div>
    );

    const divisionIndex = currentSlide - 3;
    if (divisionIndex >= 0 && divisionIndex < data.config.divisions.length) {
      const division = data.config.divisions[divisionIndex];
      const divId = division.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const kpis = data.scorecards[divId] || [];

      return (
        <div className="space-y-6 flex-1 flex flex-col">
          <div>
            <h2 className="text-4xl font-bold text-black dark:text-white mb-1">Scorecard: {division}</h2>
            <p className="text-black font-normal">Review KPI Mingguan</p>
          </div>
          <div className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col pb-6 shadow-sm flex-1">
            <div className="flex-1">
              <table className="w-full border-separate border-spacing-y-2 shadow-sm">
                <thead>
                  <tr className="text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
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
                    <tr key={i} className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl group overflow-hidden shadow-sm">
                      <td className="p-3">
                        <AutoResizeTextarea 
                          value={k.kpi} 
                          onChange={(e) => {
                            const newKpis = [...kpis]; newKpis[i].kpi = e.target.value; updateData(`scorecards.${divId}`, newKpis);
                          }} 
                          className="bg-transparent text-black dark:text-[#EEEEEE] focus:ring-0 w-full font-bold text-sm p-0 border-none" 
                        />
                      </td>
                      <td className="p-3">
                        <AutoResizeTextarea 
                          value={k.target} 
                          onChange={(e) => {
                            const newKpis = [...kpis]; newKpis[i].target = e.target.value; updateData(`scorecards.${divId}`, newKpis);
                          }} 
                          className="bg-transparent text-black dark:text-[#EEEEEE] focus:ring-0 w-full font-medium text-sm p-0 border-none" 
                        />
                      </td>
                      <td className="p-3">
                        <AutoResizeTextarea 
                          value={k.realisasi} 
                          onChange={(e) => {
                            const newKpis = [...kpis]; newKpis[i].realisasi = e.target.value; updateData(`scorecards.${divId}`, newKpis);
                          }} 
                          className="bg-transparent text-black dark:text-[#EEEEEE] focus:ring-0 w-full font-mono text-sm text-blue-600 dark:text-blue-400 p-0 border-none" 
                        />
                      </td>
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
                <div className="text-center py-12 text-black font-medium">Belum ada metrik untuk divisi ini.</div>
              )}
            </div>
            <button 
              onClick={() => updateData(`scorecards.${divId}`, [...kpis, { kpi: "Metric Baru", target: "0", realisasi: "-", jenis: 'output', status: 'on' }])}
              className="mt-4 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:text-blue-500 hover:border-blue-500 transition-all font-bold text-sm bg-white dark:bg-[#1E1E1E] shadow-sm"
            >
              <Plus size={16} /> Tambah Metrik KPI
            </button>
          </div>
        </div>
      );
    }

    const rockReviewSlideIndex = 3 + data.config.divisions.length;
    if (currentSlide === rockReviewSlideIndex) {
      const rocks = data.config.rocks;
      return (
        <div className="space-y-6 flex-1 flex flex-col">
          <div>
            <h2 className="text-4xl font-bold text-black dark:text-white mb-1">Rock Review</h2>
            <p className="text-black font-normal">Prioritas Strategis 90 Hari</p>
          </div>
          <div className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col pb-6 shadow-sm flex-1">
            <div className="flex-1">
              <table className="w-full border-separate border-spacing-y-2 shadow-sm">
                <thead>
                  <tr className="text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
                    <th className="px-4 pb-2 w-[20%]">PIC / Tim</th>
                    <th className="px-4 pb-2 w-[40%]">Target (Rock)</th>
                    <th className="px-4 pb-2 text-center">Status</th>
                    <th className="px-4 pb-2">Catatan Progres</th>
                  </tr>
                </thead>
                <tbody>
                  {rocks.map((rock, i) => (
                    <tr key={i} className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden group shadow-sm">
                      <td className="p-3">
                        <AutoResizeTextarea 
                          value={data.rocksStatus[i]?.pic || ""} 
                          onChange={(e) => {
                            const newStatus = [...data.rocksStatus]; if(!newStatus[i]) newStatus[i] = {pic: "", status: "on", notes: ""};
                            newStatus[i].pic = e.target.value; updateData('rocksStatus', newStatus);
                          }} 
                          placeholder="Nama PIC" 
                          className="bg-transparent text-black dark:text-[#EEEEEE] focus:ring-0 w-full font-bold text-sm p-0 border-none placeholder-slate-400 dark:placeholder-slate-500" 
                        />
                      </td>
                      <td className="p-3 font-bold text-sm text-black dark:text-[#EEEEEE] whitespace-normal break-words leading-relaxed">{rock}</td>
                      <td className="p-3 text-center">
                        <button onClick={() => {
                          const newStatus = [...data.rocksStatus]; if(!newStatus[i]) newStatus[i] = {pic: "", status: "on", notes: ""};
                          newStatus[i].status = newStatus[i].status === 'on' ? 'off' : 'on'; updateData('rocksStatus', newStatus);
                        }} className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${data.rocksStatus[i]?.status === 'off' ? 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20' : 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20'}`}>{data.rocksStatus[i]?.status === 'off' ? 'Off Track' : 'On Track'}</button>
                      </td>
                      <td className="p-3">
                        <AutoResizeTextarea 
                          value={data.rocksStatus[i]?.notes || ""} 
                          onChange={(e) => {
                            const newStatus = [...data.rocksStatus]; if(!newStatus[i]) newStatus[i] = {pic: "", status: "on", notes: ""};
                            newStatus[i].notes = e.target.value; updateData('rocksStatus', newStatus);
                          }} 
                          placeholder="Update status..." 
                          className="bg-transparent text-black dark:text-[#EEEEEE] focus:ring-0 w-full italic text-sm p-0 border-none placeholder-slate-400 dark:placeholder-slate-500" 
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    if (currentSlide === 4 + data.config.divisions.length) return (
      <div className="space-y-6 flex-1 flex flex-col">
        <div>
          <h2 className="text-4xl font-bold text-black dark:text-white mb-1">Headlines</h2>
          <p className="text-black font-normal">Berita Penting Rapat</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4 flex-1">
          {['customer', 'internal'].map(type => (
            <div key={type} className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col space-y-4 shadow-sm flex-1">
              <h3 className={`text-xl font-bold flex items-center gap-2 ${type === 'customer' ? 'text-blue-500' : 'text-emerald-500'}`}><FileText size={20} /> {type === 'customer' ? 'Customer Headlines' : 'Internal Headlines'}</h3>
              <div className="space-y-3 pr-1">
                {(data.headlines[type as keyof typeof data.headlines] || []).map((h, i) => (
                  <div key={i} className="flex gap-3 items-center group bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 p-3 rounded-xl focus-within:ring-2 focus-within:ring-blue-500/20 shadow-sm">
                    <span className="text-sm font-black text-slate-600 dark:text-slate-300 w-4">{i + 1}.</span>
                    <AutoResizeTextarea value={h} onChange={(e) => {
                      const newH = [...data.headlines[type as keyof typeof data.headlines]]; newH[i] = e.target.value; updateData(`headlines.${type}`, newH);
                    }} placeholder="Masukkan berita..." className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm font-semibold text-black dark:text-[#EEEEEE] placeholder-slate-400 dark:placeholder-slate-500" />
                    <button onClick={() => {
                      const newH = data.headlines[type as keyof typeof data.headlines].filter((_, idx) => idx !== i); updateData(`headlines.${type}`, newH);
                    }} className="opacity-0 group-hover:opacity-100 text-rose-500 p-1.5 hover:bg-rose-500/10 rounded-md transition-all"><Trash2 size={16}/></button>
                  </div>
                ))}
                <button onClick={() => updateData(`headlines.${type}`, [...data.headlines[type as keyof typeof data.headlines], ""])} className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:text-blue-500 transition-all font-bold text-xs bg-white dark:bg-[#1E1E1E] shadow-sm">+ Tambah Headline Baru</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    if (currentSlide === 5 + data.config.divisions.length) return (
      <div className="space-y-6 flex-1 flex flex-col">
        <div>
          <h2 className="text-4xl font-bold text-black dark:text-white mb-1">To-Do List</h2>
          <p className="text-black font-normal">Review Minggu Lalu & Action Plan</p>
        </div>
        <div className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col pb-6 shadow-sm flex-1">
          <div className="space-y-3 pr-1 flex-1">
            {data.todoList.map((todo, i) => (
              <div key={todo.id} className="flex items-center gap-4 p-4 bg-white dark:bg-[#1E1E1E] rounded-xl group border border-slate-200 dark:border-slate-800 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-sm">
                <button onClick={() => {
                  const newList = [...data.todoList]; newList[i].isDone = !todo.isDone; updateData('todoList', newList);
                }} className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${todo.isDone ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-[#1E1E1E] border-2 border-slate-200 dark:border-slate-800'}`}>{todo.isDone && <CheckCircle2 size={18} />}</button>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <AutoResizeTextarea value={todo.text} onChange={(e) => {
                    const newList = [...data.todoList]; newList[i].text = e.target.value; updateData('todoList', newList);
                  }} placeholder="Apa tugasnya?" className={`bg-transparent border-none focus:ring-0 w-full font-bold text-base p-0 text-black dark:text-[#EEEEEE] placeholder-slate-400 dark:placeholder-slate-500 ${todo.isDone ? 'line-through opacity-40' : ''}`} />
                  <div className="flex items-center gap-1.5"><span className="text-[9px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Owner:</span>
                    <AutoResizeTextarea 
                      value={todo.owner} 
                      onChange={(e) => {
                        const newList = [...data.todoList]; newList[i].owner = e.target.value; updateData('todoList', newList);
                      }} 
                      className="bg-transparent border-none focus:ring-0 text-xs font-bold text-blue-500 p-0 h-auto w-40" 
                    />
                  </div>
                </div>
                <button onClick={() => {
                  const newList = data.todoList.filter(t => t.id !== todo.id); updateData('todoList', newList);
                }} className="opacity-0 group-hover:opacity-100 text-rose-500 p-2 hover:bg-rose-500/10 rounded-lg transition-all"><Trash2 size={18}/></button>
              </div>
            ))}
            {data.todoList.length === 0 && (
              <div className="text-center py-12 text-black font-medium">Belum ada tugas untuk minggu ini.</div>
            )}
            <button onClick={() => updateData('todoList', [...data.todoList, { id: Date.now(), text: "", owner: "PIC", isDone: false }])} className="w-full p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:text-blue-500 hover:border-blue-500 transition-all font-bold text-sm bg-white dark:bg-[#1E1E1E] shadow-sm">+ Tambah To-Do List Baru</button>
          </div>
        </div>
      </div>
    );

    if (currentSlide === 6 + data.config.divisions.length) return (
      <div className="space-y-6 flex-1 flex flex-col">
        <div className="flex justify-between items-center flex-shrink-0">
          <div><h2 className="text-4xl font-bold text-black dark:text-white mb-1">IDS: 1. Identify</h2><p className="text-black font-normal">Daftar Isu dan Masalah (60 Menit Total)</p></div>
          <button onClick={pullOffTrackData} className="flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold transition-all active:scale-95 text-sm shadow-sm"><RefreshCw size={18} /> Tarik Data Off-Track</button>
        </div>
        <div className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col shadow-sm flex-1">
          <div className="space-y-3 pr-1 flex-1">
            {(data.idsSession?.issues || []).map((issue, i) => (
              <div key={issue.id} className={`flex items-start gap-3 p-4 rounded-2xl group border transition-all h-auto ${issue.isResolved ? 'bg-slate-50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 opacity-50' : 'bg-white dark:bg-[#1E1E1E] border-slate-200 dark:border-slate-800 shadow-sm'}`}>
                <input type="checkbox" checked={issue.isResolved} onChange={(e) => handleIssueCheck(i, e.target.checked)} className="mt-1.5 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                <div className="flex-1 min-w-0 space-y-1">
                  <span className="inline-block px-2.5 py-1 rounded-lg text-[10px] bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 font-extrabold uppercase tracking-widest shadow-sm">{issue.source}</span>
                  <AutoResizeTextarea
                    rows={2}
                    value={issue.text}
                    onChange={(e) => {
                      const newI = [...(data.idsSession?.issues || [])]; newI[i].text = e.target.value; updateData('idsSession.issues', newI);
                    }}
                    className={`w-full min-h-[44px] break-words whitespace-pre-wrap bg-transparent border-none focus:ring-0 p-0 text-sm font-bold text-black dark:text-[#EEEEEE] transition-all ${issue.isResolved ? 'line-through font-medium' : ''}`}
                  />
                </div>
                <button onClick={() => {
                  const newI = (data.idsSession?.issues || []).filter((_, idx) => idx !== i); updateData('idsSession.issues', newI);
                }} className="opacity-0 group-hover:opacity-100 text-rose-500 p-1.5 hover:bg-rose-500/10 rounded-lg transition-all flex-shrink-0"><Trash2 size={16}/></button>
              </div>
            ))}
            <button onClick={() => updateData('idsSession.issues', [...(data.idsSession?.issues || []), { id: `manual-${Date.now()}`, source: 'Manual', text: 'Masalah baru...', isResolved: false }])} className="w-full py-3.5 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-300 hover:text-blue-500 transition-all font-bold text-xs bg-white dark:bg-[#1E1E1E] shadow-sm">+ Input Masalah Baru</button>
          </div>
        </div>
      </div>
    );

    // ============================================================================
    // ⚙️ REFACTORING SLIDE 7: FISHBONE & 5W1H QUALITY MATRIX ENGINE (DISCUSS)
    // ============================================================================
    if (currentSlide === 7 + data.config.divisions.length) {
      const currentTheme = data.idsSession.themes[activeThemeTab] || generateDefaultTheme(activeThemeTab + 1);

      return (
        <div className="space-y-4 flex-1 flex flex-col h-full w-full">
          <div className="flex justify-between items-center flex-shrink-0">
            <div>
              <h2 className="text-3xl font-black text-black dark:text-white mb-0.5">IDS: 2. Discuss Matrix</h2>
              <p className="text-sm font-bold text-purple-600 dark:text-purple-400">Analisis Akar Masalah (Fishbone / Ishikawa 5M & Rencana 5W+1H)</p>
            </div>
            {/* Tab Pengendali 3 Tema */}
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
              {[0, 1, 2].map((idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveThemeTab(idx)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                    activeThemeTab === idx 
                      ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-md scale-105' 
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-1.5"><Layers size={14} /> Tema {idx + 1}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col shadow-xl flex-1 overflow-y-auto max-h-[70vh] custom-scrollbar gap-5">
            {/* Isian Judul Tema */}
            <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
              <label className="text-[10px] font-black text-purple-500 uppercase tracking-widest block mb-1">Judul Topik / Masalah Tema {activeThemeTab + 1}</label>
              <AutoResizeTextarea
                value={currentTheme.topic}
                onChange={(e) => updateData(`idsSession.themes.${activeThemeTab}.topic`, e.target.value)}
                placeholder="Tuliskan nama topik/isu besar yang sedang dibahas di sini..."
                className="bg-transparent font-black text-lg text-black dark:text-[#EEEEEE] outline-none focus:ring-0 border-none p-0"
              />
            </div>

            {/* 1 & 2: Kondisi Sekarang vs Diinginkan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#1E1E1E] focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <label className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest block mb-2">1. Kondisi Sekarang (Current State)</label>
                <AutoResizeTextarea
                  rows={2}
                  value={currentTheme.currentCond}
                  onChange={(e) => updateData(`idsSession.themes.${activeThemeTab}.currentCond`, e.target.value)}
                  placeholder="Bagaimana realita buruk atau hambatan di lapangan saat ini?"
                  className="bg-transparent text-sm font-semibold text-black dark:text-[#EEEEEE] outline-none focus:ring-0 border-none p-0"
                />
              </div>
              <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#1E1E1E] focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-2">2. Kondisi Diinginkan (Goal State)</label>
                <AutoResizeTextarea
                  rows={2}
                  value={currentTheme.desiredCond}
                  onChange={(e) => updateData(`idsSession.themes.${activeThemeTab}.desiredCond`, e.target.value)}
                  placeholder="Target pencapaian ideal atau standar kuantitas yang ingin dituju?"
                  className="bg-transparent text-sm font-semibold text-black dark:text-[#EEEEEE] outline-none focus:ring-0 border-none p-0"
                />
              </div>
            </div>

            {/* 3: Analisa Kondisi Lapangan (Fishbone 5M) */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1"><FileSpreadsheet size={16} className="text-purple-500"/> 3. Analisa Kondisi yang Ada (Kerangka Diagram Fishbone 5M)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {['man', 'method', 'machine', 'material', 'environment'].map((mField) => (
                  <div key={mField} className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/20 focus-within:bg-white dark:focus-within:bg-[#1E1E1E] focus-within:ring-2 focus-within:ring-purple-500/30 transition-all">
                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase block mb-1">{mField}</label>
                    <AutoResizeTextarea
                      rows={2}
                      value={currentTheme.analysis[mField as keyof typeof currentTheme.analysis] || ""}
                      onChange={(e) => updateData(`idsSession.themes.${activeThemeTab}.analysis.${mField}`, e.target.value)}
                      placeholder={`Faktor ${mField}...`}
                      className="bg-transparent text-xs font-bold text-black dark:text-[#EEEEEE] outline-none focus:ring-0 border-none p-0 placeholder-slate-400"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 4: Analisa Sebab Akibat (Rantai 5-Whys) */}
            <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#1E1E1E] space-y-3">
              <label className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1"><HelpCircle size={16}/> 4. Analisa Sebab Akibat (5-Why Chain Analysis)</label>
              <div className="space-y-2">
                {(currentTheme.chain || Array(5).fill({effect: "", cause: ""})).map((item, cIdx) => (
                  <div key={cIdx} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                    <span className="text-xs font-black text-slate-400 w-5">{cIdx + 1}.</span>
                    <AutoResizeTextarea
                      value={item.effect}
                      onChange={(e) => updateData(`idsSession.themes.${activeThemeTab}.chain.${cIdx}.effect`, e.target.value)}
                      placeholder="Akibat / Gejala Masalah"
                      className="flex-1 bg-transparent text-xs font-bold text-black dark:text-[#EEEEEE] outline-none focus:ring-0 border-none p-0"
                    />
                    <span className="text-xs font-black text-rose-500 uppercase px-2">karena</span>
                    <AutoResizeTextarea
                      value={item.cause}
                      onChange={(e) => updateData(`idsSession.themes.${activeThemeTab}.chain.${cIdx}.cause`, e.target.value)}
                      placeholder="Sebab / Pemicu Masalah"
                      className="flex-1 bg-transparent text-xs font-bold text-black dark:text-[#EEEEEE] outline-none focus:ring-0 border-none p-0"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <span className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase whitespace-nowrap">Akar Masalahnya Adalah:</span>
                <AutoResizeTextarea
                  value={currentTheme.rootCause}
                  onChange={(e) => updateData(`idsSession.themes.${activeThemeTab}.rootCause`, e.target.value)}
                  placeholder="Tulis kesimpulan akar masalah terdalam (Root Cause) hasil telaah 5-Why di atas..."
                  className="flex-1 bg-transparent text-sm font-black text-black dark:text-[#EEEEEE] border-b-2 border-dashed border-rose-400 focus:border-rose-600 outline-none focus:ring-0 p-0 pb-0.5"
                />
              </div>
            </div>

            {/* 5: Rencana Perbaikan (5W+1H) */}
            <div className="p-5 border border-purple-200 dark:border-purple-900 rounded-xl bg-purple-50/10 dark:bg-purple-950/10 space-y-3">
              <label className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider block">5. Rencana Perbaikan (Action Plan 5W+1H Matrix)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { field: 'what', label: 'Apa yang akan dilakukan? (What)', color: 'focus-within:ring-purple-500/30' },
                  { field: 'who', label: 'Siapa yang bertugas? (Who)', color: 'focus-within:ring-blue-500/30' },
                  { field: 'when', label: 'Kapan akan selesai? (When)', color: 'focus-within:ring-orange-500/30' },
                  { field: 'where', label: 'Dimana dikerjakan? (Where)', color: 'focus-within:ring-slate-500/30' },
                  { field: 'why', label: 'Kenapa harus dilakukan? (Why)', color: 'focus-within:ring-rose-500/30' },
                  { field: 'cost', label: 'Berapa biayanya? (Cost)', color: 'focus-within:ring-emerald-500/30' }
                ].map((pItem) => (
                  <div key={pItem.field} className={`p-3 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl transition-all ${pItem.color}`}>
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 block mb-1.5 uppercase tracking-wide">{pItem.label}</label>
                    <AutoResizeTextarea
                      value={currentTheme.plan[pItem.field as keyof typeof currentTheme.plan] || ""}
                      onChange={(e) => updateData(`idsSession.themes.${activeThemeTab}.plan.${pItem.field}`, e.target.value)}
                      placeholder="Isian deskripsi..."
                      className="bg-transparent text-xs font-black text-black dark:text-[#EEEEEE] outline-none focus:ring-0 border-none p-0"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (currentSlide === 8 + data.config.divisions.length) return (
      <div className="space-y-6 flex-1 flex flex-col h-auto w-full">
        <div><h2 className="text-4xl font-bold text-black dark:text-white mb-1">IDS Session</h2><p className="text-black font-normal">3. Solve / Resolutions</p></div>
        <div className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col shadow-sm h-auto min-h-[28rem] w-full">
          <h3 className="text-base font-black border-b border-slate-200 dark:border-slate-800 pb-4 text-purple-500 uppercase tracking-wider shadow-sm">Solusi Final & Eksekusi</h3>
          <AutoResizeTextarea
            rows={6}
            value={data.idsSession.solutions}
            onChange={(e) => updateData('idsSession.solutions', e.target.value)}
            placeholder="Apa keputusan akhir atau solusi konkritnya? Tulis di sini..."
            className="w-full h-auto bg-transparent text-black dark:text-[#EEEEEE] focus:ring-0 outline-none text-base font-bold leading-relaxed mt-5 resize-none overflow-hidden"
          />
        </div>
      </div>
    );

    if (currentSlide === 9 + data.config.divisions.length) return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-10">
        <div className="space-y-2 flex-shrink-0"><h2 className="text-5xl font-black text-black dark:text-white">Conclude</h2><p className="text-black font-bold italic tracking-wide">"Seberapa efektif rapat ini bagi pencapaian visi?" (1 - 10)</p></div>
        <div className="space-y-1 flex-shrink-0 relative">
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-[12rem] font-black leading-none tracking-tighter text-blue-600 drop-shadow-2xl">{averageRating}</motion.div>
          <p className="text-sm font-bold text-black uppercase tracking-[0.4em]">Composite Quality Score</p>
        </div>
        <div className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 p-10 rounded-xl max-w-full w-full flex flex-wrap justify-center gap-6 max-h-[250px] custom-scrollbar backdrop-blur-sm shadow-sm">
          {attendees.map((role, i) => data.attendance[i] ? (
            <div key={i} className="flex flex-col items-center gap-2.5 w-28">
              <label className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest truncate w-full text-center" title={role}>{role}</label>
              <AutoResizeTextarea
                placeholder="0"
                value={data.ratings?.[i] !== undefined ? String(data.ratings[i]) : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || /^[0-9]*\.?[0-9]*$/.test(val)) {
                    const numVal = parseFloat(val);
                    if (val === "" || (numVal >= 0 && numVal <= 10)) {
                      updateData(`ratings.${i}`, val);
                    }
                  }
                }}
                disabled={!data.attendance?.[i]}
                className={`w-24 px-4 py-3 rounded-xl border font-bold text-center text-lg outline-none transition-all ${
                  data.attendance?.[i]
                    ? "bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:ring-4 focus:ring-blue-500/10"
                    : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed"
                }`}
              />
            </div>
          ) : null)}
          {Object.values(data.attendance).filter(Boolean).length === 0 && (
            <p className="text-base font-bold text-black py-6">Pilih peserta yang hadir untuk memberikan rating.</p>
          )}
        </div>
      </div>
    );
    return null;
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] w-full flex flex-col bg-white dark:bg-slate-950 p-1 select-none">
      {/* Top Navigation & Status */}
      <div className="flex justify-between items-center p-8 z-40 flex-shrink-0">
        <div className="flex items-center gap-5">
          <div className={`bg-white dark:bg-slate-900/80 backdrop-blur-xl px-8 py-3.5 rounded-3xl flex items-center gap-5 shadow-lg border border-black dark:border-slate-800/50 ${timeLeft < 300 ? 'bg-rose-500/10 text-rose-600' : 'text-blue-600 dark:text-blue-400'}`}>
            <Clock size={24} /><span className="text-3xl font-black font-mono tracking-tighter">{formatTime(timeLeft)}</span>
            <div className="flex gap-4 border-l border-black dark:border-slate-800 pl-5 shadow-sm">
              <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="hover:scale-110 transition-transform active:scale-95 text-black dark:text-slate-300">{isTimerRunning ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}</button>
              <button onClick={() => { setTimeLeft(5400); setIsTimerRunning(false); }} className="hover:scale-110 transition-transform active:scale-95 text-black dark:text-slate-300"><RotateCcw size={20} /></button>
            </div>
          </div>

          <button 
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-3 px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-3xl font-black hover:scale-105 transition-all text-xs active:scale-95 disabled:opacity-50 disabled:grayscale shadow-md"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {isExporting ? "GENERATING PDF..." : "EXPORT L10 REPORT"}
          </button>

          <div title={isSyncing ? "Menyimpan data..." : "Semua perubahan disimpan"} className="flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
            {isSyncing ? <Loader2 size={16} className="animate-spin text-blue-500" /> : <Cloud size={16} className="text-emerald-600" />}
          </div>
        </div>
        <button onClick={() => setShowSetup(true)} className="p-4 rounded-3xl bg-white dark:bg-slate-900 shadow-lg border border-slate-200 dark:border-slate-800 text-black dark:text-slate-100 hover:text-blue-500 hover:rotate-90 transition-all duration-700 active:scale-90"><Settings size={24} /></button>
      </div>

      {/* Slide Canvas */}
      <div className="flex-1 px-4 md:px-6 xl:px-8 pb-12 pt-4 relative overflow-visible flex flex-col">
        <div className="flex-grow flex flex-col w-full h-full bg-transparent">
          <AnimatePresence mode="wait">
            <motion.div key={currentSlide} initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.98 }} transition={{ type: "spring", stiffness: 100, damping: 20 }} className="flex-grow flex flex-col w-full h-full">
              {renderSlide()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="fixed bottom-6 right-8 flex items-center gap-3 z-[100] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 p-3 rounded-2xl shadow-xl aksana-glass">
        <button onClick={prevSlide} disabled={currentSlide === 0} className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-500/10 disabled:opacity-30 transition-colors active:scale-90"><ChevronLeft size={24} /></button>
        <button onClick={nextSlide} disabled={currentSlide === totalSlides - 1} className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-500/10 disabled:opacity-30 transition-colors active:scale-90"><ChevronRight size={24} /></button>
      </div>

      {/* Setup Modal */}
      <AnimatePresence>
        {showSetup && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-slate-950/80 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-12 rounded-xl relative max-h-[90vh] flex flex-col overflow-hidden aksana-glass shadow-2xl">
              <button onClick={() => setShowSetup(false)} className="absolute top-8 right-8 text-black dark:text-slate-100 hover:text-rose-500 transition-all active:scale-90"><X size={28} /></button>
              <div className="space-y-8 flex flex-col flex-1 min-h-0">
                <div className="text-center flex-shrink-0 space-y-1"><h2 className="text-3xl font-black text-black dark:text-white">Meeting Engine Setup</h2><p className="text-black font-bold tracking-tight">Konfigurasi struktur rapat untuk efisiensi maksimal.</p></div>
                <div className="space-y-6 flex-1 overflow-y-auto pr-3 custom-scrollbar pb-4">
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest ml-1">Company / Organization</label>
                    <AutoResizeTextarea 
                      value={data.config.companyName} 
                      onChange={(e) => updateData('config.companyName', e.target.value)} 
                      className="w-full px-5 py-4 rounded-2xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:ring-4 focus:ring-black/5 font-black text-lg outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-600 dark:text-slate-300 tracking-wider mb-3 uppercase">
                      DIVISI PESERTA RAPAT
                    </label>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 mb-3">
                      {data.config.divisions.map((division, i) => (
                        <div key={i} className="flex items-center gap-3 group">
                          <AutoResizeTextarea
                            value={division}
                            placeholder={`Nama Divisi ${i + 1}`}
                            onChange={(e) => {
                              const newDivisions = [...data.config.divisions];
                              newDivisions[i] = e.target.value;
                              updateData('config.divisions', newDivisions);
                            }}
                            className="flex-1 px-5 py-3 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:ring-4 focus:ring-black/5 text-sm font-bold outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500"
                          />
                          <button
                            onClick={() => {
                              const newDivisions = data.config.divisions.filter((_, idx) => idx !== i);
                              updateData('config.divisions', newDivisions);
                              if (data.ratings) {
                                const newRatings = { ...data.ratings };
                                delete newRatings[i + 2];
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
                      className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:text-blue-500 hover:border-blue-500 transition-all font-black text-xs bg-white dark:bg-[#1E1E1E] flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Plus size={14} /> + TAMBAH DIVISI BARU
                    </button>
                  </div>
                  <div className="space-y-3"><label className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest ml-1">Quarterly Rocks (Priorities)</label>
                    <div className="space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                      {data.config.rocks.map((rock, i) => (
                        <div key={i} className="flex gap-3 group">
                          <AutoResizeTextarea value={rock} onChange={(e) => {
                            const newRocks = [...data.config.rocks]; newRocks[i] = e.target.value; updateData('config.rocks', newRocks);
                          }} className="flex-1 px-5 py-3 rounded-xl bg-white text-black border-slate-200 dark:bg-[#1E1E1E] dark:text-[#EEEEEE] dark:border-slate-700 focus:ring-4 focus:ring-blue-500/10 text-sm font-bold outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500 whitespace-normal break-words leading-relaxed" />
                          <button onClick={() => updateData('config.rocks', data.config.rocks.filter((_, idx) => idx !== i))} className="p-3 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"><Trash2 size={18}/></button>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => updateData('config.rocks', [...data.config.rocks, ""])} className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:text-blue-500 hover:border-blue-500 transition-all font-black text-xs bg-white dark:bg-[#1E1E1E] shadow-sm">+ ADD NEW ROCK</button>
                  </div>
                </div>
                <button onClick={() => setShowSetup(false)} className="w-full py-5 rounded-[2rem] bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-black text-lg shadow-2xl active:scale-[0.97] transition-all flex-shrink-0">LAUNCH MEETING SESSION</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

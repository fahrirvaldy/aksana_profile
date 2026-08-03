import { StyleSheet } from "@react-pdf/renderer";

export const pdfStyles = StyleSheet.create({
  page: { 
    padding: 30, 
    backgroundColor: "#fbfcfd", 
    fontSize: 9, 
    color: "#1e293b", 
    fontFamily: "Helvetica" 
  },
  header: { 
    borderBottomWidth: 2,
    borderBottomStyle: "solid",
    borderBottomColor: "#3b82f6",
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
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#e2e8f0"
  },
  sectionTitle: { 
    fontSize: 12, 
    fontWeight: "bold", 
    marginBottom: 8, 
    color: "#0f172a", 
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "#f1f5f9",
    paddingBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  row: { 
    flexDirection: "row", 
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "#f1f5f9",
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
  
  // Perbaikan teks area untuk deskripsi masalah yang panjang
  textArea: { 
    marginTop: 4, 
    padding: 8, 
    backgroundColor: "#f8fafc", 
    borderRadius: 4, 
    minHeight: 35, 
    fontSize: 9, 
    lineHeight: 1.5,
    color: "#475569",
    borderWidth: 0.5,
    borderStyle: "solid",
    borderColor: "#e2e8f0",
    wordBreak: "break-all", // Memaksa string panjang melipat ke bawah
    flexWrap: "wrap"
  },
  ratingCircle: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: "#3b82f6", color: "#ffffff", justifyContent: "center", alignItems: "center" },
  ratingValue: { fontSize: 16, fontWeight: "bold" },
  grid2Col: { flexDirection: "row", gap: 10, marginBottom: 8 },
  
  // Perbaikan Grid 5 Kolom Fishbone & 5W1H agar tidak menabrak
  grid5Col: { 
    flexDirection: "row", 
    gap: 6, 
    marginBottom: 8,
    width: "100%"
  },
  colBlock: { 
    width: "18%", // Membatasi lebar pasti tiap kolom agar tidak saling tumpang tindih
    wordBreak: "break-all", // Memotong paksa kata acak tanpa spasi
    flexWrap: "wrap"
  },
  fishboneLabel: { fontSize: 8, fontWeight: "bold", color: "#475569", textTransform: "uppercase", marginBottom: 2 }
});

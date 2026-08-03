
import { PsychoScores } from "./types";

export const PSYCHO_QUESTIONS = [
  {
    id: 1,
    question: "Saat terjadi krisis mendadak di mana klien besar komplain terkait hasil kerja tim Anda, apa insting pertama Anda?",
    options: [
      { text: "Mengumpulkan tim untuk segera membagi tugas penanganan darurat.", trait: 'leadership' as keyof PsychoScores },
      { text: "Menganalisis log data dan laporan sebelumnya untuk mencari letak kesalahan pasti.", trait: 'detail' as keyof PsychoScores },
      { text: "Memikirkan kompensasi kreatif atau layanan tambahan untuk menenangkan klien.", trait: 'creativity' as keyof PsychoScores },
      { text: "Langsung menelepon klien dan menyelesaikan masalah teknisnya saat itu juga.", trait: 'execution' as keyof PsychoScores }
    ]
  },
  {
    id: 2,
    question: "Jika Anda diminta untuk memimpin proyek peluncuran produk baru, bagian mana yang paling Anda nikmati?",
    options: [
      { text: "Merancang konsep produk dan strategi branding yang belum pernah ada.", trait: 'creativity' as keyof PsychoScores },
      { text: "Memastikan timeline berjalan cepat dan target mingguan tercapai tanpa alasan.", trait: 'execution' as keyof PsychoScores },
      { text: "Menyusun SOP rinci dan mengecek QA (Quality Assurance) sebelum rilis.", trait: 'detail' as keyof PsychoScores },
      { text: "Memotivasi anggota tim lintas divisi agar visi produk sejalan.", trait: 'leadership' as keyof PsychoScores }
    ]
  },
  {
    id: 3,
    question: "Kolega Anda sedang cuti dan Anda harus mem-backup pekerjaannya yang berisi ratusan baris data spreadsheet. Reaksi Anda?",
    options: [
      { text: "Bagus. Saya suka merapikan dan memastikan angka-angkanya akurat.", trait: 'detail' as keyof PsychoScores },
      { text: "Saya akan mendelegasikan beberapa bagian ke staf lain agar lebih efisien.", trait: 'leadership' as keyof PsychoScores },
      { text: "Saya kerjakan secepat mungkin agar target hari ini tetap selesai.", trait: 'execution' as keyof PsychoScores },
      { text: "Saya akan mencoba membuat rumus/makro baru agar formatnya lebih menarik dan mudah dibaca.", trait: 'creativity' as keyof PsychoScores }
    ]
  },
  {
    id: 4,
    question: "Dalam rapat evaluasi tahunan, gaya komunikasi Anda biasanya...",
    options: [
      { text: "Fokus pada poin-poin aksi (action items) untuk segera dieksekusi besok.", trait: 'execution' as keyof PsychoScores },
      { text: "Memberikan ide-ide liar tentang arah perusahaan ke depan.", trait: 'creativity' as keyof PsychoScores },
      { text: "Mengarahkan diskusi agar semua anggota tim mendapat kesempatan bicara.", trait: 'leadership' as keyof PsychoScores },
      { text: "Membawa catatan lengkap tentang metrik dan KPI yang tercapai/gagal.", trait: 'detail' as keyof PsychoScores }
    ]
  },
  {
    id: 5,
    question: "Apa kelemahan terbesar yang sering Anda (atau orang lain) sadari dalam diri Anda?",
    options: [
      { text: "Sering mengabaikan aturan kecil demi mencapai tujuan dengan cepat.", trait: 'execution' as keyof PsychoScores },
      { text: "Terlalu perfeksionis pada hal kecil sehingga kadang lambat.", trait: 'detail' as keyof PsychoScores },
      { text: "Sering melompat dari satu ide ke ide lain sebelum ide pertama selesai.", trait: 'creativity' as keyof PsychoScores },
      { text: "Terlalu mengambil alih pekerjaan karena kurang sabar melihat tim yang lambat.", trait: 'leadership' as keyof PsychoScores }
    ]
  }
];

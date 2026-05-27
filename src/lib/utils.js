import {
  Utensils, Car, Bath, Gamepad2, ShieldAlert, ShoppingCart, Pill, Lightbulb, BookOpen, Package,
  Briefcase, Store, Laptop, TrendingUp, Gift, Send, Coins
} from 'lucide-react'

// ==========================================
// FORMAT UTILITIES
// ==========================================

/**
 * Format angka ke format Rupiah
 * @param {number} amount
 * @param {boolean} short - singkat (3.5jt, 500rb)
 */
export function formatRupiah(amount, short = false) {
  if (!amount && amount !== 0) return 'Rp 0'
  if (short) {
    if (Math.abs(amount) >= 1_000_000_000)
      return `Rp ${(amount / 1_000_000_000).toFixed(1)}M`
    if (Math.abs(amount) >= 1_000_000)
      return `Rp ${(amount / 1_000_000).toFixed(1)}jt`
    if (Math.abs(amount) >= 1_000)
      return `Rp ${(amount / 1_000).toFixed(0)}rb`
    return `Rp ${amount}`
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format tanggal ke Indonesia
 * @param {string} dateStr - YYYY-MM-DD
 * @param {string} format - 'long' | 'short' | 'numeric'
 */
export function formatTanggal(dateStr, format = 'long') {
  if (!dateStr) return '-'
  const date = new Date(dateStr + 'T00:00:00')
  const opts = {
    long:    { day: 'numeric', month: 'long', year: 'numeric' },
    short:   { day: '2-digit', month: 'short', year: 'numeric' },
    numeric: { day: '2-digit', month: '2-digit', year: 'numeric' },
  }
  return date.toLocaleDateString('id-ID', opts[format] || opts.long)
}

/**
 * Format bulan (YYYY-MM) ke nama bulan
 */
export function formatBulan(bulanStr) {
  if (!bulanStr) return '-'
  const [year, month] = bulanStr.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1, 1)
  return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

/**
 * Mendapatkan bulan saat ini dalam format YYYY-MM
 */
export function getBulanIni() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Mendapatkan tanggal hari ini dalam format YYYY-MM-DD
 */
export function getTanggalHariIni() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

/**
 * Jumlah hari dalam bulan
 */
export function getDaysInMonth(bulanStr) {
  const [year, month] = bulanStr.split('-').map(Number)
  return new Date(year, month, 0).getDate()
}

/**
 * Hari ke berapa dalam bulan ini
 */
export function getHariKe(bulanStr) {
  const now = new Date()
  const currentBulan = getBulanIni()
  if (bulanStr !== currentBulan) return getDaysInMonth(bulanStr)
  return now.getDate()
}

/**
 * Menghitung total hari antara dua tanggal (inklusif)
 */
export function getPeriodeDays(startDateStr, endDateStr) {
  const start = new Date(startDateStr + 'T00:00:00')
  const end = new Date(endDateStr + 'T00:00:00')
  const diffTime = Math.abs(end - start)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
}

/**
 * Menghitung hari ke berapa saat ini di dalam periode
 */
export function getCurrentDayInPeriode(startDateStr, endDateStr) {
  const start = new Date(startDateStr + 'T00:00:00')
  const end = new Date(endDateStr + 'T00:00:00')
  const now = new Date()
  
  // Jika belum mulai
  if (now < start) return 0
  // Jika sudah lewat
  if (now > end) return getPeriodeDays(startDateStr, endDateStr)
  
  const diffTime = Math.abs(now - start)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Menghitung sisa hari dalam periode (dari hari ini ke tanggal selesai)
 */
export function getSisaHariDalamPeriode(endDateStr) {
  const end = new Date(endDateStr + 'T00:00:00')
  const now = new Date()
  if (now > end) return 0
  const diffTime = Math.abs(end - now)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// ==========================================
// BUDGET CALCULATOR
// ==========================================

export const PROFIL_BOBOT = {
  mahasiswa:  { makan: 0.50, transportasi: 0.20, kebersihan: 0.10, hiburan: 0.10, darurat: 0.10 },
  karyawan:   { makan: 0.35, transportasi: 0.30, kebersihan: 0.10, hiburan: 0.15, darurat: 0.10 },
  wirausaha:  { makan: 0.35, transportasi: 0.25, kebersihan: 0.10, hiburan: 0.10, darurat: 0.20 },
  freelancer: { makan: 0.40, transportasi: 0.20, kebersihan: 0.10, hiburan: 0.15, darurat: 0.15 },
  irt:        { makan: 0.50, transportasi: 0.15, kebersihan: 0.20, hiburan: 0.05, darurat: 0.10 },
  lainnya:    { makan: 0.40, transportasi: 0.20, kebersihan: 0.15, hiburan: 0.10, darurat: 0.15 },
}

export const PROFIL_LABEL = {
  mahasiswa:  'Mahasiswa / Pelajar',
  karyawan:   'Karyawan / Pegawai',
  wirausaha:  'Wirausaha / Pengusaha',
  freelancer: 'Freelancer',
  irt:        'Ibu / Bapak Rumah Tangga',
  lainnya:    'Lainnya',
}

export const KATEGORI_KEBUTUHAN_LABEL = {
  makan:        'Makan & Minum',
  transportasi: 'Transportasi',
  kebersihan:   'Perlengkapan Mandi & Kebersihan',
  hiburan:      'Hiburan & Rekreasi',
  darurat:      'Dana Darurat',
}

// Icon per kategori kebutuhan
export const KATEGORI_KEBUTUHAN_ICON = {
  makan: Utensils, transportasi: Car, kebersihan: Bath, hiburan: Gamepad2, darurat: ShieldAlert,
}

// Frekuensi default yang paling natural per kategori
export const KATEGORI_KEBUTUHAN_FREKUENSI_DEFAULT = {
  makan:        'harian',
  transportasi: 'harian',
  kebersihan:   'mingguan',
  hiburan:      'mingguan',
  darurat:      'bulanan',
}

/**
 * Normalisasi pemasukan ke bulanan
 */
export function normalisasiBulanan(jumlah, frekuensi) {
  if (frekuensi === 'harian')   return jumlah * 30
  if (frekuensi === 'mingguan') return jumlah * 4
  return jumlah
}

/**
 * Normalisasi pengeluaran kebutuhan ke nilai harian
 * kebalikan dari normalisasiBulanan — untuk spending dibagi bukan dikali
 */
export function normalisasiKeHarian(jumlah, frekuensi) {
  if (frekuensi === 'mingguan') return jumlah / 7
  if (frekuensi === 'bulanan')  return jumlah / 30
  return jumlah // harian
}

/**
 * Hitung budget harian berdasarkan pemasukan & target tabungan
 */
export function hitungBudgetHarian(pemasukanBulanan, targetTabungan, totalDays = 30) {
  const available = Math.max(0, pemasukanBulanan - targetTabungan)
  return Math.round(available / Math.max(1, totalDays))
}

/**
 * Hitung breakdown budget harian per kategori (simple, tanpa user input)
 */
export function hitungBreakdownHarian(budgetHarian, profesi) {
  const bobot = PROFIL_BOBOT[profesi] || PROFIL_BOBOT.lainnya
  return Object.entries(bobot).reduce((acc, [key, pct]) => {
    acc[key] = Math.round(budgetHarian * pct)
    return acc
  }, {})
}

/**
 * Hitung Smart Breakdown — dengan redistribusi surplus antar kategori.
 *
 * Algoritma:
 * 1. Hitung rekomendasi per kategori (dari profil bobot × budgetHarian)
 * 2. Bandingkan dengan estimasi user (sudah dinormalisasi ke per hari)
 * 3. Kumpulkan surplus dari kategori "hemat" (user < rekomendasi)
 * 4. Gunakan surplus untuk menutup deficit kategori "boros"
 * 5. Hanya tandai "perlu perhatian" jika deficit tidak bisa ditutup surplus
 *
 * @returns Object per kategori: { recommended, userVal, diff, status, coveredBy }
 *   status: 'hemat' | 'sesuai' | 'covered' | 'perhatian'
 *   - hemat    : user lebih hemat, ada surplus → aman ✅
 *   - sesuai   : sama dengan rekomendasi → aman ✅
 *   - covered  : user lebih tinggi, tapi surplus dari kategori lain menutup → aman ⚠️ ringan
 *   - perhatian: user lebih tinggi, surplus tidak cukup → perlu dikurangi 🔴
 */
export function hitungSmartBreakdown(budgetHarian, profesi, kebutuhanHarian) {
  const bobot = PROFIL_BOBOT[profesi] || PROFIL_BOBOT.lainnya
  const keys = Object.keys(bobot)

  // Filter kategori yang diisi oleh user
  const filledKeys = keys.filter(k => (kebutuhanHarian[k] || 0) > 0)
  
  // Jika user belum isi kebutuhan sama sekali, kembalikan rekomendasi default
  if (filledKeys.length === 0) {
    return keys.reduce((acc, k) => {
      const rec = Math.round(budgetHarian * bobot[k])
      acc[k] = { recommended: rec, userVal: rec, diff: 0, status: 'sesuai' }
      return acc
    }, {})
  }

  // Hitung total bobot dari kategori yang diisi
  const totalFilledWeight = filledKeys.reduce((sum, k) => sum + bobot[k], 0)

  // Step 1: Rekomendasi sistem berdasarkan bobot yang dinormalisasi
  const recommended = {}
  keys.forEach(k => {
    if (filledKeys.includes(k)) {
      // Normalisasi bobot agar proporsional mengisi budget
      const normalizedWeight = bobot[k] / totalFilledWeight
      recommended[k] = Math.round(budgetHarian * normalizedWeight)
    } else {
      recommended[k] = 0 // Jika tidak diisi, rekomendasi 0
    }
  })

  // Step 2: Hitung diff per kategori
  const diffs = {}
  let totalSurplus = 0
  filledKeys.forEach(k => {
    const userVal = kebutuhanHarian[k]
    const diff = recommended[k] - userVal
    diffs[k] = { userVal, diff }
    if (diff > 0) totalSurplus += diff
  })

  // Step 3: Tutup deficit pakai surplus
  const deficitKeys = filledKeys
    .filter(k => diffs[k].diff < 0)
    .sort((a, b) => diffs[b].diff - diffs[a].diff)

  let remainingSurplus = totalSurplus
  const coveredSet = new Set()

  deficitKeys.forEach(k => {
    const deficit = Math.abs(diffs[k].diff)
    if (remainingSurplus >= deficit) {
      remainingSurplus -= deficit
      coveredSet.add(k)
    }
  })

  // Step 4: Tentukan status final
  const result = {}
  keys.forEach(k => {
    if (!filledKeys.includes(k)) {
      result[k] = { recommended: 0, userVal: 0, diff: 0, status: 'sesuai' }
      return
    }

    const { userVal, diff } = diffs[k]
    let status
    if (diff > 0)               status = 'hemat'
    else if (diff === 0)        status = 'sesuai'
    else if (coveredSet.has(k)) status = 'covered'
    else                        status = 'perhatian'

    result[k] = {
      recommended: recommended[k],
      userVal,
      diff,
      status,
    }
  })

  return result
}


/**
 * Hitung total pemasukan & pengeluaran dari transaksi (Berdasarkan Bulan)
 */
export function hitungSummary(transactions, bulanStr) {
  const txBulan = transactions.filter(t => {
    const tBulan = t.tanggal.substring(0, 7)
    return tBulan === bulanStr
  })
  const pemasukan = txBulan
    .filter(t => t.jenis === 'pemasukan')
    .reduce((sum, t) => sum + (t.jumlahBulanan || t.jumlah), 0)
  const pengeluaran = txBulan
    .filter(t => t.jenis === 'pengeluaran')
    .reduce((sum, t) => sum + t.jumlah, 0)
  const saldo = pemasukan - pengeluaran

  // Pengeluaran per kategori
  const perKategori = {}
  txBulan
    .filter(t => t.jenis === 'pengeluaran')
    .forEach(t => {
      perKategori[t.kategori] = (perKategori[t.kategori] || 0) + t.jumlah
    })

  return { pemasukan, pengeluaran, saldo, perKategori, txBulan }
}

/**
 * Hitung total pemasukan & pengeluaran dari transaksi (Berdasarkan Periode)
 */
export function hitungSummaryPeriode(transactions, startDateStr, endDateStr) {
  const txPeriode = transactions.filter(t => {
    const tDate = t.tanggal
    return tDate >= startDateStr && tDate <= endDateStr
  })
  
  const pemasukan = txPeriode
    .filter(t => t.jenis === 'pemasukan')
    .reduce((sum, t) => sum + (t.jumlahBulanan || t.jumlah), 0)
    
  const pengeluaran = txPeriode
    .filter(t => t.jenis === 'pengeluaran')
    .reduce((sum, t) => sum + t.jumlah, 0)
    
  const saldo = pemasukan - pengeluaran

  // Pengeluaran per kategori
  const perKategori = {}
  txPeriode
    .filter(t => t.jenis === 'pengeluaran')
    .forEach(t => {
      perKategori[t.kategori] = (perKategori[t.kategori] || 0) + t.jumlah
    })

  return { pemasukan, pengeluaran, saldo, perKategori, txPeriode }
}

/**
 * Kategori pengeluaran
 */
export const KATEGORI_PENGELUARAN = [
  { value: 'makan',        label: 'Makan & Minum',     icon: Utensils },
  { value: 'transportasi', label: 'Transportasi',       icon: Car },
  { value: 'kebersihan',   label: 'Mandi & Kebersihan', icon: Bath },
  { value: 'hiburan',      label: 'Hiburan',            icon: Gamepad2 },
  { value: 'belanja',      label: 'Belanja',            icon: ShoppingCart },
  { value: 'kesehatan',    label: 'Kesehatan',          icon: Pill },
  { value: 'tagihan',      label: 'Tagihan & Listrik',  icon: Lightbulb },
  { value: 'pendidikan',   label: 'Pendidikan',         icon: BookOpen },
  { value: 'lainnya',      label: 'Lainnya',            icon: Package },
]

export const KATEGORI_PEMASUKAN = [
  { value: 'gaji',       label: 'Gaji / Upah',       icon: Briefcase },
  { value: 'usaha',      label: 'Usaha / Dagang',    icon: Store },
  { value: 'freelance',  label: 'Freelance',          icon: Laptop },
  { value: 'investasi',  label: 'Investasi',          icon: TrendingUp },
  { value: 'bonus',      label: 'Bonus / THR',        icon: Gift },
  { value: 'transfer',   label: 'Transfer / Kiriman', icon: Send },
  { value: 'lainnya',    label: 'Lainnya',            icon: Package },
]

export function getKategoriLabel(value, jenis = 'pengeluaran') {
  const list = jenis === 'pemasukan' ? KATEGORI_PEMASUKAN : KATEGORI_PENGELUARAN
  const found = list.find(k => k.value === value)
  return found ? found.label : value
}

export function getKategoriIcon(value, jenis = 'pengeluaran') {
  const list = jenis === 'pemasukan' ? KATEGORI_PEMASUKAN : KATEGORI_PENGELUARAN
  const found = list.find(k => k.value === value)
  return found ? found.icon : Coins
}

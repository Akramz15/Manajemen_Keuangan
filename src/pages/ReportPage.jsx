import { useState, useCallback } from 'react'
import { Download, FileText, BarChart2, ClipboardList } from 'lucide-react'
import {
  formatTanggal, formatRupiah,
  hitungSummaryPeriode, normalisasiBulanan,
  getTanggalHariIni
} from '../lib/utils.js'
import { getTransactions, getBukuKas } from '../lib/storage.js'
import { exportLaporanPDF, exportBukuKasPDF } from '../lib/pdfExport.js'
import TransactionTable from '../components/TransactionTable.jsx'

export default function ReportPage({ profile }) {
  const [startDate, setStartDate] = useState(profile?.periodeMulai || getTanggalHariIni())
  const [endDate, setEndDate] = useState(profile?.periodeSelesai || getTanggalHariIni())
  const [transactions, setTransactions] = useState(() => getTransactions())
  const refresh = useCallback(() => setTransactions(getTransactions()), [])

  const pemasukanBulanan = normalisasiBulanan(
    profile?.pemasukanBulanan || 0,
    profile?.frekuensiPemasukan || 'bulanan'
  )
  const summary = hitungSummaryPeriode(transactions, startDate, endDate)

  function handleExportLaporan() {
    exportLaporanPDF(transactions, startDate, endDate, profile, { ...summary, pemasukan: Math.max(pemasukanBulanan, summary.pemasukan) })
  }

  function handleExportBukuKas() {
    const entries = getBukuKas().filter(t => t.tanggal >= startDate && t.tanggal <= endDate)
    exportBukuKasPDF(entries, startDate, endDate, profile)
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Laporan PDF</h1>
          <p className="page-subtitle">Unduh laporan keuangan & buku kas bulanan</p>
        </div>
      </div>

      {/* Pilih Periode */}
      <div className="card" style={{ marginBottom: 'var(--sp-6)', padding: 'var(--sp-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
          <label className="form-label" style={{ margin: 0 }}>Pilih Periode Laporan:</label>
          <div style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'center' }}>
            <input
              type="date"
              className="form-input"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              style={{ width: 140 }}
            />
            <span style={{ color: 'var(--clr-text-3)' }}>-</span>
            <input
              type="date"
              className="form-input"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              style={{ width: 140 }}
            />
          </div>
        </div>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-3" style={{ marginBottom: 'var(--sp-6)' }}>
        {[
          { label: 'Total Pemasukan',  value: formatRupiah(Math.max(pemasukanBulanan, summary.pemasukan)), color: 'var(--clr-success)' },
          { label: 'Total Pengeluaran', value: formatRupiah(summary.pengeluaran), color: 'var(--clr-danger)' },
          { label: 'Saldo Akhir',      value: formatRupiah(summary.saldo), color: summary.saldo >= 0 ? 'var(--clr-success)' : 'var(--clr-danger)' },
        ].map((s, i) => (
          <div className="card" key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-2)', marginBottom: 'var(--sp-2)' }}>{s.label}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'var(--fw-black)', color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Export Buttons */}
      <div className="grid grid-2" style={{ marginBottom: 'var(--sp-6)' }}>
        {/* Laporan Transaksi */}
        <div className="card" style={{ textAlign: 'center', padding: 'var(--sp-8)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--sp-3)' }}><BarChart2 size={48} strokeWidth={1.5} /></div>
          <div style={{ fontWeight: 'var(--fw-bold)', fontSize: '1.1rem', marginBottom: 'var(--sp-2)' }}>
            Laporan Keuangan
          </div>
          <div style={{ color: 'var(--clr-text-2)', fontSize: '0.875rem', marginBottom: 'var(--sp-5)', lineHeight: 1.6 }}>
            Berisi ringkasan pemasukan & pengeluaran, detail transaksi per kategori, dan rekomendasi budget harian.
          </div>
          <button className="btn btn-primary" onClick={handleExportLaporan} id="btn-export-laporan">
            <Download size={16} /> Unduh Laporan PDF
          </button>
        </div>

        {/* Buku Kas */}
        <div className="card" style={{ textAlign: 'center', padding: 'var(--sp-8)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--sp-3)' }}><ClipboardList size={48} strokeWidth={1.5} /></div>
          <div style={{ fontWeight: 'var(--fw-bold)', fontSize: '1.1rem', marginBottom: 'var(--sp-2)' }}>
            Buku Kas Bulanan
          </div>
          <div style={{ color: 'var(--clr-text-2)', fontSize: '0.875rem', marginBottom: 'var(--sp-5)', lineHeight: 1.6 }}>
            Format tabel lengkap dengan kolom No., Keterangan, Tanggal, Masuk, Keluar — dan total saldo akhir.
          </div>
          <button className="btn btn-success" onClick={handleExportBukuKas} id="btn-export-bukukas-laporan">
            <Download size={16} /> Unduh Buku Kas PDF
          </button>
        </div>
      </div>

      {/* Preview Transaksi */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: 'var(--sp-4) var(--sp-5)', borderBottom: '1px solid var(--clr-border)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
          <FileText size={16} color="var(--clr-text-2)" />
          <span style={{ fontWeight: 'var(--fw-bold)' }}>Preview Transaksi — {formatTanggal(startDate, 'short')} s/d {formatTanggal(endDate, 'short')}</span>
        </div>
        <TransactionTable transactions={transactions} startDate={startDate} endDate={endDate} onDeleted={refresh} />
      </div>
    </div>
  )
}

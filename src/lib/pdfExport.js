import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatRupiah, formatTanggal, getKategoriLabel } from './utils.js'

/**
 * Export laporan transaksi ke PDF
 */
export function exportLaporanPDF(transactions, startDate, endDate, profile, summary) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 14

  // ---- Header ----
  doc.setFillColor(44, 36, 120)
  doc.rect(0, 0, pageW, 40, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('LAPORAN KEUANGAN SIKLUS', margin, 16)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`${profile?.nama || 'Pengguna'} · Periode: ${formatTanggal(startDate, 'short')} - ${formatTanggal(endDate, 'short')}`, margin, 26)
  doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, margin, 33)

  // ---- Ringkasan ----
  let y = 50
  doc.setTextColor(40, 40, 40)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('RINGKASAN KEUANGAN', margin, y)
  y += 6

  const summaryData = [
    ['Total Pemasukan',    formatRupiah(summary.pemasukan)],
    ['Total Pengeluaran',  formatRupiah(summary.pengeluaran)],
    ['Target Tabungan',    formatRupiah(profile?.targetTabungan || 0)],
    ['Saldo Akhir',        formatRupiah(summary.saldo)],
  ]

  autoTable(doc, {
    startY: y,
    head: [],
    body: summaryData,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60, fillColor: [245, 245, 250] },
      1: { halign: 'right' },
    },
    margin: { left: margin, right: margin },
  })

  y = doc.lastAutoTable.finalY + 10

  // ---- Detail Transaksi ----
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(40, 40, 40)
  doc.text('DETAIL TRANSAKSI', margin, y)
  y += 4

  const txPeriode = transactions.filter(t => t.tanggal >= startDate && t.tanggal <= endDate)

  if (txPeriode.length === 0) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(150, 150, 150)
    doc.text('Belum ada transaksi di periode ini.', margin, y + 8)
  } else {
    const rows = txPeriode.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal)).map((t, i) => [
      i + 1,
      formatTanggal(t.tanggal, 'numeric'),
      getKategoriLabel(t.kategori, t.jenis),
      t.jenis === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran',
      formatRupiah(t.jenis === 'pemasukan' ? (t.jumlahBulanan || t.jumlah) : t.jumlah),
      t.catatan || '-',
    ])

    autoTable(doc, {
      startY: y,
      head: [['No', 'Tanggal', 'Kategori', 'Jenis', 'Jumlah', 'Catatan']],
      body: rows,
      theme: 'striped',
      headStyles: { fillColor: [44, 36, 120], textColor: 255, fontStyle: 'bold', fontSize: 9 },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 26 },
        2: { cellWidth: 40 },
        3: { cellWidth: 28 },
        4: { cellWidth: 32, halign: 'right' },
        5: { cellWidth: 'auto' },
      },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 3) {
          const isIn = data.cell.raw === 'Pemasukan'
          doc.setTextColor(isIn ? 0 : 200, isIn ? 150 : 0, 0)
        }
      },
      margin: { left: margin, right: margin },
    })
  }


  // ---- Footer ----
  const pageCount = doc.internal.getNumberOfPages()
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(
      `FinSight — Manajemen Keuangan Pintar · Halaman ${p} dari ${pageCount}`,
      pageW / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    )
  }

  doc.save(`Laporan-Keuangan-${startDate}_${endDate}.pdf`)
}

/**
 * Export buku kas ke PDF
 */
export function exportBukuKasPDF(entries, startDate, endDate, profile) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 14

  // ---- Header ----
  doc.setFillColor(16, 110, 80)
  doc.rect(0, 0, pageW, 40, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('BUKU KAS KEUANGAN', margin, 16)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const namaTampil = profile?.nama || 'Pengguna'
  doc.text(`${namaTampil} · Periode: ${formatTanggal(startDate, 'short')} - ${formatTanggal(endDate, 'short')}`, margin, 26)
  doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, margin, 33)

  // ---- Tabel ----
  const entriesPeriode = entries
    .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal))

  const rows = entriesPeriode.map(e => [
    e.nomor,
    e.keterangan,
    formatTanggal(e.tanggal, 'numeric'),
    e.jenis === 'pemasukan' ? formatRupiah(e.jumlah) : '-',
    e.jenis === 'pengeluaran' ? formatRupiah(e.jumlah) : '-',
  ])

  // Total row
  const totalMasuk   = entriesPeriode.filter(e => e.jenis === 'pemasukan').reduce((s, e) => s + e.jumlah, 0)
  const totalKeluar  = entriesPeriode.filter(e => e.jenis === 'pengeluaran').reduce((s, e) => s + e.jumlah, 0)
  const saldo        = totalMasuk - totalKeluar

  autoTable(doc, {
    startY: 48,
    head: [['No.', 'Keterangan', 'Tanggal', 'Masuk (Rp)', 'Keluar (Rp)']],
    body: [
      ...rows,
      [{ content: '', colSpan: 5, styles: { fillColor: [240, 240, 240], cellPadding: 1 } }],
      [
        { content: 'TOTAL', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right', fillColor: [240, 248, 245] } },
        { content: formatRupiah(totalMasuk),  styles: { fontStyle: 'bold', textColor: [0, 120, 80], fillColor: [240, 248, 245] } },
        { content: formatRupiah(totalKeluar), styles: { fontStyle: 'bold', textColor: [200, 0, 0],  fillColor: [240, 248, 245] } },
      ],
      [
        { content: 'SALDO AKHIR', colSpan: 4, styles: { fontStyle: 'bold', halign: 'right', fillColor: [230, 240, 255] } },
        { content: formatRupiah(saldo), styles: { fontStyle: 'bold', textColor: saldo >= 0 ? [0, 100, 200] : [200, 0, 0], fillColor: [230, 240, 255] } },
      ],
    ],
    theme: 'grid',
    headStyles: { fillColor: [16, 110, 80], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 28 },
      3: { cellWidth: 38, halign: 'right' },
      4: { cellWidth: 38, halign: 'right' },
    },
    margin: { left: margin, right: margin },
    didParseCell: (data) => {
      if (data.section === 'body' && data.row.index < rows.length) {
        const entry = entriesPeriode[data.row.index]
        if (entry && data.column.index === 3 && entry.jenis === 'pemasukan') {
          data.cell.styles.textColor = [0, 120, 80]
        }
        if (entry && data.column.index === 4 && entry.jenis === 'pengeluaran') {
          data.cell.styles.textColor = [200, 0, 0]
        }
      }
    },
  })

  // ---- Footer ----
  const pageCount = doc.internal.getNumberOfPages()
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(
      `FinSight — Buku Kas Digital · Halaman ${p} dari ${pageCount}`,
      pageW / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    )
  }

  doc.save(`Buku-Kas-${startDate}_${endDate}.pdf`)
}

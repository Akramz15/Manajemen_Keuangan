import { useState } from 'react'
import { Trash2, ChevronDown, ChevronUp, ClipboardList, TrendingUp, TrendingDown } from 'lucide-react'
import { formatRupiah, formatTanggal, getKategoriLabel, getKategoriIcon } from '../lib/utils.js'
import { deleteTransaction } from '../lib/storage.js'
import ConfirmModal from './ConfirmModal.jsx'

export default function TransactionTable({ transactions, startDate, endDate, onDeleted }) {
  const [sortDir, setSortDir] = useState('desc')
  const [deleteId, setDeleteId] = useState(null)

  const txPeriode = transactions
    .filter(t => t.tanggal >= startDate && t.tanggal <= endDate)
    .sort((a, b) => sortDir === 'desc'
      ? new Date(b.tanggal) - new Date(a.tanggal)
      : new Date(a.tanggal) - new Date(b.tanggal)
    )

  function handleDeleteClick(id) {
    setDeleteId(id)
  }

  function confirmDelete() {
    if (!deleteId) return
    deleteTransaction(deleteId)
    setDeleteId(null)
    onDeleted?.()
  }

  if (txPeriode.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon"><ClipboardList size={48} strokeWidth={1.5} /></div>
        <div style={{ fontWeight: 'var(--fw-semi)', marginBottom: 'var(--sp-2)' }}>
          Belum ada transaksi
        </div>
        <div style={{ fontSize: '0.875rem' }}>
          Tambahkan transaksi pertama kamu di periode ini
        </div>
      </div>
    )
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Kategori</th>
            <th>
              <button
                style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: 'var(--clr-text-2)', fontWeight: 'var(--fw-semi)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer' }}
                onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
              >
                Tanggal
                {sortDir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
              </button>
            </th>
            <th>Jenis</th>
            <th style={{ textAlign: 'right' }}>Nominal</th>
            <th>Catatan</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {txPeriode.map(t => {
            const isIn = t.jenis === 'pemasukan'
            const CatIcon = getKategoriIcon(t.kategori, t.jenis)
            return (
              <tr key={t.id}>
                <td>
                  <div style={{ fontWeight: 'var(--fw-medium)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CatIcon size={16} style={{ color: isIn ? 'var(--clr-success)' : 'var(--clr-text-2)' }} />
                    {getKategoriLabel(t.kategori, t.jenis)}
                  </div>
                  {t.frekuensi && t.frekuensi !== 'bulanan' && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-3)' }}>
                      Per {t.frekuensi} → bulanan
                    </div>
                  )}
                </td>
                <td style={{ color: 'var(--clr-text-2)', whiteSpace: 'nowrap' }}>
                  {formatTanggal(t.tanggal, 'short')}
                </td>
                <td>
                  <span className={`badge ${isIn ? 'badge-success' : 'badge-danger'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {isIn ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {isIn ? 'Masuk' : 'Keluar'}
                  </span>
                </td>
                <td style={{ textAlign: 'right', fontWeight: 'var(--fw-semi)', color: isIn ? 'var(--clr-success)' : 'var(--clr-danger)', whiteSpace: 'nowrap' }}>
                  {isIn ? '+' : '-'}{formatRupiah(isIn ? (t.jumlahBulanan || t.jumlah) : t.jumlah)}
                </td>
                <td style={{ color: 'var(--clr-text-2)', fontSize: '0.85rem', maxWidth: 150 }}>
                  {t.catatan || <span style={{ color: 'var(--clr-text-3)' }}>—</span>}
                </td>
                <td>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--clr-danger)', padding: '4px 8px' }}
                    onClick={() => handleDeleteClick(t.id)}
                    title="Hapus"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {deleteId && (
        <ConfirmModal
          title="Hapus Transaksi?"
          message="Transaksi ini akan dihapus dari buku kas dan tidak akan dihitung lagi dalam saldo."
          confirmText="Hapus"
          cancelText="Batal"
          isDanger={true}
          icon="trash"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  )
}

import { useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { getTanggalHariIni } from '../lib/utils.js'
import { getTransactions } from '../lib/storage.js'
import TransactionForm from '../components/TransactionForm.jsx'
import TransactionTable from '../components/TransactionTable.jsx'

export default function TransactionPage({ profile }) {
  const [startDate, setStartDate] = useState(profile?.periodeMulai || getTanggalHariIni())
  const [endDate, setEndDate] = useState(profile?.periodeSelesai || getTanggalHariIni())
  const [showForm, setShowForm] = useState(false)
  const [jenisTampil, setJenisTampil] = useState('semua')
  const [transactions, setTransactions] = useState(() => getTransactions())

  const refresh = useCallback(() => setTransactions(getTransactions()), [])

  const filtered = transactions.filter(t => {
    const inRange = t.tanggal >= startDate && t.tanggal <= endDate
    if (jenisTampil === 'semua') return inRange
    return inRange && t.jenis === jenisTampil
  })

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Transaksi</h1>
          <p className="page-subtitle">Catat & lihat semua pemasukan dan pengeluaran</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)} id="btn-new-tx">
          <Plus size={16} /> Tambah Transaksi
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: 'var(--sp-4)', padding: 'var(--sp-4)' }}>
        <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'center', flexWrap: 'nowrap', flex: '1 1 auto', minWidth: 0 }}>
            <label className="form-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>Dari:</label>
            <input
              type="date"
              className="form-input"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              style={{ flex: 1, minWidth: 0, maxWidth: 160, padding: '10px 8px' }}
            />
            <label className="form-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>Sampai:</label>
            <input
              type="date"
              className="form-input"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              style={{ flex: 1, minWidth: 0, maxWidth: 160, padding: '10px 8px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center' }}>
            <select
              className="form-select"
              value={jenisTampil}
              onChange={(e) => setJenisTampil(e.target.value)}
              style={{ width: 'auto', minWidth: 180, cursor: 'pointer' }}
            >
              <option value="semua">Semua Transaksi</option>
              <option value="pemasukan">Pemasukan Saja</option>
              <option value="pengeluaran">Pengeluaran Saja</option>
            </select>
            <div style={{ color: 'var(--clr-text-3)', fontSize: '0.85rem' }}>
              {filtered.length} transaksi
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <TransactionTable
          transactions={filtered}
          startDate={startDate}
          endDate={endDate}
          onDeleted={refresh}
        />
      </div>

      {showForm && (
        <TransactionForm
          onClose={() => setShowForm(false)}
          onAdded={refresh}
        />
      )}
    </div>
  )
}

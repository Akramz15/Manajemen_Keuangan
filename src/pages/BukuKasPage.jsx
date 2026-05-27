import { useState, useCallback } from 'react'
import { Plus, Trash2, Download, X, Book, TrendingUp, TrendingDown } from 'lucide-react'
import {
  formatRupiah, formatTanggal, getTanggalHariIni
} from '../lib/utils.js'
import { getBukuKas, addBukuKasEntry, deleteBukuKasEntry } from '../lib/storage.js'
import { exportBukuKasPDF } from '../lib/pdfExport.js'

function BukuKasForm({ onClose, onAdded }) {
  const [form, setForm] = useState({
    keterangan: '',
    tanggal: getTanggalHariIni(),
    jenis: 'pengeluaran',
    jumlah: '',
  })

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.keterangan || !form.jumlah) return
    const jumlah = parseFloat(form.jumlah.replace(/\D/g, ''))
    const bulanDariTanggal = form.tanggal.substring(0, 7)
    const entry = addBukuKasEntry({ ...form, jumlah, bulan: bulanDariTanggal })
    onAdded(entry)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal fade-in">
        <div className="modal-header">
          <h2 className="modal-title">+ Tambah Entri Buku Kas</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <div className="form-group">
            <label className="form-label">Keterangan</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Gaji bulan Juni, Belanja sayur..."
              value={form.keterangan}
              onChange={e => setForm(f => ({ ...f, keterangan: e.target.value }))}
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tanggal</label>
            <input
              type="date"
              className="form-input"
              value={form.tanggal}
              onChange={e => setForm(f => ({ ...f, tanggal: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Jenis</label>
            <div className="radio-group">
              {[
                { value: 'pemasukan',   label: 'Masuk',  icon: TrendingUp, clr: 'success' },
                { value: 'pengeluaran', label: 'Keluar', icon: TrendingDown, clr: 'danger'  },
              ].map(j => {
                const Icon = j.icon
                return (
                  <button
                    type="button"
                    key={j.value}
                    className={`radio-btn ${form.jenis === j.value ? 'active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, jenis: j.value }))}
                    style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      color: form.jenis === j.value ? `var(--clr-${j.clr})` : undefined,
                      borderColor: form.jenis === j.value ? `var(--clr-${j.clr})` : undefined,
                      background: form.jenis === j.value ? `var(--clr-${j.clr}-l)` : undefined,
                    }}
                  >
                    {Icon && <Icon size={14} />}
                    {j.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Nominal</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-3)' }}>Rp</span>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: 36 }}
                placeholder="0"
                value={form.jumlah}
                onChange={e => {
                  const n = e.target.value.replace(/\D/g, '')
                  setForm(f => ({ ...f, jumlah: n ? parseInt(n).toLocaleString('id-ID') : '' }))
                }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Batal</button>
            <button
              type="submit"
              className={`btn ${form.jenis === 'pemasukan' ? 'btn-success' : 'btn-primary'}`}
            >
              <Plus size={16} /> Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function BukuKasPage({ profile }) {
  const [startDate, setStartDate] = useState(profile?.periodeMulai || getTanggalHariIni())
  const [endDate, setEndDate] = useState(profile?.periodeSelesai || getTanggalHariIni())
  const [showForm, setShowForm] = useState(false)
  const [entries, setEntries] = useState(() => getBukuKas())

  const refresh = useCallback(() => setEntries(getBukuKas()), [])

  const entriesPeriode = entries
    .filter(e => e.tanggal >= startDate && e.tanggal <= endDate)
    .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal) || a.nomor - b.nomor)

  const totalMasuk  = entriesPeriode.filter(e => e.jenis === 'pemasukan').reduce((s, e) => s + e.jumlah, 0)
  const totalKeluar = entriesPeriode.filter(e => e.jenis === 'pengeluaran').reduce((s, e) => s + e.jumlah, 0)
  const saldo       = totalMasuk - totalKeluar

  function handleDelete(id) {
    if (!confirm('Hapus entri ini?')) return
    deleteBukuKasEntry(id)
    refresh()
  }

  function handleExport() {
    exportBukuKasPDF(entriesPeriode, startDate, endDate, profile)
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Buku Kas</h1>
          <p className="page-subtitle">Pembukuan keuangan per bulan dalam format tabel</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
          <button className="btn btn-secondary" onClick={handleExport} id="btn-export-bukukas">
            <Download size={16} /> Unduh PDF
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(true)} id="btn-add-bukukas">
            <Plus size={16} /> Tambah Entri
          </button>
        </div>
      </div>

      {/* Filter Periode */}
      <div className="card" style={{ marginBottom: 'var(--sp-4)', padding: 'var(--sp-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
          <label className="form-label" style={{ margin: 0 }}>Pilih Periode:</label>
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
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--sp-4)' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--clr-text-3)' }}>Total Masuk</div>
              <div style={{ fontWeight: 'var(--fw-bold)', color: 'var(--clr-success)' }}>{formatRupiah(totalMasuk, true)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--clr-text-3)' }}>Total Keluar</div>
              <div style={{ fontWeight: 'var(--fw-bold)', color: 'var(--clr-danger)' }}>{formatRupiah(totalKeluar, true)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--clr-text-3)' }}>Saldo</div>
              <div style={{ fontWeight: 'var(--fw-bold)', color: saldo >= 0 ? 'var(--clr-success)' : 'var(--clr-danger)' }}>
                {formatRupiah(saldo, true)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Buku Kas */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: 'var(--sp-4) var(--sp-5)', borderBottom: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 'var(--fw-bold)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Book size={18} /> Buku Kas — {formatTanggal(startDate, 'short')} s/d {formatTanggal(endDate, 'short')}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-3)' }}>
            {entriesPeriode.length} entri
          </div>
        </div>

        {entriesPeriode.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Book size={48} strokeWidth={1.5} /></div>
            <div style={{ fontWeight: 'var(--fw-semi)', marginBottom: 'var(--sp-2)' }}>Buku kas kosong</div>
            <div style={{ fontSize: '0.875rem', marginBottom: 'var(--sp-4)' }}>
              Belum ada entri di periode ini
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
              <Plus size={14} /> Tambah Entri Pertama
            </button>
          </div>
        ) : (
          <>
            <div className="table-container" style={{ borderRadius: 0, border: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 48, textAlign: 'center' }}>No.</th>
                    <th>Keterangan</th>
                    <th style={{ width: 120 }}>Tanggal</th>
                    <th style={{ width: 140, textAlign: 'right' }}>Masuk (Rp)</th>
                    <th style={{ width: 140, textAlign: 'right' }}>Keluar (Rp)</th>
                    <th style={{ width: 48 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {entriesPeriode.map(e => (
                    <tr key={e.id}>
                      <td style={{ textAlign: 'center', color: 'var(--clr-text-3)', fontWeight: 'var(--fw-semi)' }}>
                        {e.nomor}
                      </td>
                      <td style={{ fontWeight: 'var(--fw-medium)' }}>{e.keterangan}</td>
                      <td style={{ color: 'var(--clr-text-2)', whiteSpace: 'nowrap' }}>
                        {formatTanggal(e.tanggal, 'numeric')}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 'var(--fw-semi)', color: e.jenis === 'pemasukan' ? 'var(--clr-success)' : 'var(--clr-text-3)' }}>
                        {e.jenis === 'pemasukan' ? formatRupiah(e.jumlah) : '—'}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 'var(--fw-semi)', color: e.jenis === 'pengeluaran' ? 'var(--clr-danger)' : 'var(--clr-text-3)' }}>
                        {e.jenis === 'pengeluaran' ? formatRupiah(e.jumlah) : '—'}
                      </td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--clr-danger)', padding: '4px 8px' }}
                          onClick={() => handleDelete(e.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Total */}
            <div style={{
              borderTop: '2px solid var(--clr-border)',
              padding: 'var(--sp-4) var(--sp-5)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 'var(--sp-6)',
              background: 'var(--clr-bg-3)',
            }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-3)' }}>Total Masuk</div>
                <div style={{ fontWeight: 'var(--fw-bold)', color: 'var(--clr-success)' }}>{formatRupiah(totalMasuk)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-3)' }}>Total Keluar</div>
                <div style={{ fontWeight: 'var(--fw-bold)', color: 'var(--clr-danger)' }}>{formatRupiah(totalKeluar)}</div>
              </div>
              <div style={{ textAlign: 'right', borderLeft: '1px solid var(--clr-border)', paddingLeft: 'var(--sp-6)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-3)' }}>Saldo Akhir</div>
                <div style={{ fontWeight: 'var(--fw-black)', fontSize: '1.1rem', color: saldo >= 0 ? 'var(--clr-success)' : 'var(--clr-danger)' }}>
                  {formatRupiah(saldo)}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {showForm && (
        <BukuKasForm
          onClose={() => setShowForm(false)}
          onAdded={refresh}
        />
      )}
    </div>
  )
}

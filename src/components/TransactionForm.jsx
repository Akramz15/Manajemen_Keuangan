import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import {
  KATEGORI_PENGELUARAN, KATEGORI_PEMASUKAN,
  getTanggalHariIni, normalisasiBulanan
} from '../lib/utils.js'
import { addTransaction } from '../lib/storage.js'

export default function TransactionForm({ onClose, onAdded, defaultJenis = 'pengeluaran' }) {
  const [jenis, setJenis] = useState(defaultJenis)
  const [form, setForm] = useState({
    kategori: '',
    jumlah: '',
    frekuensi: 'bulanan',
    catatan: '',
    tanggal: getTanggalHariIni(),
  })
  const [loading, setLoading] = useState(false)

  const kategoriList = jenis === 'pemasukan' ? KATEGORI_PEMASUKAN : KATEGORI_PENGELUARAN

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.kategori || !form.jumlah || !form.tanggal) return

    setLoading(true)
    const jumlah = parseFloat(form.jumlah.replace(/\D/g, ''))
    const jumlahBulanan = jenis === 'pemasukan'
      ? normalisasiBulanan(jumlah, form.frekuensi)
      : jumlah

    const tx = addTransaction({
      jenis,
      kategori:     form.kategori,
      jumlah,
      jumlahBulanan,
      frekuensi:    jenis === 'pemasukan' ? form.frekuensi : 'bulanan',
      catatan:      form.catatan,
      tanggal:      form.tanggal,
    })

    setLoading(false)
    onAdded?.(tx)
    onClose?.()
  }

  function formatInput(val) {
    const num = val.replace(/\D/g, '')
    return num ? parseInt(num).toLocaleString('id-ID') : ''
  }

  const frekuensiLabel = {
    harian: 'per hari',
    mingguan: 'per minggu',
    bulanan: 'per bulan',
  }

  const previewBulanan = () => {
    const num = parseFloat(form.jumlah.replace(/\D/g, '')) || 0
    if (jenis !== 'pemasukan' || !num) return null
    const result = normalisasiBulanan(num, form.frekuensi)
    if (form.frekuensi === 'bulanan') return null
    return result
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose?.()}>
      <div className="modal fade-in">
        <div className="modal-header">
          <h2 className="modal-title">
            <Plus size={18} style={{ display: 'inline', marginRight: 8 }} />
            Tambah Transaksi
          </h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          {/* Jenis */}
          <div className="form-group">
            <label className="form-label">Jenis Transaksi</label>
            <div className="radio-group">
              {['pengeluaran', 'pemasukan'].map(j => (
                <button
                  type="button"
                  key={j}
                  className={`radio-btn ${jenis === j ? 'active' : ''}`}
                  onClick={() => { setJenis(j); setForm(f => ({ ...f, kategori: '' })) }}
                  style={{
                    color: jenis === j
                      ? (j === 'pemasukan' ? 'var(--clr-success)' : 'var(--clr-danger)')
                      : undefined,
                    borderColor: jenis === j
                      ? (j === 'pemasukan' ? 'var(--clr-success)' : 'var(--clr-danger)')
                      : undefined,
                    background: jenis === j
                      ? (j === 'pemasukan' ? 'var(--clr-success-l)' : 'var(--clr-danger-l)')
                      : undefined,
                  }}
                >
                  {j === 'pemasukan' ? '↑ Pemasukan' : '↓ Pengeluaran'}
                </button>
              ))}
            </div>
          </div>

          {/* Kategori */}
          <div className="form-group">
            <label className="form-label">Kategori</label>
            <select
              name="kategori"
              className="form-select"
              value={form.kategori}
              onChange={handleChange}
              required
            >
              <option value="">Pilih kategori...</option>
              {kategoriList.map(k => (
                <option key={k.value} value={k.value}>{k.emoji} {k.label}</option>
              ))}
            </select>
          </div>

          {/* Nominal */}
          <div className="form-group">
            <label className="form-label">
              Nominal {jenis === 'pemasukan' ? `(${frekuensiLabel[form.frekuensi]})` : ''}
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--clr-text-3)', fontSize: '0.9rem', pointerEvents: 'none'
              }}>Rp</span>
              <input
                type="text"
                name="jumlah"
                className="form-input"
                style={{ paddingLeft: 36 }}
                placeholder="0"
                value={form.jumlah}
                onChange={e => setForm(f => ({ ...f, jumlah: formatInput(e.target.value) }))}
                required
              />
            </div>
            {previewBulanan() && (
              <div style={{ fontSize: '0.8rem', color: 'var(--clr-success)', marginTop: 4 }}>
                ≈ Rp {previewBulanan().toLocaleString('id-ID')} / bulan (dihitung otomatis)
              </div>
            )}
          </div>

          {/* Frekuensi — hanya pemasukan */}
          {jenis === 'pemasukan' && (
            <div className="form-group">
              <label className="form-label">Frekuensi Pemasukan</label>
              <div className="radio-group">
                {['harian', 'mingguan', 'bulanan'].map(f => (
                  <button
                    type="button"
                    key={f}
                    className={`radio-btn ${form.frekuensi === f ? 'active' : ''}`}
                    onClick={() => setForm(ff => ({ ...ff, frekuensi: f }))}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tanggal */}
          <div className="form-group">
            <label className="form-label">Tanggal</label>
            <input
              type="date"
              name="tanggal"
              className="form-input"
              value={form.tanggal}
              onChange={handleChange}
              required
            />
          </div>

          {/* Catatan */}
          <div className="form-group">
            <label className="form-label">Catatan (opsional)</label>
            <input
              type="text"
              name="catatan"
              className="form-input"
              placeholder="Keterangan singkat..."
              value={form.catatan}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'flex-end', marginTop: 'var(--sp-2)' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Batal</button>
            <button
              type="submit"
              className={`btn ${jenis === 'pemasukan' ? 'btn-success' : 'btn-danger'}`}
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : <Plus size={16} />}
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

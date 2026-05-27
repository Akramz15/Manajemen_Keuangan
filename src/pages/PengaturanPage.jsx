import { useState } from 'react'
import { Save, Trash2, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react'
import {
  PROFIL_LABEL, KATEGORI_KEBUTUHAN_LABEL, PROFIL_BOBOT,
  KATEGORI_KEBUTUHAN_ICON, KATEGORI_KEBUTUHAN_FREKUENSI_DEFAULT,
  normalisasiKeHarian, normalisasiBulanan
} from '../lib/utils.js'
import { saveProfile, clearAllData } from '../lib/storage.js'
import ConfirmModal from '../components/ConfirmModal.jsx'

export default function PengaturanPage({ profile, onProfileUpdate, onReset }) {
  const [form, setForm] = useState({
    nama:               profile?.nama || '',
    profesi:            profile?.profesi || 'mahasiswa',
    pemasukanBulanan:   profile?.pemasukanBulanan ? profile.pemasukanBulanan.toLocaleString('id-ID') : '',
    frekuensiPemasukan: profile?.frekuensiPemasukan || 'bulanan',
    kebutuhanHarian:    Object.fromEntries(
      Object.keys(KATEGORI_KEBUTUHAN_LABEL).map(k => {
        const frek = profile?.kebutuhanFrekuensi?.[k] || 'harian'
        let val = profile?.kebutuhanHarian?.[k] || 0
        if (frek === 'mingguan') val = val * 7
        if (frek === 'bulanan')  val = val * 30
        return [k, val ? Math.round(val).toLocaleString('id-ID') : '']
      })
    ),
    kebutuhanFrekuensi: profile?.kebutuhanFrekuensi || { ...KATEGORI_KEBUTUHAN_FREKUENSI_DEFAULT },
  })
  const [saved, setSaved] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  function parseNum(val) { return parseFloat((val || '0').replace(/\D/g, '')) || 0 }
  function formatNum(val) {
    const n = val.replace(/\D/g, '')
    return n ? parseInt(n).toLocaleString('id-ID') : ''
  }

  function handleSave() {
    const kebutuhanHarianNormal = Object.fromEntries(
      Object.entries(form.kebutuhanHarian).map(([k, v]) => [
        k, Math.round(normalisasiKeHarian(parseNum(v), form.kebutuhanFrekuensi[k] || 'harian'))
      ])
    )
    const updated = {
      ...profile,
      nama:               form.nama,
      profesi:            form.profesi,
      pemasukanBulanan:   parseNum(form.pemasukanBulanan),
      frekuensiPemasukan: form.frekuensiPemasukan,
      kebutuhanHarian:    kebutuhanHarianNormal,
      kebutuhanFrekuensi: form.kebutuhanFrekuensi,
    }
    saveProfile(updated)
    onProfileUpdate(updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function previewHarian(key) {
    const raw = parseNum(form.kebutuhanHarian[key])
    const frek = form.kebutuhanFrekuensi[key]
    if (!raw || frek === 'harian') return null
    return Math.round(normalisasiKeHarian(raw, frek))
  }

  function handleAutoFill() {
    const pemasukan = parseNum(form.pemasukanBulanan)
    const frekPemasukan = form.frekuensiPemasukan
    const pemasukanBulanan = normalisasiBulanan(pemasukan, frekPemasukan)
    const tabungan  = parseNum(form.targetTabungan)
    const sisa      = Math.max(0, pemasukanBulanan - tabungan)
    const budget    = Math.round(sisa / 30)
    const bobot     = PROFIL_BOBOT[form.profesi] || PROFIL_BOBOT.lainnya

    setForm(f => ({
      ...f,
      kebutuhanFrekuensi: { ...KATEGORI_KEBUTUHAN_FREKUENSI_DEFAULT },
      kebutuhanHarian: Object.fromEntries(
        Object.entries(bobot).map(([k, pct]) => {
          const frek = KATEGORI_KEBUTUHAN_FREKUENSI_DEFAULT[k]
          let val = Math.round(budget * pct)
          if (frek === 'mingguan') val = Math.round(val * 7)
          if (frek === 'bulanan')  val = Math.round(val * 30)
          return [k, val.toLocaleString('id-ID')]
        })
      )
    }))
  }

  function handleReset() {
    setShowResetConfirm(true)
  }

  function confirmReset() {
    setShowResetConfirm(false)
    clearAllData()
    onReset()
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pengaturan Profil</h1>
          <p className="page-subtitle">Ubah data diri dan kebutuhan harianmu</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          id="btn-save-profile"
        >
          {saved ? <><CheckCircle2 size={16} /> Tersimpan!</> : <><Save size={16} /> Simpan Perubahan</>}
        </button>
      </div>

      <div className="grid grid-2" style={{ gap: 'var(--sp-6)' }}>
        {/* Identitas & Keuangan */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <div className="card">
            <div style={{ fontWeight: 'var(--fw-bold)', marginBottom: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 6 }}>Identitas</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              <div className="form-group">
                <label className="form-label">Nama</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.nama}
                  onChange={e => setForm(f => ({ ...f, nama: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Profesi / Status</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--sp-2)' }}>
                  {Object.entries(PROFIL_LABEL).map(([val, label]) => (
                    <button
                      type="button"
                      key={val}
                      className={`radio-btn ${form.profesi === val ? 'active' : ''}`}
                      onClick={() => setForm(f => ({ ...f, profesi: val }))}
                      style={{ textAlign: 'left', fontSize: '0.8rem' }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ fontWeight: 'var(--fw-bold)', marginBottom: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 6 }}>Keuangan</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              <div className="form-group">
                <label className="form-label">Pemasukan</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-3)' }}>Rp</span>
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: 36 }}
                    value={form.pemasukanBulanan}
                    onChange={e => setForm(f => ({ ...f, pemasukanBulanan: formatNum(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Frekuensi Pemasukan</label>
                <div className="radio-group">
                  {['harian', 'mingguan', 'bulanan'].map(f => (
                    <button
                      type="button"
                      key={f}
                      className={`radio-btn ${form.frekuensiPemasukan === f ? 'active' : ''}`}
                      onClick={() => setForm(ff => ({ ...ff, frekuensiPemasukan: f }))}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kebutuhan Harian */}
        <div className="card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', marginBottom: 'var(--sp-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
              <div style={{ fontWeight: 'var(--fw-bold)', display: 'flex', alignItems: 'center', gap: 6 }}>
                Kebutuhan Harian
              </div>
              <button className="btn btn-secondary btn-sm" onClick={handleAutoFill} style={{ flexShrink: 0 }}>
                <Sparkles size={16} /> Isi Otomatis
              </button>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--clr-text-2)', marginBottom: 0 }}>
              Pilih frekuensi & nominal sesuai kebiasaanmu. Sistem otomatis menormalisasi ke harian.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
            {Object.entries(KATEGORI_KEBUTUHAN_LABEL).map(([key, label]) => {
              const Icon = KATEGORI_KEBUTUHAN_ICON[key]
              const frek = form.kebutuhanFrekuensi[key] || 'harian'
              const preview = previewHarian(key)
              return (
                <div key={key} style={{ background: 'var(--clr-surface)', borderRadius: 'var(--r-md)', padding: 'var(--sp-4)', border: '1px solid var(--clr-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-3)' }}>
                    {Icon && <Icon size={20} style={{ color: 'var(--clr-primary-l)' }} />}
                    <span style={{ fontWeight: 'var(--fw-semi)', fontSize: '0.9rem' }}>{label}</span>
                  </div>

                  <div className="radio-group" style={{ marginBottom: 'var(--sp-3)' }}>
                    {['harian', 'mingguan', 'bulanan'].map(f => (
                      <button
                        type="button"
                        key={f}
                        className={`radio-btn ${frek === f ? 'active' : ''}`}
                        onClick={() => setForm(old => ({
                          ...old, kebutuhanFrekuensi: { ...old.kebutuhanFrekuensi, [key]: f }
                        }))}
                        style={{ fontSize: '0.78rem' }}
                      >
                        {f === 'harian' ? 'Per Hari' : f === 'mingguan' ? 'Per Minggu' : 'Per Bulan'}
                      </button>
                    ))}
                  </div>

                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-3)', fontSize: '0.9rem' }}>Rp</span>
                    <input
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: 36 }}
                      value={form.kebutuhanHarian[key]}
                      onChange={e => setForm(f => ({
                        ...f,
                        kebutuhanHarian: { ...f.kebutuhanHarian, [key]: formatNum(e.target.value) }
                      }))}
                    />
                  </div>

                  {preview !== null && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--clr-primary-l)', marginTop: 6 }}>
                      ≈ Rp {preview.toLocaleString('id-ID')} / hari (dihitung otomatis)
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card card-danger" style={{ marginTop: 'var(--sp-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--sp-4)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontWeight: 'var(--fw-bold)', color: 'var(--clr-danger)', marginBottom: 4 }}>
              <AlertTriangle size={16} /> Danger Zone
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--clr-text-2)' }}>
              Hapus semua data (transaksi, buku kas, profil). Tindakan ini tidak dapat dibatalkan.
            </div>
          </div>
          <button className="btn btn-danger btn-sm" onClick={handleReset} id="btn-reset-data">
            <Trash2 size={14} /> Hapus Semua Data
          </button>
        </div>
      </div>

      {showResetConfirm && (
        <ConfirmModal
          title="Hapus Semua Data?"
          message="Seluruh transaksi, tabungan, dan profil Anda akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan!"
          confirmText="Hapus Permanen"
          cancelText="Batal"
          isDanger={true}
          icon="trash"
          onConfirm={confirmReset}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}
    </div>
  )
}

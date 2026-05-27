import { useState } from 'react'
import { TrendingUp, ChevronRight, ChevronLeft, Check, Hand, Target, ShoppingCart, CheckCircle, Sparkles, ShieldCheck } from 'lucide-react'
import {
  PROFIL_LABEL, KATEGORI_KEBUTUHAN_LABEL, KATEGORI_KEBUTUHAN_ICON,
  KATEGORI_KEBUTUHAN_FREKUENSI_DEFAULT, PROFIL_BOBOT, normalisasiKeHarian, normalisasiBulanan,
  getTanggalHariIni
} from '../lib/utils.js'
import { saveProfile } from '../lib/storage.js'

const STEPS = ['Identitas', 'Profil Keuangan', 'Kebutuhan Harian', 'Konfirmasi']

export default function OnboardingPage({ onComplete }) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(() => ({
    nama: '',
    profesi: 'mahasiswa',
    pemasukanBulanan: '',
    frekuensiPemasukan: 'bulanan',
    targetTabungan: '',
    periodeMulai: getTanggalHariIni(),
    periodeSelesai: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    kebutuhanHarian: {
      makan: '', transportasi: '', kebersihan: '', hiburan: '', darurat: '',
    },
    kebutuhanFrekuensi: { ...KATEGORI_KEBUTUHAN_FREKUENSI_DEFAULT },
  }))

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleKebutuhan(key, val) {
    setForm(f => ({
      ...f,
      kebutuhanHarian: { ...f.kebutuhanHarian, [key]: val },
    }))
  }

  function handleFrekuensiKebutuhan(key, val) {
    setForm(f => ({
      ...f,
      kebutuhanFrekuensi: { ...f.kebutuhanFrekuensi, [key]: val },
    }))
  }

  function formatNum(val) {
    const num = val.replace(/\D/g, '')
    return num ? parseInt(num).toLocaleString('id-ID') : ''
  }

  function parseNum(val) {
    return parseFloat((val || '0').replace(/\D/g, '')) || 0
  }

  // Preview konversi ke harian
  function previewHarian(key) {
    const raw = parseNum(form.kebutuhanHarian[key])
    const frek = form.kebutuhanFrekuensi[key]
    if (!raw || frek === 'harian') return null
    return Math.round(normalisasiKeHarian(raw, frek))
  }

  // Auto-fill kebutuhan harian berdasarkan profesi & pemasukan
  function autoFill() {
    const pemasukan = parseNum(form.pemasukanBulanan)
    const frekPemasukan = form.frekuensiPemasukan
    const pemasukanBulanan = normalisasiBulanan(pemasukan, frekPemasukan)
    const tabungan = parseNum(form.targetTabungan)
    const sisa = Math.max(0, pemasukanBulanan - tabungan)
    const budgetHarian = Math.round(sisa / 30)
    const bobot = PROFIL_BOBOT[form.profesi] || PROFIL_BOBOT.lainnya

    // Reset frekuensi ke default & isi nominal per hari
    setForm(f => ({
      ...f,
      kebutuhanFrekuensi: { ...KATEGORI_KEBUTUHAN_FREKUENSI_DEFAULT },
      kebutuhanHarian: Object.fromEntries(
        Object.entries(bobot).map(([k, pct]) => {
          const frek = KATEGORI_KEBUTUHAN_FREKUENSI_DEFAULT[k]
          let val = Math.round(budgetHarian * pct)
          // Konversi balik ke frekuensi default agar angkanya masuk akal
          if (frek === 'mingguan') val = Math.round(val * 7)
          if (frek === 'bulanan')  val = Math.round(val * 30)
          return [k, val.toLocaleString('id-ID')]
        })
      )
    }))
  }

  function handleSubmit() {
    // Normalisasi semua kebutuhan ke per hari sebelum simpan
    const kebutuhanHarianNormal = Object.fromEntries(
      Object.entries(form.kebutuhanHarian).map(([k, v]) => [
        k, Math.round(normalisasiKeHarian(parseNum(v), form.kebutuhanFrekuensi[k] || 'harian'))
      ])
    )
    const profile = {
      nama:               form.nama,
      profesi:            form.profesi,
      pemasukanBulanan:   parseNum(form.pemasukanBulanan),
      frekuensiPemasukan: form.frekuensiPemasukan,
      targetTabungan:     parseNum(form.targetTabungan),
      periodeMulai:       form.periodeMulai,
      periodeSelesai:     form.periodeSelesai,
      kebutuhanHarian:    kebutuhanHarianNormal,
      kebutuhanFrekuensi: form.kebutuhanFrekuensi,
      createdAt: new Date().toISOString(),
    }
    saveProfile(profile)
    onComplete(profile)
  }

  function canNext() {
    if (step === 0) return form.nama.trim().length > 0
    if (step === 1) return parseNum(form.pemasukanBulanan) > 0
    return true
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-bg" />

      <div className="onboarding-card">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-8)' }}>
          <div style={{
            width: 40, height: 40,
            background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-primary-d))',
            borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px var(--clr-primary-glow)'
          }}>
            <TrendingUp size={20} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 'var(--fw-bold)', fontSize: '1.1rem' }}>FinSight</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-3)' }}>Setup awal profil kamu</div>
          </div>
        </div>

        {/* Step indicators */}
        <div className="step-indicator">
          {STEPS.map((_, i) => (
            <div key={i} className={`step-dot ${i < step ? 'done' : i === step ? 'active' : ''}`} />
          ))}
        </div>

        {/* Step label */}
        <div style={{ marginBottom: 'var(--sp-6)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-3)', marginBottom: 4 }}>
            Langkah {step + 1} dari {STEPS.length}
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 'var(--fw-bold)' }}>
            {step === 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Hand size={20} color="#FFD700" /> Halo! Siapa kamu?</span>}
            {step === 1 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Target size={20} /> Target & Periode Tabungan</span>}
            {step === 2 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><ShoppingCart size={20} /> Kebutuhan Harian</span>}
            {step === 3 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><CheckCircle size={20} color="var(--clr-success)" /> Konfirmasi</span>}
          </h1>
          <p style={{ color: 'var(--clr-text-2)', fontSize: '0.875rem', marginTop: 4 }}>
            {step === 0 && 'Ceritakan sedikit tentang dirimu'}
            {step === 1 && 'Kapan siklus keuanganmu dimulai dan berapa target tabungannya?'}
            {step === 2 && 'Estimasi pengeluaran harian kamu (bisa diubah nanti)'}
            {step === 3 && 'Periksa kembali sebelum mulai'}
          </p>
        </div>

        {/* ---- STEP 0: Identitas ---- */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }} className="slide-up">
            <div className="form-group">
              <label className="form-label">Nama Kamu</label>
              <input
                type="text"
                name="nama"
                className="form-input"
                placeholder="Contoh: Budi Santoso"
                value={form.nama}
                onChange={handleChange}
                autoFocus
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
                    style={{ textAlign: 'left' }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---- STEP 1: Profil Keuangan ---- */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }} className="slide-up">
            <div className="form-group">
              <label className="form-label">Pemasukan</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-3)', fontSize: '0.9rem' }}>Rp</span>
                <input
                  type="text"
                  name="pemasukanBulanan"
                  className="form-input"
                  style={{ paddingLeft: 36 }}
                  placeholder="0"
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
              {form.pemasukanBulanan && form.frekuensiPemasukan !== 'bulanan' && (
                <div style={{ fontSize: '0.8rem', color: 'var(--clr-success)', marginTop: 4 }}>
                  ≈ Rp {(
                    parseNum(form.pemasukanBulanan) * (form.frekuensiPemasukan === 'harian' ? 30 : 4)
                  ).toLocaleString('id-ID')} / bulan
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Periode Mulai</label>
                <input
                  type="date"
                  name="periodeMulai"
                  className="form-input"
                  value={form.periodeMulai}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Periode Selesai</label>
                <input
                  type="date"
                  name="periodeSelesai"
                  className="form-input"
                  value={form.periodeSelesai}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Target Tabungan Periode Ini</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-3)', fontSize: '0.9rem' }}>Rp</span>
                <input
                  type="text"
                  name="targetTabungan"
                  className="form-input"
                  style={{ paddingLeft: 36 }}
                  placeholder="0"
                  value={form.targetTabungan}
                  onChange={e => setForm(f => ({ ...f, targetTabungan: formatNum(e.target.value) }))}
                />
              </div>
            </div>
          </div>
        )}

        {/* ---- STEP 2: Kebutuhan Harian ---- */}
        {step === 2 && (
          <div className="slide-up">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', marginBottom: 'var(--sp-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--clr-text-2)', marginBottom: 0 }}>
                  Pilih frekuensi & nominal sesuai kebiasaanmu. Sistem akan konversi otomatis ke harian.
                </p>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={autoFill}
                  style={{ flexShrink: 0 }}
                >
                  <Sparkles size={16} /> Isi Otomatis
                </button>
              </div>
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

                    {/* Frekuensi toggle */}
                    <div className="radio-group" style={{ marginBottom: 'var(--sp-3)' }}>
                      {['harian', 'mingguan', 'bulanan'].map(f => (
                        <button
                          type="button"
                          key={f}
                          className={`radio-btn ${frek === f ? 'active' : ''}`}
                          onClick={() => handleFrekuensiKebutuhan(key, f)}
                          style={{ fontSize: '0.78rem' }}
                        >
                          {f === 'harian' ? 'Per Hari' : f === 'mingguan' ? 'Per Minggu' : 'Per Bulan'}
                        </button>
                      ))}
                    </div>

                    {/* Nominal */}
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-3)', fontSize: '0.9rem' }}>Rp</span>
                      <input
                        type="text"
                        className="form-input"
                        style={{ paddingLeft: 36 }}
                        placeholder="0"
                        value={form.kebutuhanHarian[key]}
                        onChange={e => handleKebutuhan(key, formatNum(e.target.value))}
                      />
                    </div>

                    {/* Preview konversi */}
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
        )}

        {/* ---- STEP 3: Konfirmasi ---- */}
        {step === 3 && (
          <div className="slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {[
              ['Nama', form.nama],
              ['Profesi', PROFIL_LABEL[form.profesi]],
              ['Pemasukan', `Rp ${form.pemasukanBulanan} / ${form.frekuensiPemasukan}`],
              ['Periode', `${form.periodeMulai} s/d ${form.periodeSelesai}`],
              ['Target Tabungan', `Rp ${form.targetTabungan} / periode`],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--sp-3)', background: 'var(--clr-surface)', borderRadius: 'var(--r-md)', border: '1px solid var(--clr-border)' }}>
                <span style={{ color: 'var(--clr-text-2)', fontSize: '0.875rem' }}>{k}</span>
                <span style={{ fontWeight: 'var(--fw-semi)', fontSize: '0.875rem' }}>{v}</span>
              </div>
            ))}
            <div className="card card-success" style={{ padding: 'var(--sp-3)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--clr-success)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={16} /> Data hanya tersimpan di browser kamu. Tidak dikirim ke server manapun.
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--sp-8)', gap: 'var(--sp-3)' }}>
          <button
            className="btn btn-ghost"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            style={{ visibility: step === 0 ? 'hidden' : 'visible' }}
          >
            <ChevronLeft size={16} /> Kembali
          </button>
          {step < STEPS.length - 1 ? (
            <button
              className="btn btn-primary"
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
            >
              Lanjut <ChevronRight size={16} />
            </button>
          ) : (
            <button className="btn btn-success" onClick={handleSubmit} id="btn-start-app">
              <Check size={16} /> Mulai FinSight!
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

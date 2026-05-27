import { useState } from 'react'
import { PiggyBank, Target, Calendar, DollarSign, TrendingUp, Briefcase, Calendar as CalendarIcon, CheckCircle2, AlertCircle, AlertTriangle, Lightbulb } from 'lucide-react'
import {
  formatRupiah, formatTanggal,
  hitungBudgetHarian, hitungSmartBreakdown, normalisasiBulanan,
  getPeriodeDays, getCurrentDayInPeriode, getSisaHariDalamPeriode,
  KATEGORI_KEBUTUHAN_LABEL, KATEGORI_KEBUTUHAN_ICON, PROFIL_LABEL,
  getTanggalHariIni
} from '../lib/utils.js'
import { saveProfile } from '../lib/storage.js'

export default function SavingsPage({ profile, onProfileUpdate }) {
  const [editTarget, setEditTarget] = useState(false)
  const [targetInput, setTargetInput] = useState(
    profile?.targetTabungan ? profile.targetTabungan.toLocaleString('id-ID') : ''
  )
  const [mulaiInput, setMulaiInput] = useState(profile?.periodeMulai || getTanggalHariIni())
  const [selesaiInput, setSelesaiInput] = useState(profile?.periodeSelesai || getTanggalHariIni())

  const periodeMulai     = profile?.periodeMulai || getTanggalHariIni()
  const periodeSelesai   = profile?.periodeSelesai || getTanggalHariIni()
  
  const totalHari        = getPeriodeDays(periodeMulai, periodeSelesai)
  const hariKe           = getCurrentDayInPeriode(periodeMulai, periodeSelesai)
  const sisaHari         = getSisaHariDalamPeriode(periodeSelesai)

  const pemasukanRaw     = profile?.pemasukanBulanan || 0
  const frekuensi        = profile?.frekuensiPemasukan || 'bulanan'
  const pemasukanBulanan = normalisasiBulanan(pemasukanRaw, frekuensi)
  const targetTabungan   = profile?.targetTabungan || 0
  const budgetHarian     = hitungBudgetHarian(pemasukanBulanan, targetTabungan, totalHari)

  // Smart breakdown — dengan redistribusi surplus
  const smartBreakdown = hitungSmartBreakdown(budgetHarian, profile?.profesi || 'lainnya', profile?.kebutuhanHarian || {})

  // Hitung total estimasi user per hari
  const totalUserHarian = Object.values(smartBreakdown).reduce((s, v) => s + v.userVal, 0)
  const totalSurplusGlobal = budgetHarian - totalUserHarian

  function saveTarget() {
    const newTarget = parseFloat(targetInput.replace(/\D/g, '')) || 0
    const updated = { 
      ...profile, 
      targetTabungan: newTarget,
      periodeMulai: mulaiInput,
      periodeSelesai: selesaiInput
    }
    saveProfile(updated)
    onProfileUpdate(updated)
    setEditTarget(false)
  }

  const pct = pemasukanBulanan > 0
    ? Math.round((targetTabungan / pemasukanBulanan) * 100)
    : 0

  // Config tampilan per status
  const statusConfig = {
    hemat:     { label: 'Hemat ✓',      bg: 'var(--clr-success-l)',  border: 'rgba(16,217,160,0.25)', badge: 'badge-success', badgeText: '✓ Hemat',      note: () => ({ color: 'var(--clr-success)' }) },
    sesuai:    { label: 'Sesuai',       bg: 'var(--clr-surface)',    border: 'var(--clr-border)',     badge: 'badge-primary', badgeText: '≈ Sesuai',     note: () => ({ color: 'var(--clr-text-3)' }) },
    covered:   { label: 'Tertutup ✓',  bg: 'var(--clr-info-l)',     border: 'rgba(71,202,255,0.25)', badge: 'badge-info',    badgeText: '↔ Tertutup',   note: () => ({ color: 'var(--clr-info)' }) },
    perhatian: { label: 'Perlu Cek',   bg: 'var(--clr-danger-l)',   border: 'rgba(255,87,87,0.25)',  badge: 'badge-danger',  badgeText: '⚠ Perlu Cek', note: () => ({ color: 'var(--clr-danger)' }) },
  }

  const hasPerhatian = Object.values(smartBreakdown).some(v => v.status === 'perhatian')

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Rencana Tabungan</h1>
          <p className="page-subtitle">
            Periode: {formatTanggal(periodeMulai, 'short')} - {formatTanggal(periodeSelesai, 'short')} · Profil: {PROFIL_LABEL[profile?.profesi] || '—'}
          </p>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 'var(--sp-6)' }}>
        {/* Ringkasan Keuangan */}
        <div className="card">
          <div style={{ fontWeight: 'var(--fw-bold)', marginBottom: 'var(--sp-5)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            <PiggyBank size={18} color="var(--clr-primary-l)" />
            Ringkasan Keuangan
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--sp-3)' }}>
            {[
              { label: 'Total Pemasukan', value: formatRupiah(pemasukanBulanan), color: 'var(--clr-success)', icon: <TrendingUp size={16} /> },
              { label: 'Target Tabungan',   value: formatRupiah(targetTabungan),   color: 'var(--clr-primary-l)', icon: <Target size={16} /> },
              { label: 'Sisa Budget',   value: formatRupiah(Math.max(0, pemasukanBulanan - targetTabungan)), color: 'var(--clr-info)', icon: <Briefcase size={16} /> },
              { label: 'Budget Harian',   value: formatRupiah(budgetHarian),     color: 'var(--clr-warning)', icon: <CalendarIcon size={16} /> },
            ].map((item, i) => (
              <div key={i} style={{ 
                padding: 'var(--sp-4)', 
                background: 'var(--clr-surface)', 
                borderRadius: 'var(--r-md)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 'var(--sp-2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', color: 'var(--clr-text-3)', fontSize: '0.8rem', fontWeight: 'var(--fw-medium)' }}>
                  <div style={{ color: item.color }}>{item.icon}</div> {item.label}
                </div>
                <div style={{ fontWeight: 'var(--fw-bold)', fontSize: '1.25rem', color: 'var(--clr-text)' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Edit target */}
          <div style={{ marginTop: 'var(--sp-5)', paddingTop: 'var(--sp-4)', borderTop: '1px solid var(--clr-border)' }}>
            {!editTarget ? (
              <button className="btn btn-secondary btn-sm" onClick={() => setEditTarget(true)}>
                <Target size={14} /> Ubah Target & Periode
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-3)', marginBottom: 4 }}>Mulai</div>
                    <input
                      type="date"
                      className="form-input"
                      value={mulaiInput}
                      onChange={e => setMulaiInput(e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-3)', marginBottom: 4 }}>Selesai</div>
                    <input
                      type="date"
                      className="form-input"
                      value={selesaiInput}
                      onChange={e => setSelesaiInput(e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'flex-end' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-3)', marginBottom: 4 }}>Target Tabungan</div>
                    <span style={{ position: 'absolute', left: 10, bottom: 10, color: 'var(--clr-text-3)', fontSize: '0.85rem' }}>Rp</span>
                    <input
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: 32 }}
                      value={targetInput}
                      onChange={e => setTargetInput(e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.'))}
                      autoFocus
                    />
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={saveTarget} style={{ height: 38 }}>Simpan</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditTarget(false)} style={{ height: 38 }}>✕</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress & Info */}
        <div className="card">
          <div style={{ fontWeight: 'var(--fw-bold)', marginBottom: 'var(--sp-5)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            <Calendar size={18} color="var(--clr-info)" />
            Status Periode Ini
          </div>

          {/* Persentase tabungan */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--sp-6)' }}>
            <div style={{
              width: 120, height: 120, margin: '0 auto',
              borderRadius: '50%',
              background: `conic-gradient(var(--clr-primary) ${pct * 3.6}deg, var(--clr-surface-2) 0deg)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: 88, height: 88, borderRadius: '50%',
                background: 'var(--clr-bg-2)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
              }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 'var(--fw-black)', color: 'var(--clr-primary-l)' }}>{pct}%</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--clr-text-3)' }}>ditabung</div>
              </div>
            </div>
            <div style={{ marginTop: 'var(--sp-3)', fontSize: '0.875rem', color: 'var(--clr-text-2)' }}>
              {pct >= 20 ? <span style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}><CheckCircle2 size={16} /> Tabungan sehat!</span> : pct >= 10 ? <span style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}><AlertCircle size={16} /> Bisa lebih baik</span> : <span style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}><AlertTriangle size={16} /> Perlu ditingkatkan</span>}
            </div>
          </div>

          {/* Sisa hari info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            {[
              { label: 'Hari ke', value: `${hariKe} / ${totalHari}` },
              { label: 'Sisa hari', value: `${sisaHari} hari` },
              { label: 'Budget sisa bulan', value: formatRupiah(budgetHarian * sisaHari, true) },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--clr-text-2)' }}>{item.label}</span>
                <span style={{ fontWeight: 'var(--fw-semi)' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Smart Budget Breakdown */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-2)', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
          <div style={{ fontWeight: 'var(--fw-bold)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            <DollarSign size={18} color="var(--clr-warning)" />
            Analisis Budget Harian per Kategori
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--clr-text-3)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="badge badge-success">✓ Hemat</span>
            <span className="badge badge-info">↔ Tertutup surplus</span>
            <span className="badge badge-danger">⚠ Perlu cek</span>
          </div>
        </div>

        {/* Total summary bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--sp-3)',
          padding: 'var(--sp-4)',
          background: 'var(--clr-surface-2)',
          borderLeft: `4px solid ${totalSurplusGlobal >= 0 ? 'var(--clr-success)' : 'var(--clr-danger)'}`,
          borderRadius: 'var(--r-md)',
          marginBottom: 'var(--sp-5)',
        }}>
          <div style={{ fontSize: '0.9rem' }}>
            <strong>Total estimasi harianmu:</strong>{' '}
            <span style={{ color: totalSurplusGlobal >= 0 ? 'var(--clr-success)' : 'var(--clr-danger)', fontWeight: 'var(--fw-bold)', fontSize: '1.05rem' }}>
              {formatRupiah(totalUserHarian)}
            </span>
            {' '}dari budget{' '}
            <strong>{formatRupiah(budgetHarian)}</strong>
          </div>
          <div style={{ fontWeight: 'var(--fw-bold)', color: totalSurplusGlobal >= 0 ? 'var(--clr-success)' : 'var(--clr-danger)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            {totalSurplusGlobal >= 0 ? `+${formatRupiah(totalSurplusGlobal, true)} surplus` : `${formatRupiah(Math.abs(totalSurplusGlobal), true)} kekurangan`}
          </div>
        </div>

        <div className="grid grid-3">
          {Object.entries(smartBreakdown)
            .filter(([, data]) => data.userVal > 0 || data.recommended > 0)
            .map(([key, data]) => {
            const label = KATEGORI_KEBUTUHAN_LABEL[key] || key
            const Icon = KATEGORI_KEBUTUHAN_ICON[key]
            const cfg = statusConfig[data.status] || statusConfig.sesuai
            const hasUser = data.userVal !== data.recommended
            return (
              <div key={key} style={{
                background: 'var(--clr-surface)',
                border: '1px solid var(--clr-border)',
                borderTop: `4px solid ${cfg.note().color}`,
                borderRadius: 'var(--r-lg)',
                padding: 'var(--sp-4)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--sp-3)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--sp-2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', flex: 1 }}>
                    <div style={{ 
                      width: 36, height: 36, borderRadius: 'var(--r-md)', 
                      background: cfg.bg, color: cfg.note().color, 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {Icon && <Icon size={18} />}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'var(--fw-semi)', color: 'var(--clr-text-2)', lineHeight: 1.3 }}>{label}</div>
                  </div>
                  <span className={`badge ${cfg.badge}`} style={{ fontSize: '0.7rem', padding: '2px 8px', whiteSpace: 'nowrap', flexShrink: 0 }}>{cfg.badgeText}</span>
                </div>

                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'var(--fw-bold)', color: 'var(--clr-text)' }}>
                    {formatRupiah(data.userVal)} <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-3)', fontWeight: 'normal' }}>/ hari</span>
                  </div>
                  
                  {hasUser && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-3)', marginTop: 4 }}>
                      Rekomendasi: {formatRupiah(data.recommended)}
                    </div>
                  )}
                </div>

                <div style={{ 
                  marginTop: 'auto', paddingTop: 'var(--sp-3)', 
                  fontSize: '0.75rem', color: cfg.note().color, 
                  borderTop: '1px dashed var(--clr-border)', 
                  display: 'flex', alignItems: 'flex-start', gap: 6 
                }}>
                  {data.status === 'perhatian' && <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 2 }} />}
                  <span style={{ lineHeight: 1.4 }}>
                    {data.status === 'covered' && 'Selisih ditutup dari surplus kategori lain'}
                    {data.status === 'perhatian' && 'Melebihi budget & surplus tidak cukup'}
                    {data.status === 'hemat' && `Surplus ${formatRupiah(data.diff, true)} bisa dialokasikan`}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Info tip kontekstual */}
        <div style={{ 
          marginTop: 'var(--sp-4)', padding: 'var(--sp-4)', 
          background: hasPerhatian ? 'var(--clr-danger-l)' : totalSurplusGlobal >= 0 ? 'var(--clr-success-l)' : 'var(--clr-warning-l)',
          borderLeft: `4px solid ${hasPerhatian ? 'var(--clr-danger)' : totalSurplusGlobal >= 0 ? 'var(--clr-success)' : 'var(--clr-warning)'}`,
          borderRadius: 'var(--r-md)'
        }}>
          <div style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
            {hasPerhatian ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, color: 'var(--clr-danger)' }}><AlertTriangle size={16} /> <strong>Perhatian:</strong></div>
                Beberapa kategori melebihi budget dan surplus dari kategori lain tidak cukup untuk menutup. Pertimbangkan untuk mengurangi pengeluaran di kategori tersebut atau menyesuaikan target tabungan.
              </>
            ) : totalSurplusGlobal >= 0 ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, color: 'var(--clr-success)' }}><CheckCircle2 size={16} /> <strong>Keuanganmu sehat!</strong></div>
                Total estimasi pengeluaranmu masih di bawah budget harian. Jika dijalankan {totalHari} hari, kamu bisa menabung <strong style={{ color: 'var(--clr-success)' }}>{formatRupiah(targetTabungan)}</strong> bulan ini.
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, color: 'var(--clr-warning)' }}><Lightbulb size={16} /> <strong>Tips:</strong></div>
                Total estimasi harianmu sedikit melebihi budget. Coba kurangi salah satu kategori untuk mencapai target tabungan <strong>{formatRupiah(targetTabungan)}</strong>.
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


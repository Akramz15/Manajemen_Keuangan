import { useState, useEffect } from 'react'
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react'
import { getFinancialInsight } from '../lib/groqInsight.js'
import {
  hitungSummaryPeriode, hitungBudgetHarian, normalisasiBulanan,
  getPeriodeDays, getCurrentDayInPeriode, getTanggalHariIni
} from '../lib/utils.js'

export default function InsightCard({ profile, transactions }) {
  const [insight, setInsight] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [generated, setGenerated] = useState(false)

  const hasApiKey = !!import.meta.env.VITE_GROQ_API_KEY

  async function generateInsight() {
    if (!profile || !hasApiKey) return
    setLoading(true)
    setError(null)

    const periodeMulai = profile.periodeMulai || getTanggalHariIni()
    const periodeSelesai = profile.periodeSelesai || getTanggalHariIni()
    const pemasukanRaw = profile.pemasukanBulanan || 0
    const frekuensi = profile.frekuensiPemasukan || 'bulanan'
    const pemasukanBulanan = normalisasiBulanan(pemasukanRaw, frekuensi)
    const targetTabungan = profile.targetTabungan || 0
    
    const totalHari = getPeriodeDays(periodeMulai, periodeSelesai)
    const hariKe = getCurrentDayInPeriode(periodeMulai, periodeSelesai)
    
    const budgetHarian = hitungBudgetHarian(pemasukanBulanan, targetTabungan, totalHari)
    const summary = hitungSummaryPeriode(transactions, periodeMulai, periodeSelesai)

    try {
      const result = await getFinancialInsight({
        profesi: profile.profesi,
        pemasukanBulanan,
        targetTabungan,
        budgetHarian,
        pengeluaran: summary.pengeluaran,
        perKategori: summary.perKategori,
        hariKe,
        totalHari,
      })
      setInsight(result)
      setGenerated(true)
    } catch {
      setError('Gagal mengambil insight. Periksa API key Groq kamu.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (profile && hasApiKey && !generated && transactions.length >= 0) {
      generateInsight()
    }
  }, [profile?.profesi])

  const statusColor = {
    aman:      { bg: 'var(--clr-success-l)',  border: 'rgba(16,217,160,0.25)', text: 'var(--clr-success)' },
    perhatian: { bg: 'var(--clr-warning-l)', border: 'rgba(255,181,71,0.25)', text: 'var(--clr-warning)' },
    bahaya:    { bg: 'var(--clr-danger-l)',  border: 'rgba(255,87,87,0.25)',  text: 'var(--clr-danger)'  },
  }

  const statusStyle = insight ? (statusColor[insight.status] || statusColor.perhatian) : null

  return (
    <div className="card insight-card" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
          <div className="icon-circle icon-circle-primary">
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 'var(--fw-bold)', fontSize: '0.95rem' }}>AI Insight Keuangan</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-3)' }}>Analisis otomatis oleh Groq AI</div>
          </div>
        </div>
        {hasApiKey && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={generateInsight}
            disabled={loading}
            title="Perbarui insight"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} style={{ animation: loading ? 'spin 0.6s linear infinite' : 'none' }} />
            {!loading && 'Perbarui'}
          </button>
        )}
      </div>

      {!hasApiKey && (
        <div className="card card-warning" style={{ padding: 'var(--sp-4)' }}>
          <div style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'flex-start' }}>
            <AlertCircle size={16} color="var(--clr-warning)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: '0.875rem' }}>
              <strong>API Key belum diatur.</strong>{' '}
              Tambahkan <code style={{ background: 'rgba(255,181,71,0.2)', padding: '1px 6px', borderRadius: 4, fontSize: '0.8rem' }}>VITE_GROQ_API_KEY</code> di file <code>.env</code> untuk mengaktifkan fitur AI.
            </div>
          </div>
        </div>
      )}

      {hasApiKey && loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          {[80, 60, 70, 50].map((w, i) => (
            <div key={i} className="skeleton" style={{ height: 14, width: `${w}%` }} />
          ))}
        </div>
      )}

      {hasApiKey && error && !loading && (
        <div className="card card-danger" style={{ padding: 'var(--sp-4)', fontSize: '0.875rem' }}>
          <AlertCircle size={14} style={{ display: 'inline', marginRight: 6 }} />
          {error}
        </div>
      )}

      {hasApiKey && insight && !loading && (
        <div className="slide-up">
          {/* Status */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 'var(--sp-3)',
            padding: 'var(--sp-3) var(--sp-4)', borderRadius: 'var(--r-md)',
            background: statusStyle.bg, border: `1px solid ${statusStyle.border}`,
            marginBottom: 'var(--sp-4)'
          }}>
            <span style={{ fontSize: '1.4rem' }}>{insight.emoji}</span>
            <div>
              <div style={{ fontWeight: 'var(--fw-bold)', color: statusStyle.text, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                Status: {insight.status}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--clr-text)' }}>
                {insight.ringkasan}
              </div>
            </div>
          </div>

          {/* Analisis */}
          {insight.analisis?.length > 0 && (
            <div style={{ marginBottom: 'var(--sp-4)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 'var(--fw-semi)', color: 'var(--clr-text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--sp-2)' }}>
                📊 Analisis
              </div>
              <div className="insight-points">
                {insight.analisis.map((a, i) => (
                  <div key={i} className="insight-point">{a}</div>
                ))}
              </div>
            </div>
          )}

          {/* Saran */}
          {insight.saran?.length > 0 && (
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 'var(--fw-semi)', color: 'var(--clr-text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--sp-2)' }}>
                💡 Saran
              </div>
              <div className="insight-points">
                {insight.saran.map((s, i) => (
                  <div key={i} className="insight-point" style={{ '--bullet-color': 'var(--clr-warning)' }}>{s}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {hasApiKey && !insight && !loading && !error && (
        <div style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--clr-text-3)' }}>
          <Sparkles size={28} style={{ marginBottom: 'var(--sp-3)', opacity: 0.4 }} />
          <div style={{ fontSize: '0.875rem' }}>Klik "Perbarui" untuk generate insight</div>
        </div>
      )}
    </div>
  )
}

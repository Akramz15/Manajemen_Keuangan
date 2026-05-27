import { useState, useCallback } from 'react'
import { Plus, TrendingUp, TrendingDown, Wallet, PiggyBank, BarChart2 } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import {
  formatRupiah, formatTanggal,
  hitungSummaryPeriode, hitungBudgetHarian, normalisasiBulanan,
  getPeriodeDays, getCurrentDayInPeriode, KATEGORI_PENGELUARAN,
  getTanggalHariIni
} from '../lib/utils.js'
import { getTransactions } from '../lib/storage.js'
import TransactionForm from '../components/TransactionForm.jsx'
import InsightCard from '../components/InsightCard.jsx'

const COLORS = ['#6C63FF','#10D9A0','#FF5757','#FFB547','#47CAFF','#FF85A2','#A8FF78','#FF9F43','#C8A2C8']

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--clr-bg-2)', border: '1px solid var(--clr-border)', borderRadius: 'var(--r-md)', padding: 'var(--sp-3)', fontSize: '0.85rem' }}>
      <div style={{ fontWeight: 'var(--fw-semi)' }}>{payload[0].name}</div>
      <div style={{ color: 'var(--clr-danger)' }}>{formatRupiah(payload[0].value)}</div>
    </div>
  )
}

export default function DashboardPage({ profile }) {
  const [showForm, setShowForm] = useState(false)
  const [transactions, setTransactions] = useState(() => getTransactions())

  const refresh = useCallback(() => setTransactions(getTransactions()), [])

  const periodeMulai     = profile?.periodeMulai || getTanggalHariIni()
  const periodeSelesai   = profile?.periodeSelesai || getTanggalHariIni()

  const pemasukan_raw = profile?.pemasukanBulanan || 0
  const frekuensi     = profile?.frekuensiPemasukan || 'bulanan'
  const pemasukanBulanan = normalisasiBulanan(pemasukan_raw, frekuensi)
  const targetTabungan   = profile?.targetTabungan || 0
  
  const totalHari        = getPeriodeDays(periodeMulai, periodeSelesai)
  const hariKe           = getCurrentDayInPeriode(periodeMulai, periodeSelesai)
  
  const budgetHarian     = hitungBudgetHarian(pemasukanBulanan, targetTabungan, totalHari)
  const summary          = hitungSummaryPeriode(transactions, periodeMulai, periodeSelesai)

  const progresTabungan = targetTabungan > 0
    ? Math.min(100, Math.round((Math.max(0, summary.saldo) / targetTabungan) * 100))
    : 0

  // Chart data
  const chartData = KATEGORI_PENGELUARAN
    .filter(k => summary.perKategori[k.value] > 0)
    .map(k => ({ name: `${k.emoji} ${k.label}`, value: summary.perKategori[k.value] }))

  const statCards = [
    {
      label: 'Total Pemasukan',
      value: formatRupiah(Math.max(pemasukanBulanan, summary.pemasukan)),
      icon: TrendingUp,
      cls: 'icon-circle-success',
      color: 'var(--clr-success)',
    },
    {
      label: 'Total Pengeluaran',
      value: formatRupiah(summary.pengeluaran),
      icon: TrendingDown,
      cls: 'icon-circle-danger',
      color: 'var(--clr-danger)',
    },
    {
      label: 'Saldo Periode Ini',
      value: formatRupiah(summary.saldo),
      icon: Wallet,
      cls: summary.saldo >= 0 ? 'icon-circle-success' : 'icon-circle-danger',
      color: summary.saldo >= 0 ? 'var(--clr-success)' : 'var(--clr-danger)',
    },
    {
      label: 'Target Tabungan',
      value: formatRupiah(targetTabungan),
      icon: PiggyBank,
      cls: 'icon-circle-primary',
      color: 'var(--clr-primary-l)',
    },
  ]

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Halo, {profile?.nama?.split(' ')[0] || 'Kawan'}! 👋
          </h1>
          <p className="page-subtitle">
            {formatTanggal(periodeMulai, 'short')} - {formatTanggal(periodeSelesai, 'short')} · Hari ke-{hariKe} dari {totalHari} hari
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)} id="btn-add-tx">
          <Plus size={16} /> Tambah Transaksi
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-4" style={{ marginBottom: 'var(--sp-6)' }}>
        {statCards.map((s, i) => {
          const Icon = s.icon
          return (
            <div className="card" key={i} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                <div className={`icon-circle ${s.cls}`} style={{ width: 36, height: 36 }}>
                  <Icon size={16} />
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-3)', fontWeight: 'var(--fw-semi)', lineHeight: 1.2 }}>
                  {s.label}
                </div>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 'var(--fw-bold)', color: s.color, wordBreak: 'break-word', lineHeight: 1 }}>
                {s.value}
              </div>
            </div>
          )
        })}
      </div>

      {/* Budget + Chart + Insight */}
      <div className="grid-layout-main" style={{ marginBottom: 'var(--sp-6)' }}>
        
        {/* Kolom Kiri: Budget, Chart, dan Transaksi Terakhir */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
          
          <div className="grid grid-2" style={{ marginBottom: 0 }}>
            {/* Budget Harian + Progress */}
            <div className="card">
          <div style={{ fontWeight: 'var(--fw-bold)', marginBottom: 'var(--sp-4)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            Budget & Tabungan
          </div>

          <div style={{ marginBottom: 'var(--sp-5)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-2)', marginBottom: 6 }}>Budget per Hari</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'var(--fw-black)', color: 'var(--clr-primary-l)' }}>
              {formatRupiah(budgetHarian, true)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-3)', marginTop: 2 }}>
              Tersisa {totalHari - hariKe} hari lagi
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--sp-2)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-2)' }}>Progress Tabungan</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 'var(--fw-semi)', color: 'var(--clr-primary-l)' }}>
                {progresTabungan}%
              </div>
            </div>
            <div className="progress-track">
              <div
                className={`progress-fill ${progresTabungan >= 100 ? 'success' : ''}`}
                style={{ width: `${progresTabungan}%` }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--sp-2)', fontSize: '0.75rem', color: 'var(--clr-text-3)' }}>
              <span>{formatRupiah(Math.max(0, summary.saldo), true)} terkumpul</span>
              <span>Target {formatRupiah(targetTabungan, true)}</span>
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="card">
          <div style={{ fontWeight: 'var(--fw-bold)', marginBottom: 'var(--sp-4)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            Pengeluaran per Kategori
          </div>
          {chartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-1)', marginTop: 'var(--sp-2)' }}>
                {chartData.slice(0, 4).map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                      <span style={{ color: 'var(--clr-text-2)' }}>{d.name}</span>
                    </div>
                    <span style={{ fontWeight: 'var(--fw-medium)' }}>{formatRupiah(d.value, true)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ padding: 'var(--sp-8)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--sp-2)' }}><BarChart2 size={32} /></div>
              <div style={{ fontSize: '0.8rem' }}>Belum ada pengeluaran</div>
            </div>
          )}
        </div>
      </div>

      {/* Transaksi Terakhir */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
            <div style={{ fontWeight: 'var(--fw-bold)', display: 'flex', alignItems: 'center', gap: 6 }}>
              Transaksi Terakhir (Periode Ini)
            </div>
          </div>
          {summary.txPeriode.slice(0, 5).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
              {summary.txPeriode.slice(0, 5).map(t => {
                const isIn = t.jenis === 'pemasukan'
                return (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--sp-3)', background: 'var(--clr-surface)', borderRadius: 'var(--r-md)' }}>
                    <div>
                      <div style={{ fontWeight: 'var(--fw-medium)', fontSize: '0.875rem' }}>{t.catatan || t.kategori}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-3)' }}>{t.tanggal}</div>
                    </div>
                    <div style={{ fontWeight: 'var(--fw-bold)', color: isIn ? 'var(--clr-success)' : 'var(--clr-danger)' }}>
                      {isIn ? '+' : '-'}{formatRupiah(isIn ? (t.jumlahBulanan || t.jumlah) : t.jumlah, true)}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 'var(--sp-6)', color: 'var(--clr-text-3)', fontSize: '0.875rem' }}>
              Belum ada transaksi di periode ini. Tambahkan sekarang!
            </div>
          )}
        </div>
      </div>

        {/* Kolom Kanan: AI Insight */}
        <div style={{ height: '100%' }}>
          <InsightCard profile={profile} transactions={transactions} />
        </div>
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

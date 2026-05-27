import { useState } from 'react'
import { TrendingUp, Zap, Target, Download, BarChart2, Bot, Calendar, ClipboardList, Heart } from 'lucide-react'
import { auth, googleProvider, signInWithPopup } from '../lib/firebase.js'

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

const features = [
  {
    icon: <BarChart2 size={32} strokeWidth={1.5} color="var(--clr-primary)" />,
    title: 'Dashboard Lengkap',
    desc: 'Lihat ringkasan keuangan bulan ini: pemasukan, pengeluaran, saldo, dan progress tabungan secara real-time.',
  },
  {
    icon: <Bot size={32} strokeWidth={1.5} color="var(--clr-primary)" />,
    title: 'AI Insight Otomatis',
    desc: 'Groq AI menganalisis pola pengeluaran kamu dan memberikan saran hemat personal tanpa perlu bertanya.',
  },
  {
    icon: <Target size={32} strokeWidth={1.5} color="var(--clr-primary)" />,
    title: 'Rencana Tabungan',
    desc: 'Set target tabungan dan dapatkan rekomendasi budget harian yang disesuaikan dengan profesi kamu.',
  },
  {
    icon: <ClipboardList size={32} strokeWidth={1.5} color="var(--clr-primary)" />,
    title: 'Buku Kas Digital',
    desc: 'Catat semua transaksi dalam format buku kas yang rapi dan bisa diunduh sebagai PDF.',
  },
  {
    icon: <Calendar size={32} strokeWidth={1.5} color="var(--clr-primary)" />,
    title: 'Pemasukan Fleksibel',
    desc: 'Input pemasukan per hari, minggu, atau bulan — otomatis dikonversi ke total bulanan.',
  },
  {
    icon: <Download size={32} strokeWidth={1.5} color="var(--clr-primary)" />,
    title: 'Export PDF',
    desc: 'Unduh laporan keuangan dan buku kas bulanan dalam format PDF yang rapi dan profesional.',
  },
]

export default function LandingPage() {
  const [loading, setLoading] = useState(false)

  async function handleGoogleLogin() {
    try {
      setLoading(true)
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      console.error('Google Sign-In Error:', err)
      alert('Gagal login dengan Google: ' + err.message)
      setLoading(false)
    }
  }

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
          <div style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-primary-d))',
            borderRadius: 'var(--r-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px var(--clr-primary-glow)'
          }}>
            <TrendingUp size={16} color="white" />
          </div>
          <span style={{ fontWeight: 'var(--fw-bold)', fontSize: '1.1rem' }}>FinSight</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />

        <div className="hero-badge fade-in">
          <Zap size={12} /> Didukung Groq AI · Gratis & Privasi Terjaga
        </div>

        <h1 className="fade-in">
          Kelola Keuangan Lebih{' '}
          <span className="gradient-text">Cerdas & Terencana</span>
        </h1>

        <p className="fade-in">
          FinSight membantu kamu mencatat pemasukan & pengeluaran, merencanakan tabungan,
          dan mendapatkan rekomendasi budget harian personal — semua dengan bantuan AI.
        </p>

        <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="btn btn-primary btn-lg" onClick={handleGoogleLogin} disabled={loading} id="cta-hero">
            <GoogleIcon /> {loading ? 'Mohon Tunggu...' : 'Mulai dengan Google'}
          </button>
          <a
            href="#features"
            className="btn btn-ghost btn-lg"
            style={{ textDecoration: 'none' }}
          >
            Lihat Fitur
          </a>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', gap: 'var(--sp-8)', marginTop: 'var(--sp-12)',
          flexWrap: 'wrap', justifyContent: 'center'
        }}>
          {[
            { label: 'Fitur Lengkap', value: '9+' },
            { label: 'Export PDF', value: '2x' },
            { label: 'AI Model', value: 'Llama 3.3' },
            { label: 'Biaya Backend', value: 'Rp 0' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 'var(--fw-black)', color: 'var(--clr-primary-l)' }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-3)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ paddingBottom: 'var(--sp-16)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--sp-10)' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'var(--fw-bold)', letterSpacing: '-0.02em' }}>
            Semua yang Kamu Butuhkan
          </h2>
          <p style={{ color: 'var(--clr-text-2)', marginTop: 'var(--sp-2)' }}>
            Dari pencatatan harian hingga analisis AI — semuanya dalam satu aplikasi.
          </p>
        </div>

        <div className="features-grid">
          {features.map((f, i) => (
            <div
              key={i}
              className="feature-card"
            >
              <div style={{ fontSize: '2rem', marginBottom: 'var(--sp-3)' }}>{f.icon}</div>
              <div style={{ fontWeight: 'var(--fw-bold)', marginBottom: 'var(--sp-2)', fontSize: '1rem' }}>
                {f.title}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--clr-text-2)', lineHeight: 1.6 }}>
                {f.desc}
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--clr-border)',
        padding: 'var(--sp-6) var(--sp-10)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 'var(--sp-4)',
        color: 'var(--clr-text-3)',
        fontSize: '0.8rem'
      }}>
        <div>© 2026 FinSight. Data tersimpan aman di Cloud.</div>
        <div>Dibuat dengan <Heart size={12} fill="currentColor" style={{ display: 'inline', color: 'var(--clr-primary)' }} /> oleh <strong>Naufal Akramziyad Putra Heryadi</strong> · Powered by Groq AI</div>
      </footer>
    </div>
  )
}

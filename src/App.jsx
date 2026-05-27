import { useState, useEffect } from 'react'
import './index.css'
import { getProfile, syncFromCloud, clearAllData } from './lib/storage.js'
import { useAuth } from './contexts/AuthContext.jsx'
import { signOut } from 'firebase/auth'
import { auth } from './lib/firebase.js'
import LandingPage      from './pages/LandingPage.jsx'
import OnboardingPage   from './pages/OnboardingPage.jsx'
import DashboardPage    from './pages/DashboardPage.jsx'
import TransactionPage  from './pages/TransactionPage.jsx'
import SavingsPage      from './pages/SavingsPage.jsx'
import BukuKasPage      from './pages/BukuKasPage.jsx'
import ReportPage       from './pages/ReportPage.jsx'
import PengaturanPage   from './pages/PengaturanPage.jsx'
import Sidebar          from './components/Sidebar.jsx'
import ConfirmModal     from './components/ConfirmModal.jsx'

export default function App() {
  const { user, loading } = useAuth()
  const [isSyncing, setIsSyncing] = useState(false)
  const [view, setView] = useState('landing')
  const [profile, setProfile] = useState(null)
  const [activePage, setActivePage] = useState(() => {
    return localStorage.getItem('finsight_active_page') || 'dashboard'
  })
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // Sync active page to local storage
  useEffect(() => {
    localStorage.setItem('finsight_active_page', activePage)
  }, [activePage])

  // When Auth state changes, sync from cloud and set view
  useEffect(() => {
    if (loading) return

    if (!user) return

    // Cek data lokal terlebih dahulu untuk render instan
    const localProfile = getProfile()
    if (localProfile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfile(localProfile)
      setView('app')
      
      // Tetap tarik dari cloud di background (tanpa menghentikan UI)
      syncFromCloud(user.uid).then((hasData) => {
        if (hasData) setProfile(getProfile()) // Refresh jika ada data baru
      }).catch(console.error)
      
    } else {
      // Jika tidak ada data lokal, kita harus menunggu cloud (mungkin pengguna di device baru)
      setIsSyncing(true)
      
      // Berikan batas waktu maksimal 10 detik agar Firebase punya waktu cukup untuk inisialisasi koneksi pertama
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
      
      Promise.race([syncFromCloud(user.uid), timeoutPromise])
        .then((hasData) => {
          if (hasData) {
            setProfile(getProfile())
            setView('app')
          } else {
            setView('onboarding')
          }
        })
        .catch((err) => {
          console.warn('Sync tertunda atau gagal:', err)
          setView('onboarding') // Fallback ke onboarding jika gagal
        })
        .finally(() => {
          setIsSyncing(false)
        })
    }
  }, [user, loading])

  function handleOnboardComplete(p) {
    setProfile(p)
    setView('app')
    setActivePage('dashboard')
  }

  function handleProfileUpdate(p) { 
    setProfile(p) 
  }

  async function handleLogout() {
    setShowLogoutConfirm(false)
    await signOut(auth)
    clearAllData()
    setProfile(null)
    setView('landing')
    setActivePage('dashboard')
  }

  function handleReset() {
    clearAllData()
    setProfile(null)
    setView('onboarding')
    setActivePage('dashboard')
  }

  if (loading || isSyncing) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--clr-bg)' }}>
        <style>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 40, height: 40, border: '4px solid var(--clr-primary-l)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--clr-text-2)', fontWeight: 'var(--fw-semi)' }}>Memuat data...</p>
        </div>
      </div>
    )
  }

  if (view === 'landing') return <LandingPage />
  if (view === 'onboarding') return <OnboardingPage onComplete={handleOnboardComplete} />

  return (
    <div className="app-layout">
      <Sidebar activePage={activePage} onNavigate={setActivePage} profile={profile} onLogout={() => setShowLogoutConfirm(true)} />
      <main className="main-content fade-in" style={{ paddingBottom: 'calc(var(--sp-8) + env(safe-area-inset-bottom))' }}>
        {activePage === 'dashboard'  && <DashboardPage profile={profile} />}
        {activePage === 'transaksi'  && <TransactionPage profile={profile} />}
        {activePage === 'tabungan'   && <SavingsPage profile={profile} />}
        {activePage === 'bukukas'    && <BukuKasPage profile={profile} />}
        {activePage === 'laporan'    && <ReportPage profile={profile} />}
        {activePage === 'pengaturan' && <PengaturanPage profile={profile} onProfileUpdate={handleProfileUpdate} onReset={handleReset} />}
      </main>
      
      {showLogoutConfirm && (
        <ConfirmModal
          title="Keluar dari FinSight?"
          message="Anda harus masuk kembali dengan akun Google untuk melihat data Anda."
          confirmText="Keluar"
          cancelText="Batal"
          isDanger={true}
          icon="logout"
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </div>
  )
}

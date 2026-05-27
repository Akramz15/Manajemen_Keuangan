import { useState } from 'react'
import {
  LayoutDashboard, ArrowLeftRight, PiggyBank, BookOpen,
  FileText, Settings, TrendingUp, Menu, X, ChevronRight, LogOut
} from 'lucide-react'

const navItems = [
  { id: 'dashboard',    label: 'Dashboard',       icon: LayoutDashboard },
  { id: 'transaksi',    label: 'Transaksi',        icon: ArrowLeftRight },
  { id: 'tabungan',     label: 'Rencana Tabungan', icon: PiggyBank },
  { id: 'bukukas',      label: 'Buku Kas',         icon: BookOpen },
  { id: 'laporan',      label: 'Laporan PDF',       icon: FileText },
]

export default function Sidebar({ activePage, onNavigate, profile, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <TrendingUp size={18} color="white" />
        </div>
        <div>
          <div className="sidebar-logo-text">FinSight</div>
          <div className="sidebar-logo-sub">Keuangan Pintar</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Menu Utama</div>
        {navItems.map(item => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => { onNavigate(item.id); setMobileOpen(false) }}
            >
              <Icon size={18} className="nav-icon" />
              <span style={{ flex: 1 }}>{item.label}</span>
              {activePage === item.id && <ChevronRight size={14} />}
            </button>
          )
        })}

        <div className="nav-section-label" style={{ marginTop: 'var(--sp-4)' }}>Lainnya</div>
        <button
          className={`nav-item ${activePage === 'pengaturan' ? 'active' : ''}`}
          onClick={() => { onNavigate('pengaturan'); setMobileOpen(false) }}
        >
          <Settings size={18} className="nav-icon" />
          <span>Pengaturan Profil</span>
        </button>
      </nav>

      {/* Footer profile */}
      <div className="sidebar-footer">
        <div className="card" style={{ padding: 'var(--sp-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--sp-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
              <div style={{
                width: 32, height: 32,
                background: 'var(--clr-primary-glow)',
                borderRadius: 'var(--r-full)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.9rem', fontWeight: 'var(--fw-bold)', color: 'var(--clr-primary-l)'
              }}>
                {profile?.nama ? profile.nama[0].toUpperCase() : '?'}
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 'var(--fw-semi)' }}>
                  {profile?.nama || 'Belum diatur'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--clr-text-3)' }}>
                  {profile?.profesi || '—'}
                </div>
              </div>
            </div>
            <button
              onClick={onLogout}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--clr-text-3)',
                cursor: 'pointer',
                padding: 'var(--sp-2)',
                borderRadius: 'var(--r-sm)',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Logout"
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--clr-bg)'; e.currentTarget.style.color = 'var(--clr-danger)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--clr-text-3)' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        {sidebarContent}
      </aside>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          display: 'none',
          position: 'fixed',
          top: 'var(--sp-4)',
          left: 'var(--sp-4)',
          zIndex: 200,
          background: 'var(--clr-bg-2)',
          border: '1px solid var(--clr-border)',
          borderRadius: 'var(--r-md)',
          width: 40,
          height: 40,
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--clr-text)',
        }}
        id="mobile-menu-btn"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <style>{`
        @media (max-width: 1024px) {
          #mobile-menu-btn { display: flex !important; }
          .sidebar { transform: ${mobileOpen ? 'translateX(0)' : 'translateX(-100%)'}; }
        }
      `}</style>
    </>
  )
}

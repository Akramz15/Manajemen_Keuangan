import { AlertTriangle, LogOut, Trash2 } from 'lucide-react'

export default function ConfirmModal({ 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'Ya', 
  cancelText = 'Batal', 
  isDanger = false,
  icon = 'alert'
}) {
  const Icon = icon === 'logout' ? LogOut : icon === 'trash' ? Trash2 : AlertTriangle

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal fade-in" style={{ maxWidth: 400, textAlign: 'center', padding: 'var(--sp-6)' }}>
        
        <div style={{ 
          width: 56, height: 56, borderRadius: '50%', 
          background: isDanger ? 'var(--clr-danger-l)' : 'var(--clr-surface-2)',
          color: isDanger ? 'var(--clr-danger)' : 'var(--clr-text)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto var(--sp-4) auto'
        }}>
          <Icon size={28} />
        </div>

        <h2 style={{ fontSize: '1.2rem', fontWeight: 'var(--fw-bold)', marginBottom: 'var(--sp-2)' }}>
          {title}
        </h2>
        <p style={{ color: 'var(--clr-text-2)', fontSize: '0.9rem', marginBottom: 'var(--sp-6)', lineHeight: 1.5 }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'center' }}>
          <button className="btn btn-ghost" onClick={onCancel} style={{ flex: 1 }}>
            {cancelText}
          </button>
          <button className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm} style={{ flex: 1 }}>
            {confirmText}
          </button>
        </div>
        
      </div>
    </div>
  )
}

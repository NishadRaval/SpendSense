import { LayoutDashboard, ArrowLeftRight, Target, TrendingUp, LogOut } from 'lucide-react'
import './Sidebar.css'

const nav = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'budgets', label: 'Budgets', icon: Target },
]

export default function Sidebar({ page, setPage, user, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon-wrap">
          <TrendingUp size={15} />
        </div>
        SpendSense
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
        <div className="user-info">
          <p className="user-name">{user?.name}</p>
          <p className="user-email">{user?.email}</p>
        </div>
      </div>

      <p className="sidebar-section-label">Menu</p>
      <nav className="sidebar-nav">
        {nav.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item ${page === id ? 'active' : ''}`}
            onClick={() => setPage(id)}
          >
            <Icon size={17} />
            <span>{label}</span>
            {page === id && <span className="nav-dot" />}
          </button>
        ))}
      </nav>

      <div className="sidebar-divider" />

      <button className="logout-btn" onClick={onLogout}>
        <LogOut size={16} />
        <span>Sign Out</span>
      </button>

      <div className="sidebar-footer">
        <p className="sidebar-footer-label">SpendSense v1.0 · MERN Stack</p>
        <span className="sidebar-badge">● Live</span>
      </div>
    </aside>
  )
}
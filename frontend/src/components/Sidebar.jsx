import { useState } from 'react'
import { LayoutDashboard, ArrowLeftRight, Target, TrendingUp, LogOut, Menu, X, Moon, Sun, User } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import './Sidebar.css'

const nav = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'budgets', label: 'Budgets', icon: Target },
  { id: 'profile', label: 'Profile', icon: User },
]

export default function Sidebar({ page, setPage, user, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { dark, setDark } = useTheme()

  const navigate = (id) => {
    setPage(id)
    setMobileOpen(false)
  }

  return (
    <>
      <div className="mobile-topbar">
        <div className="mobile-logo">
          <div className="mobile-logo-ic"><TrendingUp size={13} /></div>
          SpendSense
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="hamburger" onClick={() => setDark(d => !d)}>
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className="hamburger" onClick={() => setMobileOpen(o => !o)}>
            {mobileOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon-wrap"><TrendingUp size={14} /></div>
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
              onClick={() => navigate(id)}
            >
              <Icon size={16} />
              <span>{label}</span>
              {page === id && <span className="nav-dot" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-divider" />

        <button className="theme-toggle-btn" onClick={() => setDark(d => !d)}>
          {dark ? <Sun size={15} /> : <Moon size={15} />}
          <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>

        <div className="sidebar-footer">
          <p className="sidebar-footer-label">SpendSense v1.0 · MERN Stack</p>
          <span className="sidebar-badge">● Live</span>
        </div>
      </aside>

      <div className="mobile-bottomnav">
        {nav.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`bottom-nav-item ${page === id ? 'active' : ''}`}
            onClick={() => setPage(id)}
          >
            <Icon size={19} />
            {label}
          </button>
        ))}
      </div>
    </>
  )
}
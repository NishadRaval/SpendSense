import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Budgets from './pages/Budgets'
import Auth from './pages/Auth'
import './App.css'

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (stored && token) setUser(JSON.parse(stored))
    setChecking(false)
  }, [])

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setPage('dashboard')
  }

  if (checking) return null

  if (!user) return <Auth onLogin={handleLogin} />

  return (
    <div className="app-layout">
      <Sidebar page={page} setPage={setPage} user={user} onLogout={handleLogout} />
      <main className="main-content">
        {page === 'dashboard' && <Dashboard user={user} />}
        {page === 'transactions' && <Transactions />}
        {page === 'budgets' && <Budgets />}
      </main>
    </div>
  )
}
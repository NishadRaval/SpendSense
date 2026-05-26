import { useState } from 'react'
import { TrendingUp, Eye, EyeOff } from 'lucide-react'
import { login, register } from '../api/expenses'
import './Auth.css'

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async () => {
    setError('')
    if (!form.email || !form.password) return setError('Please fill all fields.')
    if (mode === 'register' && !form.name) return setError('Name is required.')
    setLoading(true)
    try {
      const fn = mode === 'login' ? login : register
      const res = await fn(form)
      onLogin(res.data.user, res.data.token)
    } catch (e) {
      setError(e.response?.data?.message || 'Something went wrong')
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-logo">
            <TrendingUp size={22} />
          </div>
          <span>SpendSense</span>
        </div>
        <div className="auth-hero">
          <h1>Take control of your finances</h1>
          <p>Track expenses, set budgets, and understand where your money goes — all in one place.</p>
        </div>
        <div className="auth-features">
          {['Smart expense tracking', 'Budget limits by category', 'Visual spending insights', 'Secure & private data'].map(f => (
            <div key={f} className="auth-feature">
              <div className="auth-feature-dot" />
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
            <p>{mode === 'login' ? 'Sign in to your account' : 'Start tracking your finances'}</p>
          </div>

          <div className="auth-tabs">
            <button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError('') }}>Sign In</button>
            <button className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setError('') }}>Register</button>
          </div>

          <div className="auth-fields">
            {mode === 'register' && (
              <div className="auth-field">
                <label>Full Name</label>
                <input name="name" value={form.name} onChange={handle} placeholder="Nishad Raval" />
              </div>
            )}
            <div className="auth-field">
              <label>Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handle} placeholder="you@example.com" />
            </div>
            <div className="auth-field">
              <label>Password</label>
              <div className="pw-wrap">
                <input name="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={handle} placeholder="Min. 6 characters"
                  onKeyDown={e => e.key === 'Enter' && submit()} />
                <button className="pw-toggle" onClick={() => setShowPw(s => !s)}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button className="auth-submit" onClick={submit} disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <p className="auth-switch">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>
              {mode === 'login' ? 'Register' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
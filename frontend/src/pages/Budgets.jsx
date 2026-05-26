import { useState, useEffect } from 'react'
import { Target, Plus, Trash2 } from 'lucide-react'
import { getBudgets, setBudget, getStats } from '../api/expenses'
import './Budgets.css'

const CATEGORIES = ['Food','Transport','Shopping','Entertainment','Health','Education','Bills','Other']
const MONTH = new Date().toISOString().slice(0,7)

export default function Budgets() {
  const [budgets, setBudgets] = useState([])
  const [stats, setStats] = useState(null)
  const [month, setMonth] = useState(MONTH)
  const [form, setForm] = useState({ category: 'Food', limit: '' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const [b, s] = await Promise.all([getBudgets({ month }), getStats({ month })])
    setBudgets(b.data.data)
    setStats(s.data.data)
  }

  useEffect(() => { load() }, [month])

  const getSpent = (cat) => stats?.categoryStats?.find(c => c._id === cat)?.total || 0

  const save = async () => {
    if (!form.limit) return
    setSaving(true)
    await setBudget({ ...form, month })
    setForm({ category: 'Food', limit: '' })
    load()
    setSaving(false)
  }

  const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')

  return (
    <div className="budgets">
      <div className="page-header">
        <div>
          <h1>Budgets</h1>
          <p className="page-sub">Set spending limits by category</p>
        </div>
        <input type="month" value={month} onChange={e => setMonth(e.target.value)} style={{ width: 160 }} />
      </div>

      <div className="budget-add-card">
        <h3><Plus size={16} /> Set a Budget</h3>
        <div className="budget-form">
          <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <input type="number" placeholder="Budget limit (₹)" value={form.limit} onChange={e => setForm(f => ({...f, limit: e.target.value}))} />
          <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Set Budget'}</button>
        </div>
      </div>

      {budgets.length === 0 ? (
        <div className="budget-empty">
          <Target size={48} strokeWidth={1} />
          <p>No budgets set for this month</p>
        </div>
      ) : (
        <div className="budget-grid">
          {budgets.map(b => {
            const spent = getSpent(b.category)
            const pct = Math.min((spent / b.limit) * 100, 100)
            const over = spent > b.limit
            return (
              <div key={b._id} className={`budget-card ${over ? 'over' : ''}`}>
                <div className="budget-card-header">
                  <span className="budget-cat">{b.category}</span>
                  <span className={`budget-status ${over ? 'over' : 'ok'}`}>{over ? 'Over budget' : 'On track'}</span>
                </div>
                <div className="budget-amounts">
                  <span className="spent">{fmt(spent)} spent</span>
                  <span className="limit">of {fmt(b.limit)}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: over ? 'var(--red)' : pct > 75 ? 'var(--amber)' : 'var(--accent)' }} />
                </div>
                <p className="budget-pct">{Math.round(pct)}% used · {fmt(Math.max(b.limit - spent, 0))} remaining</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
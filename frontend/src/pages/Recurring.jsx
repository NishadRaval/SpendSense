import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Pencil, RefreshCw, Pause, Play } from 'lucide-react'
import { getRecurring, createRecurring, updateRecurring, deleteRecurring, executeRecurring, getAccounts } from '../api/expenses'
import { format } from 'date-fns'
import './Recurring.css'

const CATEGORIES = ['Food','Transport','Shopping','Entertainment','Health','Education','Bills','Other']
const FREQUENCIES = ['Daily', 'Weekly', 'Monthly', 'Yearly']
const fadeUp = (delay = 0) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay } })

export default function Recurring() {
  const [data, setData] = useState([])
  const [accounts, setAccounts] = useState([])
  const [modal, setModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [executing, setExecuting] = useState(false)
  const [form, setForm] = useState({ title: '', amount: '', category: 'Bills', type: 'expense', account: '', frequency: 'Monthly', startDate: new Date().toISOString().split('T')[0], note: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async () => {
    const [r, a] = await Promise.all([getRecurring(), getAccounts()])
    setData(r.data.data)
    setAccounts(a.data.data)
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setEditData(null); setForm({ title: '', amount: '', category: 'Bills', type: 'expense', account: '', frequency: 'Monthly', startDate: new Date().toISOString().split('T')[0], note: '' }); setError(''); setModal(true) }
  const openEdit = (item) => { setEditData(item); setForm({ title: item.title, amount: item.amount, category: item.category, type: item.type, account: item.account?._id || '', frequency: item.frequency, startDate: item.startDate?.split('T')[0], note: item.note || '' }); setError(''); setModal(true) }

  const save = async () => {
    if (!form.title || !form.amount) return setError('Title and amount required')
    setLoading(true)
    try {
      if (editData) await updateRecurring(editData._id, form)
      else await createRecurring(form)
      load(); setModal(false)
    } catch (e) { setError(e.response?.data?.message || 'Something went wrong') }
    setLoading(false)
  }

  const remove = async (id) => { if (!confirm('Delete this recurring transaction?')) return; await deleteRecurring(id); load() }

  const toggleActive = async (item) => { await updateRecurring(item._id, { isActive: !item.isActive }); load() }

  const runExecute = async () => {
    setExecuting(true)
    const res = await executeRecurring()
    alert(`Executed ${res.data.executed} recurring transactions!`)
    load(); setExecuting(false)
  }

  const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')
  const freqColor = { Daily: '#dc2626', Weekly: '#d97706', Monthly: '#2563eb', Yearly: '#16a34a' }

  return (
    <div className="recurring">
      <motion.div className="page-header" {...fadeUp(0)}>
        <div>
          <h1>Recurring</h1>
          <p className="page-sub">Automate repetitive transactions</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={runExecute} disabled={executing}>
            <RefreshCw size={15} className={executing ? 'spinning' : ''} />
            {executing ? 'Running...' : 'Run Now'}
          </button>
          <button className="btn-primary" onClick={openAdd}><Plus size={15} /> Add Recurring</button>
        </div>
      </motion.div>

      {data.length === 0 ? (
        <motion.div className="empty-recurring" {...fadeUp(0.1)}>
          <RefreshCw size={48} strokeWidth={1} />
          <p>No recurring transactions yet</p>
          <button className="btn-primary" onClick={openAdd}><Plus size={15} /> Add your first</button>
        </motion.div>
      ) : (
        <div className="recurring-list">
          {data.map((item, i) => (
            <motion.div key={item._id} className={`recurring-card ${!item.isActive ? 'paused' : ''}`} {...fadeUp(0.1 + i * 0.05)}>
              <div className="recurring-card-left">
                <div className="recurring-freq-badge" style={{ background: freqColor[item.frequency] + '18', color: freqColor[item.frequency] }}>
                  {item.frequency}
                </div>
                <div>
                  <p className="recurring-title">{item.title}</p>
                  <p className="recurring-meta">{item.category} {item.account?.name ? `· ${item.account.name}` : ''}</p>
                  <p className="recurring-next">Next: {item.nextDate ? format(new Date(item.nextDate), 'dd MMM yyyy') : '—'}</p>
                </div>
              </div>
              <div className="recurring-card-right">
                <p className={`recurring-amount ${item.type}`}>{item.type === 'income' ? '+' : '−'}{fmt(item.amount)}</p>
                <div className="recurring-actions">
                  <button onClick={() => toggleActive(item)} title={item.isActive ? 'Pause' : 'Resume'}>
                    {item.isActive ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                  <button onClick={() => openEdit(item)}><Pencil size={14} /></button>
                  <button className="del" onClick={() => remove(item._id)}><Trash2 size={14} /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editData ? 'Edit Recurring' : 'New Recurring'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-type-toggle">
              {['expense','income'].map(t => <button key={t} className={form.type === t ? 'active' : ''} onClick={() => setForm(f => ({...f, type: t}))}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>)}
            </div>
            <div className="modal-fields">
              <div className="field-group"><label>Title</label><input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="e.g. Netflix Subscription" /></div>
              <div className="field-row">
                <div className="field-group"><label>Amount (₹)</label><input type="number" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} placeholder="0.00" /></div>
                <div className="field-group"><label>Frequency</label>
                  <select value={form.frequency} onChange={e => setForm(f => ({...f, frequency: e.target.value}))}>
                    {FREQUENCIES.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
              </div>
              <div className="field-row">
                <div className="field-group"><label>Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="field-group"><label>Start Date</label><input type="date" value={form.startDate} onChange={e => setForm(f => ({...f, startDate: e.target.value}))} /></div>
              </div>
              {accounts.length > 0 && <div className="field-group"><label>Account (optional)</label>
                <select value={form.account} onChange={e => setForm(f => ({...f, account: e.target.value}))}>
                  <option value="">No account</option>
                  {accounts.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                </select>
              </div>}
              <div className="field-group"><label>Note (optional)</label><input value={form.note} onChange={e => setForm(f => ({...f, note: e.target.value}))} placeholder="Any details..." /></div>
            </div>
            {error && <p className="modal-error">{error}</p>}
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn-save" onClick={save} disabled={loading}>{loading ? 'Saving...' : editData ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { createExpense, updateExpense } from '../api/expenses'
import './ExpenseModal.css'

const CATEGORIES = ['Food','Transport','Shopping','Entertainment','Health','Education','Bills','Other']

export default function ExpenseModal({ open, onClose, onSaved, editData }) {
  const [form, setForm] = useState({ title:'', amount:'', category:'Food', type:'expense', note:'', date:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title,
        amount: editData.amount,
        category: editData.category,
        type: editData.type,
        note: editData.note || '',
        date: editData.date?.split('T')[0] || ''
      })
    } else {
      setForm({ title:'', amount:'', category:'Food', type:'expense', note:'', date: new Date().toISOString().split('T')[0] })
    }
    setError('')
  }, [editData, open])

  if (!open) return null

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async () => {
    if (!form.title || !form.amount) return setError('Title and amount are required.')
    setLoading(true)
    try {
      if (editData) await updateExpense(editData._id, form)
      else await createExpense(form)
      onSaved()
      onClose()
    } catch (e) {
      setError(e.response?.data?.message || 'Something went wrong')
    }
    setLoading(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{editData ? 'Edit Entry' : 'New Entry'}</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-type-toggle">
          {['expense','income'].map(t => (
            <button key={t} className={form.type === t ? 'active' : ''} onClick={() => setForm(f => ({...f, type: t}))}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="modal-fields">
          <div className="field-group">
            <label>Title</label>
            <input name="title" value={form.title} onChange={handle} placeholder="e.g. Lunch at cafe" />
          </div>
          <div className="field-row">
            <div className="field-group">
              <label>Amount (₹)</label>
              <input name="amount" type="number" value={form.amount} onChange={handle} placeholder="0.00" />
            </div>
            <div className="field-group">
              <label>Date</label>
              <input name="date" type="date" value={form.date} onChange={handle} />
            </div>
          </div>
          <div className="field-group">
            <label>Category</label>
            <select name="category" value={form.category} onChange={handle}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field-group">
            <label>Note (optional)</label>
            <textarea name="note" value={form.note} onChange={handle} placeholder="Any extra details..." rows={2} />
          </div>
        </div>

        {error && <p className="modal-error">{error}</p>}

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={submit} disabled={loading}>
            {loading ? 'Saving...' : editData ? 'Update' : 'Add Entry'}
          </button>
        </div>
      </div>
    </div>
  )
}
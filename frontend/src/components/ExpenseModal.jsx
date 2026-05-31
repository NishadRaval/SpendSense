import { useState, useEffect } from 'react'
import { X, Sparkles } from 'lucide-react'
import { createExpense, updateExpense } from '../api/expenses'
import './ExpenseModal.css'

const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Education', 'Bills', 'Other']
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Rental', 'Other']

// Keyword → category mapping for auto-detect
const KEYWORD_MAP = {
  Food: ['lunch', 'dinner', 'breakfast', 'food', 'eat', 'restaurant', 'cafe', 'coffee', 'chai', 'snack', 'pizza', 'burger', 'biryani', 'hotel', 'swiggy', 'zomato', 'grocery', 'vegetables', 'fruits', 'milk', 'bread'],
  Transport: ['uber', 'ola', 'auto', 'rickshaw', 'bus', 'train', 'metro', 'taxi', 'petrol', 'diesel', 'fuel', 'flight', 'ticket', 'travel', 'parking', 'toll', 'rapido'],
  Shopping: ['amazon', 'flipkart', 'clothes', 'shirt', 'shoes', 'dress', 'shopping', 'mall', 'meesho', 'myntra', 'ajio', 'bag', 'watch', 'mobile', 'phone'],
  Entertainment: ['netflix', 'prime', 'hotstar', 'spotify', 'movie', 'cinema', 'game', 'cricket', 'football', 'turf', 'gym', 'concert', 'party', 'club', 'bar', 'pubg', 'steam', 'playstation'],
  Health: ['doctor', 'hospital', 'medicine', 'pharmacy', 'medical', 'clinic', 'apollo', 'health', 'checkup', 'test', 'lab', 'dentist', 'eye', 'spectacles'],
  Education: ['fees', 'tuition', 'course', 'book', 'college', 'school', 'coaching', 'udemy', 'coursera', 'class', 'study', 'exam', 'stationery'],
  Bills: ['electricity', 'wifi', 'internet', 'recharge', 'mobile', 'dth', 'water', 'gas', 'rent', 'emi', 'insurance', 'credit card', 'loan', 'subscription'],
  Salary: ['salary', 'stipend', 'paycheck', 'pay', 'wages', 'ctc', 'income'],
  Freelance: ['freelance', 'project', 'client', 'invoice', 'contract', 'gig', 'work'],
  Business: ['business', 'profit', 'sale', 'revenue', 'earning', 'shop', 'store'],
  Investment: ['dividend', 'interest', 'returns', 'mutual fund', 'sip', 'stocks', 'fd', 'rd', 'crypto'],
  Gift: ['gift', 'bonus', 'reward', 'cashback', 'prize', 'birthday', 'diwali', 'eid'],
  Rental: ['rent received', 'rental', 'tenant', 'property income'],
}

const detectCategory = (title, type) => {
  if (!title || title.length < 3) return null
  const lower = title.toLowerCase()
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  for (const [cat, keywords] of Object.entries(KEYWORD_MAP)) {
    if (!categories.includes(cat)) continue
    if (keywords.some(k => lower.includes(k))) return cat
  }
  return null
}

export default function ExpenseModal({ open, onClose, onSaved, editData }) {
  const [form, setForm] = useState({ title: '', amount: '', category: 'Food', type: 'expense', note: '', date: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [suggestion, setSuggestion] = useState(null)

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

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
      const defaultCat = 'Food'
      setForm({ title: '', amount: '', category: defaultCat, type: 'expense', note: '', date: new Date().toISOString().split('T')[0] })
    }
    setError('')
    setSuggestion(null)
  }, [editData, open])

  // Switch categories when type changes
  useEffect(() => {
    if (form.type === 'income' && EXPENSE_CATEGORIES.includes(form.category)) {
      setForm(f => ({ ...f, category: 'Salary' }))
    } else if (form.type === 'expense' && INCOME_CATEGORIES.includes(form.category)) {
      setForm(f => ({ ...f, category: 'Food' }))
    }
    setSuggestion(null)
  }, [form.type])

  const handleTitleChange = (val) => {
    setForm(f => ({ ...f, title: val }))
    const detected = detectCategory(val, form.type)
    if (detected && detected !== form.category) {
      setSuggestion(detected)
    } else {
      setSuggestion(null)
    }
  }

  const applySuggestion = () => {
    setForm(f => ({ ...f, category: suggestion }))
    setSuggestion(null)
  }

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

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{editData ? 'Edit Entry' : 'New Entry'}</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-type-toggle">
          {['expense', 'income'].map(t => (
            <button key={t} className={form.type === t ? 'active' : ''}
              onClick={() => setForm(f => ({ ...f, type: t }))}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="modal-fields">
          <div className="field-group">
            <label>Title</label>
            <input
              name="title"
              value={form.title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder={form.type === 'income' ? 'e.g. Monthly Salary' : 'e.g. Lunch at cafe'}
            />
            {suggestion && (
              <div className="category-suggestion" onClick={applySuggestion}>
                <Sparkles size={13} />
                Auto-detected: <strong>{suggestion}</strong> — tap to apply
              </div>
            )}
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
            <label>{form.type === 'income' ? 'Income Source' : 'Category'}</label>
            <div className="category-grid">
              {categories.map(c => (
                <button
                  key={c}
                  className={`cat-chip ${form.category === c ? 'active' : ''}`}
                  onClick={() => setForm(f => ({ ...f, category: c }))}
                >
                  {getCatEmoji(c)} {c}
                </button>
              ))}
            </div>
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

function getCatEmoji(cat) {
  const map = {
    Food: '🍽️', Transport: '🚗', Shopping: '🛍️', Entertainment: '🎮',
    Health: '💊', Education: '📚', Bills: '💡', Other: '📦',
    Salary: '💼', Freelance: '💻', Business: '🏢', Investment: '📈',
    Gift: '🎁', Rental: '🏠'
  }
  return map[cat] || '📦'
}
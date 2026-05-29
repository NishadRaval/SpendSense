import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Pencil, CheckCircle, AlertCircle, Clock, Bell } from 'lucide-react'
import { getBills, createBill, updateBill, markBillPaid, deleteBill } from '../api/expenses'
import { format, differenceInDays } from 'date-fns'
import './Bills.css'

const CATEGORIES = ['Electricity','Internet','Credit Card','Insurance','Rent','Loan EMI','Subscription','Other']
const fadeUp = (delay = 0) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay } })

export default function Bills() {
  const [bills, setBills] = useState([])
  const [modal, setModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [filter, setFilter] = useState('All')
  const [form, setForm] = useState({ title: '', amount: '', category: 'Other', dueDate: '', reminderDays: 3, isRecurring: false, recurringMonths: 1, note: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async () => { const res = await getBills(); setBills(res.data.data) }
  useEffect(() => { load() }, [])

  const openAdd = () => { setEditData(null); setForm({ title: '', amount: '', category: 'Other', dueDate: '', reminderDays: 3, isRecurring: false, recurringMonths: 1, note: '' }); setError(''); setModal(true) }
  const openEdit = (bill) => { setEditData(bill); setForm({ title: bill.title, amount: bill.amount, category: bill.category, dueDate: bill.dueDate?.split('T')[0], reminderDays: bill.reminderDays, isRecurring: bill.isRecurring, recurringMonths: bill.recurringMonths, note: bill.note || '' }); setError(''); setModal(true) }

  const save = async () => {
    if (!form.title || !form.amount || !form.dueDate) return setError('Title, amount and due date required')
    setLoading(true)
    try {
      if (editData) await updateBill(editData._id, form)
      else await createBill(form)
      load(); setModal(false)
    } catch (e) { setError(e.response?.data?.message || 'Something went wrong') }
    setLoading(false)
  }

  const pay = async (id) => { await markBillPaid(id); load() }
  const remove = async (id) => { if (!confirm('Delete this bill?')) return; await deleteBill(id); load() }

  const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')

  const getDaysLeft = (dueDate) => differenceInDays(new Date(dueDate), new Date())

  const statusColor = { Pending: 'var(--amber)', Paid: 'var(--green)', Overdue: 'var(--red)' }
  const statusBg = { Pending: 'var(--amberbg)', Paid: 'var(--greenbg)', Overdue: 'var(--redbg)' }

  const filtered = filter === 'All' ? bills : bills.filter(b => b.status === filter)

  const pending = bills.filter(b => b.status === 'Pending').length
  const overdue = bills.filter(b => b.status === 'Overdue').length
  const paid = bills.filter(b => b.status === 'Paid').length
  const totalPending = bills.filter(b => b.status !== 'Paid').reduce((s, b) => s + b.amount, 0)

  return (
    <div className="bills">
      <motion.div className="page-header" {...fadeUp(0)}>
        <div>
          <h1>Bills</h1>
          <p className="page-sub">Track and manage your bill payments</p>
        </div>
        <button className="btn-primary" onClick={openAdd}><Plus size={15} /> Add Bill</button>
      </motion.div>

      <div className="bills-stats-row">
        {[
          { label: 'Pending', value: pending, color: 'var(--amber)', bg: 'var(--amberbg)' },
          { label: 'Overdue', value: overdue, color: 'var(--red)', bg: 'var(--redbg)' },
          { label: 'Paid', value: paid, color: 'var(--green)', bg: 'var(--greenbg)' },
          { label: 'Total Due', value: fmt(totalPending), color: 'var(--black)', bg: 'var(--bg3)' },
        ].map((s, i) => (
          <motion.div key={s.label} className="bill-stat-card" {...fadeUp(0.1 + i * 0.05)}>
            <p className="bill-stat-label">{s.label}</p>
            <p className="bill-stat-value" style={{ color: s.color }}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="bills-filter-row">
        {['All', 'Pending', 'Overdue', 'Paid'].map(f => (
          <button key={f} className={`pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <motion.div className="empty-recurring" {...fadeUp(0.2)}>
          <Bell size={48} strokeWidth={1} />
          <p>No bills found</p>
          <button className="btn-primary" onClick={openAdd}><Plus size={15} /> Add a bill</button>
        </motion.div>
      ) : (
        <div className="bills-list">
          {filtered.map((bill, i) => {
            const daysLeft = getDaysLeft(bill.dueDate)
            return (
              <motion.div key={bill._id} className={`bill-card ${bill.status.toLowerCase()}`} {...fadeUp(0.1 + i * 0.04)}>
                <div className="bill-card-left">
                  <div className="bill-cat-icon">{bill.category[0]}</div>
                  <div>
                    <p className="bill-title">{bill.title}</p>
                    <p className="bill-meta">{bill.category} · Due {format(new Date(bill.dueDate), 'dd MMM yyyy')}</p>
                    {bill.status !== 'Paid' && (
                      <p className="bill-days" style={{ color: daysLeft < 0 ? 'var(--red)' : daysLeft <= 3 ? 'var(--amber)' : 'var(--gray3)' }}>
                        {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : daysLeft === 0 ? 'Due today!' : `${daysLeft} days left`}
                      </p>
                    )}
                  </div>
                </div>
                <div className="bill-card-right">
                  <p className="bill-amount">{fmt(bill.amount)}</p>
                  <span className="bill-status-badge" style={{ color: statusColor[bill.status], background: statusBg[bill.status] }}>
                    {bill.status}
                  </span>
                  <div className="bill-actions">
                    {bill.status !== 'Paid' && (
                      <button className="pay-btn" onClick={() => pay(bill._id)} title="Mark as Paid">
                        <CheckCircle size={14} />
                      </button>
                    )}
                    <button onClick={() => openEdit(bill)}><Pencil size={14} /></button>
                    <button className="del" onClick={() => remove(bill._id)}><Trash2 size={14} /></button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editData ? 'Edit Bill' : 'New Bill'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-fields">
              <div className="field-group"><label>Bill Name</label><input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="e.g. Electricity Bill" /></div>
              <div className="field-row">
                <div className="field-group"><label>Amount (₹)</label><input type="number" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} placeholder="0.00" /></div>
                <div className="field-group"><label>Due Date</label><input type="date" value={form.dueDate} onChange={e => setForm(f => ({...f, dueDate: e.target.value}))} /></div>
              </div>
              <div className="field-row">
                <div className="field-group"><label>Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="field-group"><label>Remind (days before)</label>
                  <select value={form.reminderDays} onChange={e => setForm(f => ({...f, reminderDays: Number(e.target.value)}))}>
                    {[1,3,7,14].map(d => <option key={d} value={d}>{d} day{d > 1 ? 's' : ''} before</option>)}
                  </select>
                </div>
              </div>
              <label className="checkbox-label">
                <input type="checkbox" checked={form.isRecurring} onChange={e => setForm(f => ({...f, isRecurring: e.target.checked}))} />
                This is a recurring bill
              </label>
              {form.isRecurring && (
                <div className="field-group" style={{ marginTop: 8 }}>
                  <label>Repeat every (months)</label>
                  <select value={form.recurringMonths} onChange={e => setForm(f => ({...f, recurringMonths: Number(e.target.value)}))}>
                    {[1,2,3,6,12].map(m => <option key={m} value={m}>{m} month{m > 1 ? 's' : ''}</option>)}
                  </select>
                </div>
              )}
              <div className="field-group"><label>Note (optional)</label><input value={form.note} onChange={e => setForm(f => ({...f, note: e.target.value}))} placeholder="Any details..." /></div>
            </div>
            {error && <p className="modal-error">{error}</p>}
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn-save" onClick={save} disabled={loading}>{loading ? 'Saving...' : editData ? 'Update' : 'Add Bill'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
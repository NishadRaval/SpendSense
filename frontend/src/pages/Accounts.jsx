import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, ArrowLeftRight, Wallet } from 'lucide-react'
import { getAccounts, createAccount, updateAccount, deleteAccount, transferFunds } from '../api/expenses'
import './Accounts.css'

const ACCOUNT_TYPES = ['Cash', 'Bank', 'UPI', 'Credit Card', 'Debit Card', 'Other']
const BANK_NAMES = ['HDFC', 'Axis', 'SBI', 'ICICI', 'Kotak', 'PNB', 'BOB', 'Canara', 'Yes Bank', 'Other']
const COLORS = ['#0a0a0a', '#2563eb', '#16a34a', '#dc2626', '#d97706', '#7c3aed', '#db2777', '#0891b2']

const fadeUp = (delay = 0) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay } })

export default function Accounts() {
  const [accounts, setAccounts] = useState([])
  const [netWorth, setNetWorth] = useState(0)
  const [modal, setModal] = useState(false)
  const [transferModal, setTransferModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [form, setForm] = useState({ name: '', type: 'Cash', bankName: '', balance: '', color: '#0a0a0a', isDefault: false })
  const [transfer, setTransfer] = useState({ fromAccount: '', toAccount: '', amount: '', note: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    const res = await getAccounts()
    setAccounts(res.data.data)
    setNetWorth(res.data.totalNetWorth)
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setEditData(null); setForm({ name: '', type: 'Cash', bankName: '', balance: '', color: '#0a0a0a', isDefault: false }); setError(''); setModal(true) }
  const openEdit = (acc) => { setEditData(acc); setForm({ name: acc.name, type: acc.type, bankName: acc.bankName || '', balance: acc.balance, color: acc.color, isDefault: acc.isDefault }); setError(''); setModal(true) }

  const save = async () => {
    if (!form.name) return setError('Account name is required')
    setLoading(true)
    try {
      if (editData) await updateAccount(editData._id, form)
      else await createAccount(form)
      load(); setModal(false)
    } catch (e) { setError(e.response?.data?.message || 'Something went wrong') }
    setLoading(false)
  }

  const remove = async (id) => {
    if (!confirm('Delete this account?')) return
    await deleteAccount(id); load()
  }

  const doTransfer = async () => {
    if (!transfer.fromAccount || !transfer.toAccount || !transfer.amount) return setError('All fields required')
    if (transfer.fromAccount === transfer.toAccount) return setError('Cannot transfer to same account')
    setLoading(true)
    try {
      await transferFunds(transfer)
      load(); setTransferModal(false); setTransfer({ fromAccount: '', toAccount: '', amount: '', note: '' })
    } catch (e) { setError(e.response?.data?.message || 'Something went wrong') }
    setLoading(false)
  }

  const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')

  const typeIcon = (type) => {
    const icons = { Cash: '💵', Bank: '🏦', UPI: '📱', 'Credit Card': '💳', 'Debit Card': '💳', Other: '💰' }
    return icons[type] || '💰'
  }

  return (
    <div className="accounts">
      <motion.div className="page-header" {...fadeUp(0)}>
        <div>
          <h1>Accounts</h1>
          <p className="page-sub">Manage your financial accounts</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={() => { setError(''); setTransferModal(true) }}>
            <ArrowLeftRight size={15} /> Transfer
          </button>
          <button className="btn-primary" onClick={openAdd}>
            <Plus size={15} /> Add Account
          </button>
        </div>
      </motion.div>

      <motion.div className="net-worth-card" {...fadeUp(0.1)}>
        <div className="net-worth-label">TOTAL NET WORTH</div>
        <div className="net-worth-value">{fmt(netWorth)}</div>
        <div className="net-worth-sub">{accounts.length} account{accounts.length !== 1 ? 's' : ''}</div>
      </motion.div>

      <div className="accounts-grid">
        {accounts.map((acc, i) => (
          <motion.div key={acc._id} className="account-card" {...fadeUp(0.15 + i * 0.05)}
            style={{ '--acc-color': acc.color }}>
            <div className="account-card-top">
              <div className="account-icon" style={{ background: acc.color + '18', color: acc.color }}>
                {typeIcon(acc.type)}
              </div>
              <div className="account-actions">
                <button onClick={() => openEdit(acc)}><Pencil size={14} /></button>
                <button className="del" onClick={() => remove(acc._id)}><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="account-name">{acc.name}</div>
            <div className="account-type">{acc.bankName ? `${acc.bankName} · ` : ''}{acc.type}</div>
            <div className="account-balance" style={{ color: acc.balance < 0 ? 'var(--red)' : acc.color }}>
              {fmt(acc.balance)}
            </div>
            {acc.isDefault && <span className="account-default-badge">Default</span>}
          </motion.div>
        ))}
        <motion.button className="account-add-card" onClick={openAdd} {...fadeUp(0.15 + accounts.length * 0.05)}>
          <Plus size={24} />
          <span>Add Account</span>
        </motion.button>
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editData ? 'Edit Account' : 'New Account'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-fields">
              <div className="field-group">
                <label>Account Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. HDFC Savings" />
              </div>
              <div className="field-row">
                <div className="field-group">
                  <label>Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    {ACCOUNT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="field-group">
                  <label>Opening Balance (₹)</label>
                  <input type="number" value={form.balance} onChange={e => setForm(f => ({ ...f, balance: e.target.value }))} placeholder="0" />
                </div>
              </div>
              {['Bank', 'UPI'].includes(form.type) && (
                <div className="field-group">
                  <label>Bank / Provider Name</label>
                  <select value={form.bankName} onChange={e => setForm(f => ({ ...f, bankName: e.target.value }))}>
                    <option value="">Select...</option>
                    {BANK_NAMES.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              )}
              <div className="field-group">
                <label>Color</label>
                <div className="color-picker">
                  {COLORS.map(c => (
                    <button key={c} className={`color-dot ${form.color === c ? 'active' : ''}`}
                      style={{ background: c }} onClick={() => setForm(f => ({ ...f, color: c }))} />
                  ))}
                </div>
              </div>
              <label className="checkbox-label">
                <input type="checkbox" checked={form.isDefault} onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))} />
                Set as default account
              </label>
            </div>
            {error && <p className="modal-error">{error}</p>}
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn-save" onClick={save} disabled={loading}>{loading ? 'Saving...' : editData ? 'Update' : 'Create Account'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {transferModal && (
        <div className="modal-overlay" onClick={() => setTransferModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Transfer Funds</h3>
              <button className="modal-close" onClick={() => setTransferModal(false)}>✕</button>
            </div>
            <div className="modal-fields">
              <div className="field-group">
                <label>From Account</label>
                <select value={transfer.fromAccount} onChange={e => setTransfer(f => ({ ...f, fromAccount: e.target.value }))}>
                  <option value="">Select account...</option>
                  {accounts.map(a => <option key={a._id} value={a._id}>{a.name} — {fmt(a.balance)}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label>To Account</label>
                <select value={transfer.toAccount} onChange={e => setTransfer(f => ({ ...f, toAccount: e.target.value }))}>
                  <option value="">Select account...</option>
                  {accounts.map(a => <option key={a._id} value={a._id}>{a.name} — {fmt(a.balance)}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label>Amount (₹)</label>
                <input type="number" value={transfer.amount} onChange={e => setTransfer(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" />
              </div>
              <div className="field-group">
                <label>Note (optional)</label>
                <input value={transfer.note} onChange={e => setTransfer(f => ({ ...f, note: e.target.value }))} placeholder="Transfer note..." />
              </div>
            </div>
            {error && <p className="modal-error">{error}</p>}
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setTransferModal(false)}>Cancel</button>
              <button className="btn-save" onClick={doTransfer} disabled={loading}>{loading ? 'Transferring...' : 'Transfer'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
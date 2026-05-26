import { useState, useEffect } from 'react'
import { Plus, Search, Pencil, Trash2, Filter } from 'lucide-react'
import { getExpenses, deleteExpense } from '../api/expenses'
import ExpenseModal from '../components/ExpenseModal'
import { format } from 'date-fns'
import './Transactions.css'

const CATEGORIES = ['All','Food','Transport','Shopping','Entertainment','Health','Education','Bills','Other']
const MONTH = new Date().toISOString().slice(0,7)

export default function Transactions() {
  const [data, setData] = useState([])
  const [modal, setModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('All')
  const [type, setType] = useState('all')
  const [month, setMonth] = useState(MONTH)

  const load = async () => {
    const params = { month }
    if (search) params.search = search
    if (cat !== 'All') params.category = cat
    if (type !== 'all') params.type = type
    const res = await getExpenses(params)
    setData(res.data.data)
  }

  useEffect(() => { load() }, [search, cat, type, month])

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return
    await deleteExpense(id)
    load()
  }

  const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN')

  return (
    <div className="transactions">
      <div className="page-header">
        <div>
          <h1>Transactions</h1>
          <p className="page-sub">{data.length} entries found</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditData(null); setModal(true) }}>
          <Plus size={16} /> Add Entry
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-wrap">
          <Search size={15} className="search-icon" />
          <input placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)} className="search-input" />
        </div>
        <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="month-input" />
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="all">All Types</option>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>

      <div className="cat-pills">
        {CATEGORIES.map(c => (
          <button key={c} className={`pill ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>

      <div className="tx-table-wrap">
        {data.length === 0 ? (
          <div className="empty-state">
            <Filter size={40} strokeWidth={1} />
            <p>No transactions found</p>
          </div>
        ) : (
          <table className="tx-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Type</th>
                <th>Date</th>
                <th>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.map(e => (
                <tr key={e._id}>
                  <td>
                    <p className="tx-title">{e.title}</p>
                    {e.note && <p className="tx-note">{e.note}</p>}
                  </td>
                  <td><span className="cat-tag">{e.category}</span></td>
                  <td><span className={`type-tag ${e.type}`}>{e.type}</span></td>
                  <td className="tx-date">{format(new Date(e.date), 'dd MMM yyyy')}</td>
                  <td className={`tx-amount ${e.type}`}>{e.type === 'income' ? '+' : '-'}{fmt(e.amount)}</td>
                  <td>
                    <div className="tx-actions">
                      <button onClick={() => { setEditData(e); setModal(true) }}><Pencil size={14} /></button>
                      <button className="del" onClick={() => handleDelete(e._id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ExpenseModal open={modal} onClose={() => setModal(false)} onSaved={load} editData={editData} />
    </div>
  )
}
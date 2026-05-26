import { useState, useEffect } from 'react'
import { Wallet, TrendingDown, TrendingUp, PiggyBank, Plus } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { getStats, getExpenses } from '../api/expenses'
import StatCard from '../components/StatCard'
import ExpenseModal from '../components/ExpenseModal'
import { format } from 'date-fns'
import './Dashboard.css'

const COLORS = ['#3b82f6','#22c55e','#ef4444','#f59e0b','#6366f1','#ec4899','#14b8a6','#8b5cf6']
const MONTH = new Date().toISOString().slice(0,7)

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#fff', border: '1px solid #e8eeff', borderRadius: 10, padding: '10px 14px', fontSize: 13, boxShadow: '0 4px 16px rgba(59,130,246,0.12)' }}>
        <p style={{ color: '#94a3b8', marginBottom: 3, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{payload[0].payload._id || payload[0].name}</p>
        <p style={{ color: '#0f172a', fontWeight: 800, fontSize: 15 }}>₹{Number(payload[0].value).toLocaleString('en-IN')}</p>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [modal, setModal] = useState(false)
  const [month] = useState(MONTH)

  const load = async () => {
    const [s, r] = await Promise.all([getStats({ month }), getExpenses({ month })])
    setStats(s.data.data)
    setRecent(r.data.data.slice(0, 7))
  }

  useEffect(() => { load() }, [])

  const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')

  const catColors = {
    income: { bg: '#f0fdf4', color: '#16a34a' },
    expense: { bg: '#fff1f2', color: '#dc2626' },
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-sub">{format(new Date(), 'MMMM yyyy')} · Financial overview</p>
        </div>
        <button className="btn-primary" onClick={() => setModal(true)}>
          <Plus size={15} /> Add Entry
        </button>
      </div>

      <div className="stats-grid">
        <StatCard label="Net Balance" value={fmt(stats?.balance)} icon={Wallet} color="#3b82f6" />
        <StatCard label="Total Income" value={fmt(stats?.totalIncome)} icon={TrendingUp} color="#16a34a" />
        <StatCard label="Total Expenses" value={fmt(stats?.totalExpense)} icon={TrendingDown} color="#dc2626" />
        <StatCard label="Categories" value={stats?.categoryStats?.length || 0} icon={PiggyBank} color="#d97706" sub="active this month" />
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <h3>Spending by Category</h3>
          {stats?.categoryStats?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie data={stats.categoryStats} dataKey="total" nameKey="_id" cx="50%" cy="50%" innerRadius={52} outerRadius={82} paddingAngle={3} strokeWidth={0}>
                    {stats.categoryStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend">
                {stats.categoryStats.map((c, i) => (
                  <div key={c._id} className="legend-item">
                    <span className="legend-dot" style={{ background: COLORS[i % COLORS.length] }} />
                    <span>{c._id}</span>
                    <span className="legend-val">{fmt(c.total)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div className="empty-chart">No expenses this month</div>}
        </div>

        <div className="chart-card">
          <h3>Category Breakdown</h3>
          {stats?.categoryStats?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.categoryStats} margin={{ top: 8, right: 8, left: -10, bottom: 0 }} barSize={34}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="_id" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'Plus Jakarta Sans', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'Plus Jakarta Sans' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59,130,246,0.04)', radius: 8 }} />
                <Bar dataKey="total" radius={[8,8,0,0]}>
                  {stats.categoryStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="empty-chart">No data to display</div>}
        </div>
      </div>

      <div className="recent-card">
        <div className="recent-card-header">
          <h3>Recent Transactions</h3>
          <span className="recent-count">{recent.length} entries</span>
        </div>
        {recent.length === 0 ? (
          <div className="empty-chart">No transactions yet — add your first entry</div>
        ) : (
          <div className="recent-list">
            {recent.map(e => {
              const c = catColors[e.type]
              return (
                <div key={e._id} className="recent-item">
                  <div className="recent-cat-badge" style={{ background: c.bg, color: c.color }}>
                    {e.category[0]}
                  </div>
                  <div>
                    <p className="recent-title">{e.title}</p>
                    <p className="recent-meta">{e.category} · {format(new Date(e.date), 'dd MMM yyyy')}</p>
                  </div>
                  <p className={`recent-amount ${e.type}`}>
                    {e.type === 'income' ? '+' : '−'}{fmt(e.amount)}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <ExpenseModal open={modal} onClose={() => setModal(false)} onSaved={load} />
    </div>
  )
}
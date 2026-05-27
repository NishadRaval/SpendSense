import { useState, useEffect } from 'react'
import { Wallet, TrendingDown, TrendingUp, PiggyBank, Plus } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend } from 'recharts'
import { motion } from 'framer-motion'
import { getStats, getExpenses, getMonthlyTrend } from '../api/expenses'
import StatCard from '../components/StatCard'
import ExpenseModal from '../components/ExpenseModal'
import { format } from 'date-fns'
import './Dashboard.css'

const COLORS = ['#0a0a0a','#404040','#737373','#a3a3a3','#d4d4d4','#171717','#525252','#262626']
const MONTH = new Date().toISOString().slice(0,7)

const getHour = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 13, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
        <p style={{ color: 'var(--gray2)', marginBottom: 3, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{payload[0].payload._id || payload[0].name}</p>
        <p style={{ color: 'var(--black)', fontWeight: 800, fontSize: 15 }}>₹{Number(payload[0].value).toLocaleString('en-IN')}</p>
      </div>
    )
  }
  return null
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay }
})

export default function Dashboard({ user }) {
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [trend, setTrend] = useState([])
  const [modal, setModal] = useState(false)
  const [month] = useState(MONTH)

  const load = async () => {
    const [s, r, t] = await Promise.all([
      getStats({ month }),
      getExpenses({ month }),
      getMonthlyTrend()
    ])
    setStats(s.data.data)
    setRecent(r.data.data.slice(0, 6))
    setTrend(t.data.data)
  }

  useEffect(() => { load() }, [])

  const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')

  return (
    <div className="dashboard">
      <motion.div className="page-header" {...fadeUp(0)}>
        <div>
          <p className="page-greeting">{getHour()}, {user?.name?.split(' ')[0]} 👋</p>
          <h1>Dashboard</h1>
          <p className="page-sub">{format(new Date(), 'EEEE, dd MMMM yyyy')}</p>
        </div>
        <button className="btn-primary" onClick={() => setModal(true)}>
          <Plus size={15} /> Add Entry
        </button>
      </motion.div>

      <div className="stats-grid">
        <StatCard index={0} label="Net Balance" value={fmt(stats?.balance)} icon={Wallet} />
        <StatCard index={1} label="Total Income" value={fmt(stats?.totalIncome)} icon={TrendingUp} />
        <StatCard index={2} label="Total Expenses" value={fmt(stats?.totalExpense)} icon={TrendingDown} />
        <StatCard index={3} label="Categories" value={stats?.categoryStats?.length || 0} icon={PiggyBank} sub="active this month" />
      </div>

      <div className="charts-row">
        <motion.div className="chart-card" {...fadeUp(0.3)}>
          <div className="chart-card-header">
            <h3>Spending by Category</h3>
          </div>
          {stats?.categoryStats?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={stats.categoryStats} dataKey="total" nameKey="_id" cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={3} strokeWidth={0}>
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
        </motion.div>

        <motion.div className="chart-card" {...fadeUp(0.35)}>
          <div className="chart-card-header"><h3>Category Breakdown</h3></div>
          {stats?.categoryStats?.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.categoryStats} margin={{ top: 8, right: 8, left: -10, bottom: 0 }} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="_id" tick={{ fill: 'var(--gray3)', fontSize: 11, fontFamily: 'Inter', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--gray3)', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)', radius: 8 }} />
                <Bar dataKey="total" radius={[6,6,0,0]}>
                  {stats.categoryStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="empty-chart">No data to display</div>}
        </motion.div>
      </div>

      {trend.length > 0 && (
        <motion.div className="chart-card" style={{ marginBottom: 18 }} {...fadeUp(0.45)}>
          <div className="chart-card-header"><h3>6-Month Trend</h3></div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trend} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'var(--gray3)', fontSize: 11, fontFamily: 'Inter', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--gray3)', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600, color: 'var(--gray2)' }} />
              <Line type="monotone" dataKey="income" stroke="var(--green)" strokeWidth={2.5} dot={{ fill: 'var(--green)', r: 4 }} name="Income" />
              <Line type="monotone" dataKey="expense" stroke="var(--red)" strokeWidth={2.5} dot={{ fill: 'var(--red)', r: 4 }} name="Expenses" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      <motion.div className="recent-card" {...fadeUp(0.4)}>
        <div className="recent-card-header">
          <h3>Recent Transactions</h3>
          <span className="recent-count">{recent.length} entries</span>
        </div>
        {recent.length === 0 ? (
          <div className="empty-chart">No transactions yet — add your first entry</div>
        ) : (
          <div className="recent-list">
            {recent.map((e, i) => (
              <motion.div key={e._id} className="recent-item"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.06 }}
              >
                <div className="recent-cat-badge">{e.category[0]}</div>
                <div>
                  <p className="recent-title">{e.title}</p>
                  <p className="recent-meta">{e.category} · {format(new Date(e.date), 'dd MMM yyyy')}</p>
                </div>
                <p className={`recent-amount ${e.type}`}>
                  {e.type === 'income' ? '+' : '−'}{fmt(e.amount)}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <ExpenseModal open={modal} onClose={() => setModal(false)} onSaved={load} />
    </div>
  )
}
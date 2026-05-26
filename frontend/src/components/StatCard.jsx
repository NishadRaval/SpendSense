import './StatCard.css'

const topColors = {
  '#3b82f6': 'linear-gradient(90deg,#3b82f6,#60a5fa)',
  '#16a34a': 'linear-gradient(90deg,#16a34a,#4ade80)',
  '#dc2626': 'linear-gradient(90deg,#dc2626,#fb7185)',
  '#d97706': 'linear-gradient(90deg,#d97706,#fbbf24)',
}

export default function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="stat-card" style={{ '--top-grad': topColors[color] || color }}>
      <style>{`.stat-card:hover::before { background: var(--top-grad); }`}</style>
      <div className="stat-icon" style={{ background: `${color}14`, color }}>
        <Icon size={19} />
      </div>
      <div>
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
        {sub && <p className="stat-sub">{sub}</p>}
      </div>
    </div>
  )
}
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import './StatCard.css'

function CountUp({ value }) {
  const [display, setDisplay] = useState(0)
  const numeric = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0
  const prefix = String(value).startsWith('₹') ? '₹' : ''

  useEffect(() => {
    let start = 0
    const duration = 1000
    const steps = 40
    const increment = numeric / steps
    const interval = duration / steps
    const timer = setInterval(() => {
      start += increment
      if (start >= numeric) { setDisplay(numeric); clearInterval(timer) }
      else setDisplay(Math.floor(start))
    }, interval)
    return () => clearInterval(timer)
  }, [numeric])

  return <>{prefix}{typeof display === 'number' ? display.toLocaleString('en-IN') : display}</>
}

export default function StatCard({ label, value, icon: Icon, sub, index = 0 }) {
  const isNumeric = String(value).match(/[0-9]/)
  return (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
    >
      <div className="stat-top">
        <p className="stat-label">{label}</p>
        <div className="stat-icon-wrap"><Icon size={16} /></div>
      </div>
      <p className="stat-value">
        {isNumeric ? <CountUp value={value} /> : value}
      </p>
      {sub && <p className="stat-sub">{sub}</p>}
    </motion.div>
  )
}
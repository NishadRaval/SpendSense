import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Check } from 'lucide-react'
import { updateProfile } from '../api/expenses'
import './Profile.css'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay }
})

export default function Profile({ user, onUpdate }) {
  const [info, setInfo] = useState({ name: user.name, email: user.email })
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [infoMsg, setInfoMsg] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [infoErr, setInfoErr] = useState('')
  const [pwErr, setPwErr] = useState('')
  const [loadInfo, setLoadInfo] = useState(false)
  const [loadPw, setLoadPw] = useState(false)

  const saveInfo = async () => {
    setInfoErr(''); setInfoMsg('')
    setLoadInfo(true)
    try {
      const res = await updateProfile({ name: info.name, email: info.email })
      onUpdate(res.data.user)
      setInfoMsg('Profile updated successfully!')
    } catch (e) {
      setInfoErr(e.response?.data?.message || 'Something went wrong')
    }
    setLoadInfo(false)
  }

  const savePw = async () => {
    setPwErr(''); setPwMsg('')
    if (pw.newPassword !== pw.confirm) return setPwErr('Passwords do not match')
    if (pw.newPassword.length < 6) return setPwErr('Password must be at least 6 characters')
    setLoadPw(true)
    try {
      await updateProfile({ currentPassword: pw.currentPassword, newPassword: pw.newPassword })
      setPwMsg('Password changed successfully!')
      setPw({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (e) {
      setPwErr(e.response?.data?.message || 'Something went wrong')
    }
    setLoadPw(false)
  }

  return (
    <div className="profile">
      <motion.div className="page-header" {...fadeUp(0)}>
        <div>
          <h1>Profile</h1>
          <p className="page-sub">Manage your account settings</p>
        </div>
      </motion.div>

      <div className="profile-grid">
        <motion.div className="profile-card" {...fadeUp(0.1)}>
          <div className="profile-avatar-section">
            <div className="profile-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <p className="profile-name">{user.name}</p>
              <p className="profile-email-label">{user.email}</p>
            </div>
          </div>
        </motion.div>

        <motion.div className="profile-card" {...fadeUp(0.15)}>
          <div className="profile-card-header">
            <User size={16} />
            <h3>Personal Information</h3>
          </div>
          <div className="profile-fields">
            <div className="field-group">
              <label>Full Name</label>
              <input value={info.name} onChange={e => setInfo(f => ({ ...f, name: e.target.value }))} placeholder="Your name" />
            </div>
            <div className="field-group">
              <label>Email Address</label>
              <input value={info.email} type="email" onChange={e => setInfo(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com" />
            </div>
          </div>
          {infoMsg && <p className="profile-success"><Check size={14} /> {infoMsg}</p>}
          {infoErr && <p className="profile-error">{infoErr}</p>}
          <button className="profile-save-btn" onClick={saveInfo} disabled={loadInfo}>
            {loadInfo ? 'Saving...' : 'Save Changes'}
          </button>
        </motion.div>

        <motion.div className="profile-card" {...fadeUp(0.2)}>
          <div className="profile-card-header">
            <Lock size={16} />
            <h3>Change Password</h3>
          </div>
          <div className="profile-fields">
            <div className="field-group">
              <label>Current Password</label>
              <input type="password" value={pw.currentPassword} onChange={e => setPw(f => ({ ...f, currentPassword: e.target.value }))} placeholder="••••••••" />
            </div>
            <div className="field-group">
              <label>New Password</label>
              <input type="password" value={pw.newPassword} onChange={e => setPw(f => ({ ...f, newPassword: e.target.value }))} placeholder="Min. 6 characters" />
            </div>
            <div className="field-group">
              <label>Confirm New Password</label>
              <input type="password" value={pw.confirm} onChange={e => setPw(f => ({ ...f, confirm: e.target.value }))} placeholder="••••••••" />
            </div>
          </div>
          {pwMsg && <p className="profile-success"><Check size={14} /> {pwMsg}</p>}
          {pwErr && <p className="profile-error">{pwErr}</p>}
          <button className="profile-save-btn" onClick={savePw} disabled={loadPw}>
            {loadPw ? 'Saving...' : 'Update Password'}
          </button>
        </motion.div>
      </div>
    </div>
  )
}
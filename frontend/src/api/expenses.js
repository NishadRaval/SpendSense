import axios from 'axios'

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' })

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

export const register = (data) => API.post('/auth/register', data)
export const login = (data) => API.post('/auth/login', data)
export const getMe = () => API.get('/auth/me')

export const getExpenses = (params) => API.get('/expenses', { params })
export const createExpense = (data) => API.post('/expenses', data)
export const updateExpense = (id, data) => API.put(`/expenses/${id}`, data)
export const deleteExpense = (id) => API.delete(`/expenses/${id}`)
export const getStats = (params) => API.get('/expenses/stats', { params })
export const getBudgets = (params) => API.get('/budgets', { params })
export const setBudget = (data) => API.post('/budgets', data)
export const updateProfile = (data) => API.put('/auth/profile', data)
export const getMonthlyTrend = () => API.get('/expenses/trend')

// Accounts
export const getAccounts = () => API.get('/accounts')
export const createAccount = (data) => API.post('/accounts', data)
export const updateAccount = (id, data) => API.put(`/accounts/${id}`, data)
export const deleteAccount = (id) => API.delete(`/accounts/${id}`)
export const transferFunds = (data) => API.post('/accounts/transfer', data)

// Recurring
export const getRecurring = () => API.get('/recurring')
export const createRecurring = (data) => API.post('/recurring', data)
export const updateRecurring = (id, data) => API.put(`/recurring/${id}`, data)
export const deleteRecurring = (id) => API.delete(`/recurring/${id}`)
export const executeRecurring = () => API.post('/recurring/execute')

// Bills
export const getBills = () => API.get('/bills')
export const getUpcomingBills = () => API.get('/bills/upcoming')
export const createBill = (data) => API.post('/bills', data)
export const updateBill = (id, data) => API.put(`/bills/${id}`, data)
export const markBillPaid = (id) => API.patch(`/bills/${id}/paid`)
export const deleteBill = (id) => API.delete(`/bills/${id}`)
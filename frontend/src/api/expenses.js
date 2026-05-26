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
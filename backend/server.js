const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const accountRoutes = require('./routes/accountRoutes');
const recurringRoutes = require('./routes/recurringRoutes');
const billRoutes = require('./routes/billRoutes');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/bills', billRoutes);

app.get('/', (req, res) => res.json({ message: '✅ SpendSense API running - Phase A' }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));
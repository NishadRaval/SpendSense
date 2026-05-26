<div align="center">
  <h1>💰 SpendSense</h1>
  <p>A full-stack MERN expense tracking web application that helps users manage expenses, monitor budgets, and visualize spending analytics through interactive dashboards.</p>

  <a href="https://spendsenseweb.vercel.app">🌐 Live Demo</a> ·
  <a href="https://spendsense-api-cr11.onrender.com">⚙️ Backend API</a> ·
  <a href="https://github.com/NishadRaval/SpendSense">📁 GitHub Repo</a>

  ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
  ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
  ![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
  ![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
</div>

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure register, login & logout
- 👤 **User-scoped data** — Each user sees only their own expenses & budgets
- 💸 **Full CRUD** — Add, edit & delete transactions
- 📊 **Dashboard Analytics** — Interactive pie & bar charts via Recharts
- 📁 **Categories & Filters** — Filter by category, type, month
- 🔎 **Search** — Real-time transaction search
- 🎯 **Budget Tracking** — Set limits per category with progress bars
- ☁️ **Cloud Database** — MongoDB Atlas
- 🌐 **Fully Deployed** — Vercel (frontend) + Render (backend)
- 📱 **Mobile Responsive** — Works on all screen sizes

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, CSS, Axios, Recharts |
| Backend | Node.js, Express.js |
| Auth | JWT, bcryptjs |
| Database | MongoDB Atlas, Mongoose |
| Deployment | Vercel, Render |

---

## 📸 Screenshots

> Dashboard · Login · Transactions · Budgets
> *(Drag and drop screenshots directly here on GitHub)*

---

## 📂 Project Structure
SpendSense/
│
├── backend/
│   ├── controllers/        # Route logic
│   ├── middleware/          # JWT auth middleware
│   ├── models/              # Mongoose schemas
│   ├── routes/              # Express routes
│   ├── server.js
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios API calls
│   │   ├── components/      # Sidebar, StatCard, Modal
│   │   ├── pages/           # Dashboard, Transactions, Budgets, Auth
│   │   └── App.jsx
│   └── .env
│
└── README.md
---

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/NishadRaval/SpendSense.git
cd SpendSense
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
PORT=5000
```

```bash
npm run dev
```

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

Open **http://localhost:5173**

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | Token expiry duration (e.g. `7d`) |
| `PORT` | Server port (default: 5000) |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |

---

## 📈 Future Improvements

- [ ] Recurring expenses
- [ ] Dark mode toggle
- [ ] Export reports to PDF/CSV
- [ ] Monthly trend line chart
- [ ] Email notifications
- [ ] AI spending insights
- [ ] Mobile app (React Native)

---

## 👨‍💻 Author

**Nishad Raval**

- 🌐 Portfolio: [nishadraval.site](https://nishadraval.site)
- 💻 GitHub: [@NishadRaval](https://github.com/NishadRaval)

---

<div align="center">
  <p>Built with ❤️ using the MERN Stack</p>
</div>
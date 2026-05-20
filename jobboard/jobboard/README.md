# 🚀 JobBoard — Full Stack Job Board Website

Built with React, Node.js, Express, and MongoDB.

---

## ✅ SETUP STEPS (Do these in order)

### STEP 1 — Install Node.js
Download from https://nodejs.org → Install the LTS version → Restart your computer.

Verify:
```
node --version
npm --version
```

### STEP 2 — Get a Free MongoDB Database
1. Go to https://mongodb.com/atlas → Sign up free
2. Create a free cluster
3. Click Connect → Connect your application → Copy the URI
4. Go to Network Access → Add IP Address → Allow from Anywhere

### STEP 3 — Set Up Backend
```
cd backend
npm install
```
Then rename `.env.example` to `.env` and fill in:
- MONGODB_URI = your MongoDB Atlas connection string
- JWT_SECRET = any long random string (e.g. "abc123xyz789secretkey")

### STEP 4 — Set Up Frontend
```
cd frontend
npm install
```

### STEP 5 — Run the App

Open TWO terminal windows:

Terminal 1 (Backend):
```
cd backend
npm run dev
```
You should see: ✅ MongoDB connected  ✅ Server running on http://localhost:5000

Terminal 2 (Frontend):
```
cd frontend
npm start
```
Browser opens automatically at http://localhost:3000 🎉

---

## 📁 Project Structure

```
jobboard/
├── backend/
│   ├── server.js          ← Main server file
│   ├── .env               ← Your secrets (create this)
│   ├── models/            ← Database schemas
│   ├── routes/            ← API endpoints
│   ├── middleware/        ← JWT auth
│   └── utils/             ← Email helpers
└── frontend/
    └── src/
        ├── pages/         ← All page components
        ├── components/    ← Reusable components
        └── context/       ← Global state
```

## 🔑 Features
- ✅ User registration & login (JWT auth)
- ✅ Employer dashboard — post, edit, delete jobs
- ✅ Candidate dashboard — apply, track applications
- ✅ Job search with filters
- ✅ Resume upload
- ✅ Email notifications
- ✅ Mobile responsive

## ❓ Troubleshooting

| Problem | Fix |
|---------|-----|
| MongoDB error | Check MONGODB_URI in .env, check Atlas IP whitelist |
| Port in use | Change PORT=5001 in backend .env |
| CORS error | Make sure CLIENT_URL=http://localhost:3000 in backend .env |
| npm install fails | Run: npm cache clean --force |

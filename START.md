# 🚀 Quick Start Guide

## ✅ Setup Complete!

The project has been set up with all dependencies installed. Here's what's ready:

### ✅ Completed:
- ✅ Backend dependencies installed
- ✅ Frontend dependencies installed  
- ✅ Environment files created
- ✅ Circular dependency issues fixed

### ⚠️ Action Required:

**1. Update MySQL Password in `backend/.env`:**

Open `backend/.env` and update:
```env
DB_PASSWORD=your_actual_mysql_password
```

**2. Generate JWT Secrets (Optional but Recommended):**

Run this command to generate secure secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Update in `backend/.env`:
```env
JWT_SECRET=<generated_secret_1>
JWT_REFRESH_SECRET=<generated_secret_2>
```

**3. Create MySQL Database:**

Open MySQL and run:
```sql
CREATE DATABASE chatdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 🎯 Start the Application

### Terminal 1 - Backend:
```bash
cd backend
npm run migrate    # Run this first to create database tables
npm run dev        # Start backend server
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev        # Start frontend server
```

### Browser:
Open: **http://localhost:5173**

---

## 📝 Quick Commands Reference

### Backend:
- `npm install` - Install dependencies
- `npm run migrate` - Create database tables
- `npm run dev` - Start development server (with auto-reload)
- `npm start` - Start production server

### Frontend:
- `npm install` - Install dependencies
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

---

## 🐛 Troubleshooting

### Database Connection Error:
- Verify MySQL is running
- Check password in `backend/.env`
- Ensure database `chatdb` exists

### Port Already in Use:
- Backend: Change `PORT=3000` in `backend/.env`
- Frontend: Vite will auto-use next available port

### Migration Fails:
- Ensure database exists: `CREATE DATABASE chatdb;`
- Check MySQL credentials in `.env`
- Verify MySQL user has proper permissions

---

## 🎉 You're Ready!

Once you've updated the MySQL password and created the database, run the migration and start both servers. The application will be live at **http://localhost:5173**


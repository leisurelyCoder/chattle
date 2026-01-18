# Quick Setup Guide

## 1. Database Setup

```sql
CREATE DATABASE chatdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run migrate
npm run dev
```

## 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## 4. Access Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Health Check: http://localhost:3000/health

## 5. Test the Application

1. Register a new user at http://localhost:5173/register
2. Open another browser/incognito window
3. Register a second user
4. Search for the first user and start chatting!

## Troubleshooting

### MySQL Connection Error
- Ensure MySQL is running: `mysql -u root -p`
- Verify credentials in `backend/.env`
- Check database exists: `SHOW DATABASES;`

### Port Already in Use
- Change PORT in `backend/.env`
- Update `VITE_API_URL` and `VITE_SOCKET_URL` in `frontend/.env`

### Socket.IO Not Connecting
- Check browser console for errors
- Verify JWT token is valid
- Ensure CORS is configured correctly


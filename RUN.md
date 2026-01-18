# How to Run the Project

## Prerequisites

Before starting, ensure you have:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/)
- **npm** (comes with Node.js)

Verify installations:
```bash
node --version  # Should be v18+
npm --version
mysql --version
```

---

## Step 1: Database Setup

### 1.1 Start MySQL Server
Make sure MySQL is running on your system.

### 1.2 Create Database
Open MySQL command line or MySQL Workbench and run:
```sql
CREATE DATABASE chatdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Or using command line:
```bash
mysql -u root -p
# Enter your MySQL password when prompted
CREATE DATABASE chatdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

---

## Step 2: Backend Setup

### 2.1 Navigate to Backend Directory
```bash
cd backend
```

### 2.2 Install Dependencies
```bash
npm install
```

This will install all required packages (Express, Socket.IO, Sequelize, etc.)

### 2.3 Configure Environment Variables

Create a `.env` file in the `backend` directory:

**Option A: Copy from example**
```bash
cp .env.example .env
```

**Option B: Create manually**
Create `backend/.env` with this content:
```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=chatdb

JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-for-security
JWT_REFRESH_SECRET=your-refresh-token-secret-key-minimum-32-characters
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

FRONTEND_URL=http://localhost:5173
```

**⚠️ IMPORTANT: Update these values:**
- `DB_PASSWORD` - Replace `your_mysql_password` with your actual MySQL root password
- `JWT_SECRET` - Generate a random string (minimum 32 characters). You can use:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- `JWT_REFRESH_SECRET` - Generate another random string (minimum 32 characters)

### 2.4 Run Database Migrations
```bash
npm run migrate
```

This will create all necessary tables in your database. You should see:
```
✅ MySQL connection established successfully.
🔄 Starting database migration...
✅ Database migration completed successfully.
```

### 2.5 Start Backend Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

You should see:
```
✅ MySQL connection established successfully.
🚀 Server running on port 3000
📡 Socket.IO initialized
🌍 Environment: development
🔗 Frontend URL: http://localhost:5173
```

**Backend is now running on:** `http://localhost:3000`

---

## Step 3: Frontend Setup

### 3.1 Open a New Terminal Window

Keep the backend running and open a new terminal.

### 3.2 Navigate to Frontend Directory
```bash
cd frontend
```

### 3.3 Install Dependencies
```bash
npm install
```

This will install Vue.js, Pinia, Socket.IO client, Tailwind CSS, etc.

### 3.4 Configure Environment Variables

Create a `.env` file in the `frontend` directory:

**Option A: Copy from example**
```bash
cp .env.example .env
```

**Option B: Create manually**
Create `frontend/.env` with this content:
```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

**Note:** Usually no changes needed unless you're using different ports.

### 3.5 Start Frontend Development Server
```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network:  use --host to expose
```

**Frontend is now running on:** `http://localhost:5173`

---

## Step 4: Access the Application

1. Open your browser and go to: **http://localhost:5173**

2. You should see the login page.

3. **Create your first account:**
   - Click "create a new account" or go to `/register`
   - Fill in:
     - Username (3-50 characters, alphanumeric + underscore)
     - Email
     - Password (min 8 characters, must contain letter + number)
   - Click "Create account"

4. **Test the chat:**
   - Open another browser window (or incognito/private mode)
   - Register a second user
   - In the first window, search for the second user
   - Start chatting!

---

## Quick Start Commands Summary

### Terminal 1 (Backend):
```bash
cd backend
npm install
# Create .env file with your database credentials
npm run migrate
npm run dev
```

### Terminal 2 (Frontend):
```bash
cd frontend
npm install
# Create .env file (usually no changes needed)
npm run dev
```

### Browser:
```
http://localhost:5173
```

---

## Troubleshooting

### ❌ "Cannot connect to MySQL database"
- **Solution:** 
  - Verify MySQL is running: `mysql -u root -p`
  - Check database exists: `SHOW DATABASES;`
  - Verify credentials in `backend/.env`
  - Ensure database name matches: `chatdb`

### ❌ "Port 3000 already in use"
- **Solution:**
  - Change `PORT=3000` to another port (e.g., `PORT=3001`) in `backend/.env`
  - Update `VITE_SOCKET_URL` in `frontend/.env` to match
  - Update `VITE_API_URL` in `frontend/.env` to match

### ❌ "Port 5173 already in use"
- **Solution:**
  - Vite will automatically use the next available port
  - Or specify: `npm run dev -- --port 5174`

### ❌ "Socket.IO connection failed"
- **Solution:**
  - Verify backend is running on port 3000
  - Check `VITE_SOCKET_URL` in `frontend/.env` matches backend URL
  - Check browser console for specific errors
  - Verify JWT token is valid (try logging out and back in)

### ❌ "JWT_SECRET must be at least 32 characters"
- **Solution:**
  - Generate a secure secret:
    ```bash
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    ```
  - Copy the output to `JWT_SECRET` and `JWT_REFRESH_SECRET` in `backend/.env`

### ❌ "Module not found" errors
- **Solution:**
  - Delete `node_modules` folder
  - Delete `package-lock.json`
  - Run `npm install` again

### ❌ Database migration fails
- **Solution:**
  - Ensure database exists: `CREATE DATABASE chatdb;`
  - Check MySQL user has proper permissions
  - Verify connection credentials in `.env`

---

## Production Build

### Build Frontend:
```bash
cd frontend
npm run build
```

Built files will be in `frontend/dist/`

### Run Backend in Production:
```bash
cd backend
NODE_ENV=production npm start
```

---

## Stopping the Servers

- **Backend:** Press `Ctrl + C` in the backend terminal
- **Frontend:** Press `Ctrl + C` in the frontend terminal

---

## Next Steps

1. ✅ Register two users
2. ✅ Search for users
3. ✅ Start a conversation
4. ✅ Send messages in real-time
5. ✅ See typing indicators
6. ✅ Check read receipts
7. ✅ Test online/offline status

Enjoy your real-time chat application! 🎉


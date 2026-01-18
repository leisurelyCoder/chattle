# Real-Time 1-to-1 Chat Application

A production-ready real-time chat application built with Vue.js 3, Node.js, Express, Socket.IO, and MySQL. Features include secure authentication, real-time messaging, typing indicators, read receipts, and online/offline status tracking.

## 🚀 Features

- **User Authentication**: JWT-based authentication with refresh tokens
- **Real-Time Messaging**: Socket.IO for instant message delivery
- **Message Persistence**: All messages stored in MySQL database
- **Typing Indicators**: Real-time typing status updates
- **Read Receipts**: Message delivery status (sent/delivered/read)
- **Online/Offline Status**: Track user presence in real-time
- **Message History**: Paginated message history with infinite scroll
- **WhatsApp-like UI**: Clean, modern interface with Tailwind CSS
- **Optimistic UI**: Instant message display before server confirmation

## 📋 Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## 🗄️ Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE chatdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. The application will automatically create tables on first run using Sequelize migrations.

## ⚙️ Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your database credentials:
```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=chatdb

JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-for-security
JWT_REFRESH_SECRET=your-refresh-token-secret-key-minimum-32-characters
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

FRONTEND_URL=http://localhost:5173
```

5. Run database migrations:
```bash
npm run migrate
```

6. Start the backend server:
```bash
npm run dev
```

The backend server will run on `http://localhost:3000`

## 🎨 Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file (usually defaults are fine):
```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

5. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 📁 Project Structure

```
project-root/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and Socket.IO configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, rate limiting, sanitization
│   │   ├── models/          # Sequelize models
│   │   ├── routes/          # Express routes
│   │   ├── services/       # Business logic
│   │   ├── socket/         # Socket.IO handlers
│   │   ├── utils/          # Helpers and validators
│   │   └── server.js       # Express server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Vue components
│   │   ├── stores/         # Pinia stores
│   │   ├── services/      # API and Socket services
│   │   ├── router/         # Vue Router
│   │   ├── views/         # Page components
│   │   └── main.js        # Vue app entry point
│   └── package.json
└── README.md
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/me` - Get current user
- `GET /api/users/search?q=<query>` - Search users

### Conversations
- `GET /api/conversations` - Get user conversations
- `GET /api/conversations/:id` - Get conversation by ID
- `POST /api/conversations` - Create or get conversation

### Messages
- `GET /api/conversations/:id/messages?page=1&limit=50` - Get messages
- `POST /api/conversations/:id/messages` - Send message

## 🔌 Socket.IO Events

### Client → Server
- `authenticate` - Authenticate socket connection
- `join_conversation` - Join conversation room
- `leave_conversation` - Leave conversation room
- `send_message` - Send a message
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator
- `mark_read` - Mark messages as read

### Server → Client
- `authenticated` - Authentication successful
- `new_message` - New message received
- `message_delivered` - Message delivered
- `messages_read` - Messages read
- `user_typing` - User is typing
- `user_stopped_typing` - User stopped typing
- `user_online` - User came online
- `user_offline` - User went offline

## 🛠️ Development

### Backend
- Development: `npm run dev` (uses nodemon for auto-reload)
- Production: `npm start`
- Migrations: `npm run migrate`

### Frontend
- Development: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`

## 🔒 Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt (10 salt rounds)
- Input validation and sanitization
- Rate limiting on API endpoints
- SQL injection prevention (parameterized queries)
- XSS prevention (message sanitization)
- CORS configuration
- Helmet.js security headers

## 📝 Environment Variables

### Backend
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3000)
- `DB_HOST` - MySQL host
- `DB_PORT` - MySQL port (default: 3306)
- `DB_USER` - MySQL username
- `DB_PASSWORD` - MySQL password
- `DB_NAME` - Database name
- `JWT_SECRET` - JWT signing secret (min 32 chars)
- `JWT_REFRESH_SECRET` - Refresh token secret (min 32 chars)
- `JWT_ACCESS_EXPIRY` - Access token expiry (default: 15m)
- `JWT_REFRESH_EXPIRY` - Refresh token expiry (default: 7d)
- `FRONTEND_URL` - Frontend URL for CORS

### Frontend
- `VITE_API_URL` - Backend API URL
- `VITE_SOCKET_URL` - Socket.IO server URL

## 🐛 Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database exists: `CREATE DATABASE chatdb;`

### Socket.IO Connection Issues
- Verify backend is running on correct port
- Check CORS configuration
- Ensure JWT token is valid

### Frontend Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (v18+)

## 📄 License

ISC

## 👥 Contributing

This is a production-ready application. Feel free to fork and modify for your needs.

## 🎯 Next Steps

- Add file/image sharing
- Implement group chats
- Add message reactions
- Implement message search
- Add push notifications
- Implement message encryption


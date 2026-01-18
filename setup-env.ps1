# Setup script to create .env files from .env.example

Write-Host "Setting up environment files..." -ForegroundColor Green

# Backend .env
if (-not (Test-Path "backend\.env")) {
    if (Test-Path "backend\.env.example") {
        Copy-Item "backend\.env.example" "backend\.env"
        Write-Host "✅ Created backend/.env from .env.example" -ForegroundColor Green
    } else {
        # Create .env with default values
        @"
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
"@ | Out-File -FilePath "backend\.env" -Encoding utf8
        Write-Host "✅ Created backend/.env with default values" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  backend/.env already exists, skipping..." -ForegroundColor Yellow
}

# Frontend .env
if (-not (Test-Path "frontend\.env")) {
    if (Test-Path "frontend\.env.example") {
        Copy-Item "frontend\.env.example" "frontend\.env"
        Write-Host "✅ Created frontend/.env from .env.example" -ForegroundColor Green
    } else {
        # Create .env with default values
        @"
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
"@ | Out-File -FilePath "frontend\.env" -Encoding utf8
        Write-Host "✅ Created frontend/.env with default values" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  frontend/.env already exists, skipping..." -ForegroundColor Yellow
}

Write-Host "`n⚠️  IMPORTANT: Please update backend/.env with your MySQL password and generate secure JWT secrets!" -ForegroundColor Yellow
Write-Host "   You can generate secrets with: node -e `"console.log(require('crypto').randomBytes(32).toString('hex'))`"" -ForegroundColor Cyan


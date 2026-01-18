# Railway Deployment Guide

## Quick Setup for Backend

### Option 1: Set Root Directory in Railway Dashboard (Recommended)

1. **Go to your Railway project dashboard**
2. **Click on your service**
3. **Go to "Settings" tab**
4. **Under "Source" section, set:**
   - **Root Directory**: `backend`
5. **Save changes**

Railway will now detect Node.js automatically!

### Option 2: Use Railway CLI

1. **Install Railway CLI:**
   ```powershell
   npm install -g @railway/cli
   ```

2. **Login:**
   ```bash
   railway login
   ```

3. **Initialize project:**
   ```bash
   railway init
   ```

4. **Set root directory:**
   ```bash
   railway variables set RAILWAY_PROJECT_ROOT=backend
   ```

5. **Deploy:**
   ```bash
   railway up
   ```

## Environment Variables

Set these in Railway dashboard under "Variables" tab:

```env
NODE_ENV=production
PORT=3000
DB_HOST=your_mysql_host
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
FRONTEND_URL=https://your-netlify-app.netlify.app
```

## Add MySQL Database

1. **In Railway dashboard, click "New"**
2. **Select "Database" → "MySQL"**
3. **Railway will automatically provide connection details**
4. **Copy the connection variables and add them to your service environment variables**

## Deploy Steps

1. **Connect GitHub repository** to Railway
2. **Create new project** from GitHub repo
3. **Set root directory** to `backend` (important!)
4. **Add MySQL database** service
5. **Set environment variables**
6. **Deploy** - Railway will auto-deploy on git push

## Troubleshooting

### Railpack Can't Detect Node.js

**Solution**: Set root directory to `backend` in Railway settings.

### Build Fails

- Check that `backend/package.json` exists
- Verify `npm install` works locally
- Check build logs in Railway dashboard

### Database Connection Errors

- Verify all DB environment variables are set
- Check that database service is running
- Ensure database allows connections from Railway

### Port Issues

- Railway automatically sets `PORT` environment variable
- Your app should use `process.env.PORT || 3000`
- Check that your server.js uses the PORT variable

## Free Tier

Railway free tier includes:
- $5 credit/month
- Sleeps after inactivity (wakes up in ~30 seconds)
- Perfect for development/testing

## Next Steps

1. Deploy backend to Railway (this guide)
2. Get your Railway backend URL
3. Deploy frontend to Netlify (see NETLIFY_DEPLOY.md)
4. Update frontend environment variables with Railway URL
5. Update backend `FRONTEND_URL` with Netlify URL


# IntervueAI Deployment Guide

This guide will help you deploy all three components of IntervueAI without changing the tech stack.

## Prerequisites
- GitHub account
- Vercel account (free)
- Render account (free tier available)

## Step 1: Push to GitHub

```bash
cd C:\Users\anany\OneDrive\Desktop\IntervueAI
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/intervueai.git
git push -u origin main
```

## Step 2: Deploy Frontend (Vercel)

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add Environment Variables:
   ```
   VITE_API_URL=https://YOUR-NODE-BACKEND.onrender.com/api
   ```

6. Click "Deploy"
7. Note your frontend URL (e.g., `https://intervueai.vercel.app`)

## Step 3: Deploy Node.js Backend (Render)

1. Go to https://render.com
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `intervueai-node-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://ananyajaiswaldpspune_db_user:Test123456@clustera.vpxprh1.mongodb.net/intervueai?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   PYTHON_API_URL=https://intervueai-python-backend.onrender.com
   ```

6. Click "Create Web Service"
7. Note your backend URL (e.g., `https://intervueai-node-backend.onrender.com`)

## Step 4: Deploy Python Backend (Render)

1. In Render, click "New" → "Web Service" again
2. Connect same GitHub repository
3. Configure:
   - **Name**: `intervueai-python-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python interview_api.py`
   - **Instance Type**: Free

4. No environment variables needed for Python backend

5. Click "Create Web Service"
6. Note your Python backend URL

## Step 5: Update CORS Settings

After all services are deployed, update CORS to allow your frontend:

**File: `backend/src/server.js`**
```javascript
app.use(cors({
  origin: [
    'https://intervueai.vercel.app', // Replace with your Vercel URL
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:8081'
  ].filter(Boolean),
  credentials: true,
}));
```

**File: `backend/interview_api.py`**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://intervueai.vercel.app",  # Replace with your Vercel URL
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8080",
        "http://localhost:8081"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Commit and push these changes - Render will auto-redeploy.

## Step 6: Update Frontend API URL

Go back to Vercel:
1. Settings → Environment Variables
2. Update `VITE_API_URL` with your actual Node.js backend URL
3. Redeploy from Deployments tab

## Step 7: Test Your Deployment

1. Visit your Vercel URL
2. Test signup/login
3. Start a simulation
4. Check if everything works

## Important Notes

### Free Tier Limitations
- **Render Free**: Services spin down after 15 min of inactivity (first request takes ~30 seconds)
- **Vercel Free**: 100GB bandwidth/month
- **MongoDB Atlas Free**: 512MB storage

### Upgrading Whisper Model
The Python backend uses Whisper "base" model. For production, consider:
- Upgrading to "medium" or "large" for better accuracy
- Using a paid Render plan for better performance

### Security
Before production:
1. Change JWT_SECRET to a strong random string
2. Use environment variables for all secrets
3. Enable HTTPS (automatic on Vercel/Render)

## Troubleshooting

### Backend not responding
- Check Render logs for errors
- Ensure MongoDB URI is correct
- Verify CORS settings include your frontend URL

### Frontend can't connect
- Check browser console for CORS errors
- Verify VITE_API_URL is correct in Vercel
- Ensure backend services are running

### Whisper model loading slowly
- First request after spin-down takes time
- Consider upgrading to paid Render plan
- Or use a dedicated GPU instance

## Alternative: Deploy Everything on Railway

If you prefer a single platform:

1. Go to https://railway.app
2. Create new project from GitHub repo
3. Add three services:
   - Frontend (Vite)
   - Node Backend
   - Python Backend
4. Railway auto-detects and configures everything
5. Add environment variables to each service

## Cost Estimates (Monthly)

**Free Tier:**
- Vercel: Free
- Render: Free (with limitations)
- MongoDB Atlas: Free
- **Total: $0/month**

**Recommended Production:**
- Vercel Pro: Free tier sufficient
- Render Starter: $7/service × 2 = $14
- MongoDB Atlas: $9 (M2 tier)
- **Total: ~$23/month**

---

## Quick Deploy Commands

```bash
# 1. Setup Git (if not already)
git init
git add .
git commit -m "Ready for deployment"

# 2. Create GitHub repo and push
git remote add origin YOUR_REPO_URL
git push -u origin main

# 3. Deploy frontend (using Vercel CLI)
npm install -g vercel
cd frontend
vercel --prod

# 4. Deploy backends via Render dashboard
# Follow Step 3 and 4 above
```

Your app is now live! 🎉

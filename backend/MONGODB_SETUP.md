# MongoDB Atlas Setup Guide

## Step 1: Access MongoDB Atlas
1. Go to https://cloud.mongodb.com/
2. Sign in to your account

## Step 2: Create/Reset Database User
1. Click **"Database Access"** in the left sidebar (under Security)
2. You should see your user: `ananyajaiswaldpspune_db_user`
3. Click **"Edit"** next to the user
4. Click **"Edit Password"**
5. Choose **"Autogenerate Secure Password"** OR set a simple password (e.g., `Test123456`)
6. **COPY THE PASSWORD** - you'll need this!
7. Make sure the user has **"Read and write to any database"** privilege
8. Click **"Update User"**

## Step 3: Whitelist Your IP Address
1. Click **"Network Access"** in the left sidebar (under Security)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (adds 0.0.0.0/0)
   - OR click "Add Current IP Address" to only allow your current IP
4. Click **"Confirm"**

## Step 4: Get Your Connection String
1. Click **"Database"** in the left sidebar
2. Click **"Connect"** on your cluster (ClusterA)
3. Choose **"Connect your application"**
4. Copy the connection string (should look like):
   ```
   mongodb+srv://<username>:<password>@clustera.vpxprh1.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` with: `ananyajaiswaldpspune_db_user`
6. Replace `<password>` with the password you copied in Step 2
7. Add the database name `intervueai` after `.mongodb.net/`:
   ```
   mongodb+srv://ananyajaiswaldpspune_db_user:YOUR_PASSWORD@clustera.vpxprh1.mongodb.net/intervueai?retryWrites=true&w=majority
   ```

## Step 5: Update Your .env File
1. Open `backend/.env`
2. Update the `MONGODB_URI` with your new connection string
3. Save the file

## Step 6: Test the Connection
1. Open terminal in the `backend` folder
2. Run: `npm run dev`
3. You should see: `MongoDB Connected: clustera-shard-00-00.vpxprh1.mongodb.net`

## Common Issues:

### "bad auth: authentication failed"
- Password is incorrect
- Make sure there are no spaces in the connection string
- If password has special characters (@, :, /, ?, #, [, ], %), you need to URL-encode them

### "MongoNetworkError"
- IP address not whitelisted
- Check Network Access settings

### "ENOTFOUND"
- Connection string format is wrong
- Make sure it starts with `mongodb+srv://`

## Example Working Connection String:
```
mongodb+srv://ananyajaiswaldpspune_db_user:Test123456@clustera.vpxprh1.mongodb.net/intervueai?retryWrites=true&w=majority
```

# Deployment Guide - Vercel + Supabase

This guide will help you deploy your Expense Tracker app to Vercel with Supabase database.

## Prerequisites

- ✅ Supabase project set up
- ✅ Database tables created
- ✅ Environment variables configured locally

## Step 1: Prepare Your Code

1. **Make sure all files are committed to Git:**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Verify your environment variables are working locally:**
   ```bash
   npm run dev
   # Test user registration and login
   ```

## Step 2: Deploy to Vercel

### Option A: Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up/Login with your GitHub account**
3. **Click "New Project"**
4. **Import your GitHub repository**
5. **Configure project settings:**
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add:
     ```
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your_anon_key_here
     ```
7. **Click "Deploy"**

### Option B: Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Follow prompts and add environment variables**

## Step 3: Configure Supabase

1. **Go to your Supabase dashboard**
2. **Navigate to Authentication > Settings**
3. **Update URLs:**
   ```
   Site URL: https://your-app-name.vercel.app
   Redirect URLs: 
   - https://your-app-name.vercel.app
   - https://your-app-name.vercel.app/auth/callback
   ```
4. **Save changes**

## Step 4: Test Your Deployment

1. **Visit your Vercel URL**
2. **Test user registration**
3. **Test user login**
4. **Test adding expenses**
5. **Test data persistence**

## Environment Variables

Make sure these are set in Vercel:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Troubleshooting

### Build Errors
- Check if all dependencies are in `package.json`
- Verify TypeScript compilation
- Check for missing environment variables

### Authentication Issues
- Verify Supabase URLs are correct
- Check browser console for errors
- Ensure RLS policies are set up

### Database Connection
- Verify Supabase credentials
- Check if tables exist
- Test database connection

## Custom Domain (Optional)

1. **Go to Vercel Dashboard > Your Project > Settings > Domains**
2. **Add your custom domain**
3. **Update Supabase Authentication settings with new domain**
4. **Configure DNS if needed**

## Monitoring

- **Vercel Analytics**: Built-in performance monitoring
- **Supabase Logs**: Check for database errors
- **Browser Console**: Check for client-side errors

## Security Checklist

- ✅ Environment variables are set
- ✅ Supabase RLS is enabled
- ✅ Authentication policies are configured
- ✅ HTTPS is enabled (automatic with Vercel)
- ✅ No sensitive data in client code

## Performance Optimization

- ✅ Vite build optimization
- ✅ Static asset caching
- ✅ Code splitting enabled
- ✅ Tree shaking enabled

Your app should now be live at: `https://your-app-name.vercel.app` 
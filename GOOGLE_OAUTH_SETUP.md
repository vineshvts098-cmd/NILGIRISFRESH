# Google OAuth Setup Guide

## Overview
This guide will help you set up Google OAuth authentication for NilgirisFresh.

## Prerequisites
- A Google Cloud account
- Access to your Supabase project dashboard

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API for your project

## Step 2: Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Web application** as the application type
4. Configure the OAuth consent screen if prompted:
   - Add your app name: "NilgirisFresh"
   - Add your support email
   - Add authorized domains (your production domain)

## Step 3: Configure Authorized Redirect URIs

Add the following redirect URIs:

**For Development:**
```
http://localhost:8080/auth/v1/callback
```

**For Production (replace with your domain):**
```
https://your-project-ref.supabase.co/auth/v1/callback
https://yourdomain.com/auth/v1/callback
```

## Step 4: Get Your Credentials

After creating the OAuth client, you'll receive:
- **Client ID** (looks like: `123456789-abc123.apps.googleusercontent.com`)
- **Client Secret** (keep this secure!)

## Step 5: Configure Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the list and enable it
4. Enter your **Client ID** and **Client Secret**
5. Click **Save**

## Step 6: Test the Integration

1. Start your local development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/auth` page
3. Click "Continue with Google"
4. Select your Google account
5. You should be redirected back and logged in!

## Troubleshooting

### "Redirect URI mismatch" error
- Make sure the redirect URI in Google Cloud Console exactly matches your Supabase callback URL
- Check for trailing slashes or http vs https mismatches

### "Access blocked" error
- Ensure your OAuth consent screen is properly configured
- Add test users if your app is in testing mode

### User not created in Supabase
- Check your Supabase logs in the Dashboard
- Verify that email provider is enabled in Supabase Auth settings

## Production Deployment

When deploying to production:

1. Update authorized redirect URIs in Google Cloud Console with your production domain
2. Update Supabase site URL in project settings
3. Test the OAuth flow on production before going live

## Security Best Practices

- Never commit your Client Secret to version control
- Use environment variables for sensitive credentials
- Regularly rotate your OAuth credentials
- Monitor OAuth usage in Google Cloud Console

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)

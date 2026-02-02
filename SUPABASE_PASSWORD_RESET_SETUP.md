# Supabase Password Reset Configuration

## ⚠️ Important: Configure Redirect URL in Supabase

To make password reset work properly, you need to add the redirect URL to your Supabase project:

### Steps:

1. **Go to Supabase Dashboard**
   - Navigate to: [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Go to Authentication Settings**
   - Click on **Authentication** in the left sidebar
   - Click on **URL Configuration**

3. **Add Redirect URL**
   - In the **"Redirect URLs"** section, add:
     ```
     http://localhost:8080/auth?mode=reset
     ```
   - For production, also add:
     ```
     https://yourdomain.com/auth?mode=reset
     ```

4. **Save Changes**
   - Click **Save**

---

## How Password Reset Works Now:

1. User clicks "Forgot password?" on login page
2. Enters their email
3. Receives email with reset link
4. Clicks link → Redirected to `/auth?mode=reset`
5. Sees "Set New Password" form
6. Enters new password
7. Password updated → Logged in

---

## Testing:

1. Go to `/auth`
2. Click "Forgot password?"
3. Enter your email
4. Check your email
5. Click the reset link
6. You should see the "Set New Password" form
7. Enter new password and confirm
8. Click "Update Password"
9. Should be logged in with new password

---

## Troubleshooting:

**If still redirecting to home:**
- Make sure you added the redirect URL in Supabase dashboard
- Clear browser cache and cookies
- Try in incognito mode

**If email not received:**
- Check spam folder
- Verify email is correct in Supabase Auth users
- Check Supabase email templates are enabled

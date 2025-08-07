# Password Reset Functionality

This document provides instructions on how to set up and test the password reset functionality in the BMK-ANALYTICS application.

## Setup

### 1. Configure Email Settings

To enable password reset emails, you need to configure your email settings in the `.env` file. You can use the provided `.env.example` file as a template.

#### For Gmail:

```
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-gmail-account@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password  # Use an app password, not your regular password
EMAIL_FROM=your-gmail-account@gmail.com
```

**Important Note for Gmail Users:**
- You need to enable 2-step verification for your Google account
- Create an app password at: https://myaccount.google.com/apppasswords
- Use that app password instead of your regular password

#### For Outlook/Office 365:

```
EMAIL_SERVER_HOST=smtp.office365.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-outlook-account@outlook.com
EMAIL_SERVER_PASSWORD=your-password
EMAIL_FROM=your-outlook-account@outlook.com
```

#### For Other SMTP Servers:

Update the following variables in your `.env` file with your SMTP server details:

```
EMAIL_SERVER_HOST=your-smtp-server.com
EMAIL_SERVER_PORT=587  # or the appropriate port for your server
EMAIL_SERVER_USER=your-email@example.com
EMAIL_SERVER_PASSWORD=your-email-password
EMAIL_FROM=noreply@example.com  # The "from" address for sent emails
```

### 2. Restart the Application

After updating your `.env` file, restart the application to apply the changes:

```bash
npm run dev
# or
pnpm dev
```

## Testing the Password Reset Functionality

1. Navigate to the sign-in page at `/auth/signin`
2. Click on the "Forgot your password?" link
3. Enter your email address and click "Send reset link"
4. Check your email for the password reset link
   - If you don't receive an email, check your spam folder
   - If email configuration is not set up correctly, the application will display a warning message and fall back to logging the reset link in the console
   - Administrators can find the reset link in the server console logs, formatted as: `Password reset link for user@example.com: http://localhost:3000/auth/reset-password?token=...`
5. Click the reset link in the email (or copy the link from the console if email sending failed)
6. Enter your new password and confirm it
7. You should be redirected to the sign-in page where you can sign in with your new password

## Troubleshooting

### Email Not Sending

If emails are not being sent, check the following:

1. Verify your email configuration in the `.env` file
2. Check if your email provider requires additional security settings
3. For Gmail users, ensure you're using an app password, not your regular password
4. Check the console logs for any error messages related to email sending

### Using the Console Fallback Mechanism

When email configuration is not set up correctly, the application automatically falls back to logging password reset links in the console:

1. The user interface will display a yellow warning message instead of a green success message
2. The warning message will include instructions for administrators
3. Password reset links will be logged to the console in this format:
   ```
   Email configuration is invalid. Using console fallback.
   Password reset link for user@example.com: http://localhost:3000/auth/reset-password?token=...
   ```
4. Administrators can copy this link and provide it to the user manually
5. To fix this issue permanently, update the email configuration in the `.env` file

### Password Reset Link Not Working

If the password reset link doesn't work:

1. Ensure the link hasn't expired (links expire after 1 hour)
2. Make sure you're using the most recent reset link if you've requested multiple resets
3. Check that the `NEXTAUTH_URL` in your `.env` file matches the URL you're accessing the application from

## Implementation Details

The password reset functionality consists of the following components:

1. **Forgot Password Page** (`/app/auth/forgot-password/page.txt`): Allows users to request a password reset
2. **Reset Password Page** (`/app/auth/reset-password/page.txt`): Allows users to set a new password
3. **Forgot Password API** (`/app/api/auth/forgot-password/route.ts`): Handles password reset requests
4. **Reset Password API** (`/app/api/auth/reset-password/route.ts`): Handles password reset submissions
5. **Email Utility** (`/lib/email.ts`): Handles sending emails using nodemailer

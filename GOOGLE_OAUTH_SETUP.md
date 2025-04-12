# Setting Up Google OAuth for Atlas AI

This guide will help you set up Google OAuth for authentication in the Atlas AI application.

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"

## Step 2: Configure the OAuth Consent Screen

1. Click on "OAuth consent screen" in the left sidebar
2. Select "External" user type (unless you're using a Google Workspace organization)
3. Fill in the required information:
   - App name: "Atlas AI"
   - User support email: Your email
   - Developer contact information: Your email
4. Click "Save and Continue"
5. Add the following scopes:
   - `./auth/userinfo.email`
   - `./auth/userinfo.profile`
   - `openid`
6. Click "Save and Continue"
7. Add test users if you're in testing mode
8. Click "Save and Continue"

## Step 3: Create OAuth Client ID

1. Click on "Credentials" in the left sidebar
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Name: "Atlas AI Web Client"
5. Add the following Authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - Your production URL if applicable
6. Add the following Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - Your production callback URL if applicable
7. Click "Create"
8. Note down the Client ID and Client Secret

## Step 4: Add Credentials to Environment Variables

1. Create a `.env` file in the root of your project (or edit the existing one)
2. Add the following lines:
   ```
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```
3. Replace `your-client-id` and `your-client-secret` with the values from step 3

## Step 5: Restart Your Application

1. If your application is running, stop it
2. Start it again with `npm run dev`

## Troubleshooting

If you encounter issues with Google sign-in:

1. **Redirect URI errors**: Make sure the redirect URI in your Google Cloud Console matches exactly with what NextAuth.js is using
2. **Consent screen not approved**: If you're using External user type, make sure your app is properly configured
3. **API not enabled**: Make sure the "Google+ API" is enabled in your Google Cloud Console
4. **Environment variables not loaded**: Make sure your `.env` file is in the correct location and the application is restarted

For more detailed information, refer to:
- [NextAuth.js Google Provider Documentation](https://next-auth.js.org/providers/google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)

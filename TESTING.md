# Testing the MongoDB Migration

This guide provides steps to test the migration from Prisma to MongoDB.

## Prerequisites

1. MongoDB installed and running locally
2. Node.js and npm installed

## Setup

1. Run the setup script:

```bash
node scripts/setup.js
```

This will:
- Install required dependencies
- Remove Prisma dependencies
- Create a .env file if it doesn't exist
- Initialize the MongoDB database

## Testing Steps

### 1. User Registration

1. Start the application:

```bash
npm run dev
```

2. Navigate to `/api/auth/signup`
3. Create a new account with:
   - Username
   - Email
   - Password
   - Standard/Class

4. Verify in MongoDB that the user was created with a hashed password:

```bash
mongosh
use atlas-ai
db.users.find().pretty()
```

### 2. User Authentication

1. Navigate to `/api/auth/signin`
2. Sign in with the credentials you created
3. Verify you are redirected to the dashboard

### 3. Dashboard Functionality

1. Check that the dashboard loads correctly
2. Verify user information is displayed correctly
3. Test any dashboard features that interact with the database

### 4. Quiz Functionality

1. Navigate to the quiz section
2. Take a quiz
3. Verify results are saved to the database

### 5. Chat Functionality

1. Test the chat feature
2. Verify it retrieves user information correctly

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues:

1. Verify MongoDB is running:

```bash
mongosh
```

2. Check your .env file has the correct DATABASE_URL:

```
DATABASE_URL="mongodb://localhost:27017/atlas-ai"
```

3. Restart the application

### Module Not Found Errors

If you encounter errors like "Module not found: Can't resolve 'child_process'":

1. Ensure you have the correct Next.js configuration:

```js
// next.config.js
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        child_process: false,
        // other Node.js modules...
      };
    }
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['mongodb'],
  },
};
```

2. Make sure your MongoDB code is only running on the server side

3. Check that you're not importing server-only modules in client components

### Authentication Issues

If authentication is not working:

1. Check the NextAuth logs in the console
2. Verify the NEXTAUTH_SECRET and NEXTAUTH_URL in .env
3. Clear browser cookies and try again

## Performance Testing

Compare the performance before and after migration:

1. Response times for API calls
2. Memory usage
3. Database query times

## Security Testing

1. Test password hashing by verifying passwords are not stored in plain text
2. Test authentication flow for security vulnerabilities
3. Verify proper error handling for invalid credentials

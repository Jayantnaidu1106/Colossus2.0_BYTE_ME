# Migrating from Prisma to MongoDB

This guide explains how the application was migrated from using Prisma ORM to directly using MongoDB with proper authentication.

## Changes Made

### 1. MongoDB Connection Setup

- Created a MongoDB client connection in `lib/mongodb.ts`
- Added MongoDB schema validation in `lib/models/user.ts`
- Configured Next.js to handle server-side only MongoDB code

### 2. User Model and Authentication

- Created a User model with proper TypeScript interfaces in `lib/models/user.ts`
- Implemented password hashing using bcryptjs
- Enhanced authentication with NextAuth in `lib/auth.ts`

### 3. API Routes

- Updated all API routes to use MongoDB directly instead of Prisma
- Implemented proper error handling and validation

### 4. Database Initialization

- Created a MongoDB initialization script in `scripts/init-mongodb.js`
- Added automatic database initialization on application startup

### 5. Dependencies and Configuration

- Added bcryptjs for password hashing
- Removed Prisma dependencies
- Added Next.js configuration to handle Node.js modules
- Ensured MongoDB code only runs on the server side

## How to Use

1. Run the setup script to install dependencies and initialize MongoDB:

```bash
node scripts/setup.js
```

2. Start the application:

```bash
npm run dev
```

## MongoDB Schema

The User collection has the following schema:

```typescript
{
  _id: ObjectId,
  name: string,
  email: string,
  password: string, // Hashed with bcryptjs
  standard: string | null,
  createdAt: Date,
  weaktopics: string[],
  result: object | null,
  onlineDates: object | null,
  amount: number | null
}
```

## Authentication Flow

1. User signs up with email and password
2. Password is hashed using bcryptjs before storing in MongoDB
3. User signs in with email and password
4. NextAuth verifies credentials and creates a session
5. Protected routes check for valid session

## API Routes

All API routes now use MongoDB directly:

- `/api/auth/[...nextauth]` - Authentication endpoints
- `/api/signup` - User registration
- `/api/dashboard` - User dashboard data
- `/api/chat` - Chat functionality
- `/api/quiz` - Quiz functionality
- `/api/result` - Quiz results

## Benefits of Direct MongoDB Usage

1. **Better Performance**: Direct MongoDB queries can be more efficient than going through an ORM
2. **More Control**: Full control over database operations and queries
3. **Simpler Stack**: Fewer dependencies and abstraction layers
4. **Better Security**: Proper password hashing and authentication flow

## Future Improvements

1. Add more robust error handling
2. Implement rate limiting for API routes
3. Add more comprehensive validation
4. Implement database connection pooling for better performance

# Connecting to MongoDB Compass

## Step 1: Install MongoDB Compass
If you haven't already installed MongoDB Compass, download it from the official website:
https://www.mongodb.com/try/download/compass

## Step 2: Connect to your local MongoDB
1. Open MongoDB Compass
2. In the connection string field, enter: `mongodb://localhost:27017/`
3. Click "Connect"

## Step 3: Create a new database
1. Click the "+" button next to "Databases"
2. Enter "atlas-ai" as the database name
3. Enter "users" as the collection name
4. Click "Create Database"

## Step 4: Create a sample user document
1. Navigate to the "atlas-ai" database
2. Click on the "users" collection
3. Click "Add Data" > "Insert Document"
4. Paste the following JSON:
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "standard": "10th",
  "weaktopics": ["Math", "Science"],
  "createdAt": new Date()
}
```
5. Click "Insert"

## Step 5: Update the .env file
Make sure your .env file has the correct MongoDB connection string:
```
DATABASE_URL="mongodb://localhost:27017/atlas-ai"
```

## Step 6: Restart your application
After setting up the database, restart your Next.js application to connect to the MongoDB database.

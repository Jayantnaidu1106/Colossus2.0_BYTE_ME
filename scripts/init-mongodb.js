// scripts/init-mongodb.js
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// MongoDB connection URL
const url = process.env.DATABASE_URL || "mongodb://localhost:27017/atlas-ai";

async function main() {
  const client = new MongoClient(url);

  try {
    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();

    // Check if users collection exists
    const collections = await db.listCollections({ name: 'users' }).toArray();
    
    // Create users collection with validation if it doesn't exist
    if (collections.length === 0) {
      await db.createCollection('users', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['name', 'email', 'password', 'createdAt'],
            properties: {
              name: {
                bsonType: 'string',
                description: 'Name is required and must be a string'
              },
              email: {
                bsonType: 'string',
                description: 'Email is required and must be a string'
              },
              password: {
                bsonType: 'string',
                description: 'Password is required and must be a string'
              },
              standard: {
                bsonType: ['string', 'null'],
                description: 'Standard must be a string or null'
              },
              createdAt: {
                bsonType: 'date',
                description: 'Created date is required and must be a date'
              },
              weaktopics: {
                bsonType: 'array',
                description: 'Weak topics must be an array of strings',
                items: {
                  bsonType: 'string'
                }
              },
              result: {
                bsonType: ['object', 'null'],
                description: 'Result must be an object or null'
              },
              onlineDates: {
                bsonType: ['object', 'null'],
                description: 'Online dates must be an object or null'
              },
              amount: {
                bsonType: ['double', 'null'],
                description: 'Amount must be a double or null'
              }
            }
          }
        }
      });
      
      // Create a unique index on email
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      
      console.log('Users collection created with schema validation');
    }

    // Check if test user exists
    const existingUser = await db.collection('users').findOne({ email: 'test@example.com' });
    
    if (!existingUser) {
      // Hash the password
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      // Create a test user
      const result = await db.collection('users').insertOne({
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        standard: '10th',
        weaktopics: ['Math', 'Science'],
        createdAt: new Date()
      });
      
      console.log('Test user created:', result.insertedId);
    } else {
      console.log('Test user already exists');
    }

  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

main();

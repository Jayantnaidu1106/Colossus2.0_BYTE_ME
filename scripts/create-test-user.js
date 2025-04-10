// scripts/create-test-user.js
const { MongoClient } = require('mongodb');

async function main() {
  // Connection URL
  const url = 'mongodb://localhost:27017';
  const client = new MongoClient(url);

  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected to MongoDB server');

    // Get the database
    const db = client.db('atlas-ai-1');
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email: 'test@example.com' });
    
    if (existingUser) {
      console.log('User already exists, updating with test data');
      
      // Update the existing user with test data
      await db.collection('users').updateOne(
        { email: 'test@example.com' },
        { 
          $set: {
            weaktopics: ['Algebra', 'Chemistry', 'Physics'],
            result: [
              { quizNumber: 1, score: 75 },
              { quizNumber: 2, score: 82 },
              { quizNumber: 3, score: 68 },
              { quizNumber: 4, score: 90 }
            ]
          }
        }
      );
    } else {
      // Create a new test user with dashboard data
      await db.collection('users').insertOne({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        standard: '10th',
        createdAt: new Date(),
        weaktopics: ['Algebra', 'Chemistry', 'Physics'],
        result: [
          { quizNumber: 1, score: 75 },
          { quizNumber: 2, score: 82 },
          { quizNumber: 3, score: 68 },
          { quizNumber: 4, score: 90 }
        ]
      });
      
      console.log('Created new test user with dashboard data');
    }

    console.log('Test user setup complete');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    await client.close();
    console.log('Disconnected from MongoDB server');
  }
}

main();

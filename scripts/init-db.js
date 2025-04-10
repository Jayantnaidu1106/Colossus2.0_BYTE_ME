// scripts/init-db.js
const { PrismaClient } = require('@prisma/client');

// Create a Prisma client instance with an explicit connection URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "mongodb://localhost:27017/atlas-ai",
    },
  },
});

async function main() {
  try {
    // Create a test user
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        standard: '10th',
        weaktopics: ['Math', 'Science'],
      },
    });

    console.log('Database initialized with test user:', user);
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

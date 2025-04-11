import { initUserCollection } from './models/user';

// Initialize all collections with schema validation
export async function initDatabase() {
  try {
    // Initialize user collection
    await initUserCollection();
    
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Export a function to be called during app startup
export default async function initDatabaseOnStartup() {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Initializing database in development mode...');
    await initDatabase();
  } else {
    console.log('Skipping automatic database initialization in production');
    // In production, you might want to run this manually or during deployment
  }
}

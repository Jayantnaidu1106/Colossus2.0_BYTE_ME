import { initUserCollection } from './models/user';

// This file will be imported by server components and API routes
// to ensure the database is initialized

let initialized = false;

export async function initServerDatabase() {
  // Only initialize once
  if (initialized) return;
  
  try {
    console.log('Initializing MongoDB collections...');
    await initUserCollection();
    initialized = true;
    console.log('MongoDB collections initialized successfully');
  } catch (error) {
    console.error('Failed to initialize MongoDB collections:', error);
    // Don't set initialized to true if there was an error
  }
}

// Call initialization immediately when this module is imported
initServerDatabase();

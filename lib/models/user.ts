import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import clientPromise from '../mongodb';

// Ensure this code only runs on the server
if (typeof window !== 'undefined') {
  throw new Error('This module should only be used on the server side');
}

// MongoDB schema for User collection
export const userSchema = {
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
};

// User model interface
export interface User {
  _id?: ObjectId;
  id?: string;
  name: string;
  email: string;
  password: string;
  standard?: string | null;
  createdAt: Date;
  weaktopics: string[];
  result?: any;
  onlineDates?: any;
  amount?: number;
}

// User model class with static methods
export class UserModel {
  // Create a new user
  static async create(userData: Omit<User, '_id' | 'id' | 'createdAt'>): Promise<User> {
    const client = await clientPromise;
    const db = client.db();

    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = {
      ...userData,
      password: hashedPassword,
      createdAt: new Date(),
      weaktopics: userData.weaktopics || []
    };

    const result = await db.collection('users').insertOne(newUser);
    return {
      ...newUser,
      _id: result.insertedId
    };
  }

  // Find a user by email
  static async findByEmail(email: string): Promise<User | null> {
    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection('users').findOne({ email });
    return user;
  }

  // Find a user by ID
  static async findById(id: string): Promise<User | null> {
    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
    return user;
  }

  // Update a user
  static async update(id: string, updateData: Partial<User>): Promise<User | null> {
    const client = await clientPromise;
    const db = client.db();

    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    return result;
  }

  // Verify password
  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

// Initialize the collection with schema validation
export async function initUserCollection() {
  const client = await clientPromise;
  const db = client.db();

  // Check if the collection exists
  const collections = await db.listCollections({ name: 'users' }).toArray();

  if (collections.length === 0) {
    // Create the collection with validation
    await db.createCollection('users', { validator: userSchema.validator });

    // Create a unique index on email
    await db.collection('users').createIndex({ email: 1 }, { unique: true });

    console.log('Users collection initialized with schema validation');
  } else {
    // Update the validation schema for existing collection
    await db.command({
      collMod: 'users',
      validator: userSchema.validator
    });

    console.log('Users collection validation schema updated');
  }
}

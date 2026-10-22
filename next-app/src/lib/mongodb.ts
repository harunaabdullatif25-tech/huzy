// src/lib/mongodb.ts
// MongoDB connection helper for Next.js (App Router) using Mongoose

import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}
import mongoose from 'mongoose';

// Cache the connection across hot-reloads in development
let cached = (global as any).mongoose;
if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB using the connection string from environment variable `MONGODB_URI`.
 * The function returns the existing connection if already established.
 */
export async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('Please define the MONGODB_URI environment variable');
    }
    const opts = {
      // options to avoid deprecation warnings
      bufferCommands: false,
    } as mongoose.ConnectOptions;
    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;

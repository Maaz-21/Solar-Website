import mongoose from 'mongoose';
import dns from 'dns';
import util from 'util';

const resolveSrv = util.promisify(dns.resolveSrv);

// Global is used here to maintain a cached connection across hot reloads
// in development. This prevents connections growing exponentially
// during API Route usage.
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function resolveMongoURI(uri) {
  if (!uri || !uri.startsWith('mongodb+srv://')) return uri;

  try {
    // Extract hostname
    // Format: mongodb+srv://user:pass@hostname/db?opts
    const parts = uri.split('@');
    if (parts.length < 2) return uri;

    const credentials = parts[0].replace('mongodb+srv://', 'mongodb://');
    const rightPart = parts[1];
    const slashIndex = rightPart.indexOf('/');
    
    const hostname = slashIndex !== -1 ? rightPart.substring(0, slashIndex) : rightPart;
    const pathAndQuery = slashIndex !== -1 ? rightPart.substring(slashIndex) : '';

    console.log(`Attempting manual SRV resolution for ${hostname}...`);
    const addresses = await resolveSrv(`_mongodb._tcp.${hostname}`);
    
    if (!addresses || addresses.length === 0) {
      console.warn("No SRV records found, falling back to original URI");
      return uri;
    }

    const hostList = addresses.map(a => `${a.name}:${a.port}`).join(',');
    
    let newUri = `${credentials}@${hostList}${pathAndQuery}`;
    
    // Append ssl=true and authSource=admin if not present
    const separator = newUri.includes('?') ? '&' : '?';
    if (!newUri.includes('ssl=')) newUri += `${separator}ssl=true`;
    if (!newUri.includes('authSource=')) newUri += `&authSource=admin`;

    console.log("Resolved MongoDB URI manually to bypass SRV lookup");
    return newUri;
  } catch (e) {
    console.error("Failed to resolve SRV manually:", e);
    return uri; // Fallback to original
  }
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    };

    let MONGO_URI = process.env.MONGO_URI;
    
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is missing in environment variables!");
    }

    // Attempt to resolve SRV manually to avoid ETIMEOUT
    MONGO_URI = await resolveMongoURI(MONGO_URI);

    console.log("Connecting to MongoDB...");
    cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
      console.log("MongoDB Connected Successfully");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("MongoDB connection error:", e);
    throw e;
  }

  return cached.conn;
}

export default connectDB;

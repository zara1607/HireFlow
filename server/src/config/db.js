const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hireflow';

  try {
    // Attempt connecting to the provided MONGODB_URI with a 3.5s timeout
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3500,
    });
    console.log(`[MongoDB] Connected to database: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.warn(`[MongoDB] Could not connect to primary URI (${uri}): ${err.message}`);

    // If in development or testing and primary connection fails, start in-memory MongoDB
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('[MongoDB] Starting in-memory MongoDB server for local development...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongod = await MongoMemoryServer.create();
        const memUri = mongod.getUri();
        const conn = await mongoose.connect(memUri);
        console.log(`[MongoDB] Connected to in-memory fallback database at: ${memUri}`);
      } catch (memErr) {
        console.error('[MongoDB] Failed to start in-memory database:', memErr.message);
        throw memErr;
      }
    } else {
      throw err;
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};

module.exports = { connectDB, disconnectDB };

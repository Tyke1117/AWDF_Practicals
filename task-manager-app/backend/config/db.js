const mongoose = require("mongoose");

/**
 * Connect to MongoDB database via Mongoose ODM.
 * In a Dockerized multi-container setup (Docker Compose),
 * containers communicate via their Compose service name (e.g. 'mongodb')
 * over the custom bridge network, instead of 'localhost'.
 */
const connectDB = async () => {
  // Read MONGO_URI or MONGODB_URI; fallback to Docker compose service hostname 'mongodb'
  const uri =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    "mongodb://mongodb:27017/taskdb";

  console.log(`[Database] Attempting connection to MongoDB at: ${uri}`);

  const maxRetries = 5;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      attempt++;
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(
        `[Database] MongoDB Connected successfully: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`
      );
      return;
    } catch (error) {
      console.error(
        `[Database Error] Attempt ${attempt}/${maxRetries} failed: ${error.message}`
      );
      if (attempt < maxRetries) {
        console.log(`[Database] Retrying connection in 3 seconds...`);
        await new Promise((res) => setTimeout(res, 3000));
      } else {
        console.error(
          `[Database Critical] Could not connect to MongoDB after ${maxRetries} attempts.`
        );
      }
    }
  }
};

module.exports = connectDB;

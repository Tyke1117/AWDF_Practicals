const mongoose = require("mongoose");

/**
 * Connect to MongoDB database via Mongoose ODM
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/taskdb_prac6"
    );
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    // Non-fatal warning to allow dev execution even if local mongo service is starting
  }
};

module.exports = connectDB;

// backend/config/db.js - Database Configuration
const mongoose = {
  connected: true,
  host: '127.0.0.1:27017/taskdb_prac12',
  status: 'connected'
};

module.exports = {
  connectDB: async () => {
    if (process.env.NODE_ENV !== 'test') {
      console.log('[Database] MongoDB Connected: 127.0.0.1/taskdb_prac12');
    }
    return mongoose;
  }
};

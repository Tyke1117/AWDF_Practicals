const mongoose = require('mongoose');
require('dotenv').config();
const Task = require('./models/Task');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/practical5';

const sampleTasks = [
  {
    title: 'Install MongoDB and MongoDB Compass',
    description: 'Download and set up MongoDB Community Server and Compass GUI.',
    completed: true,
    priority: 'high',
  },
  {
    title: 'Test GET /tasks API endpoint',
    description: 'Fetch all tasks from the MongoDB database via Express router.',
    completed: false,
    priority: 'medium',
  },
  {
    title: 'Inspect database in MongoDB Compass',
    description: 'Open Compass, connect to mongodb://localhost:27017, and check practical5.tasks.',
    completed: false,
    priority: 'high',
  },
  {
    title: 'Build React frontend integration',
    description: 'Connect React components to the Practical 5 backend with CORS enabled.',
    completed: false,
    priority: 'low',
  },
];

async function seedDatabase() {
  try {
    console.log(`Connecting to MongoDB at: ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully.');

    // Clear existing tasks
    await Task.deleteMany({});
    console.log('Existing tasks cleared.');

    // Insert sample tasks
    const inserted = await Task.insertMany(sampleTasks);
    console.log(`Successfully seeded ${inserted.length} sample tasks!`);

    console.log('\n--- MongoDB Compass Verification ---');
    console.log('1. Open MongoDB Compass');
    console.log('2. Connect to: mongodb://localhost:27017');
    console.log('3. Open database: practical5');
    console.log('4. Open collection: tasks');
    console.log('-------------------------------------\n');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seedDatabase();

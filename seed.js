require("dotenv").config();
const mongoose = require("mongoose");
const Task = require("./models/Task");

const sampleTasks = [
  {
    title: "Implement Redis Caching Layer",
    description: "Evaluate Redis cluster vs local node-cache for distributed caching in production.",
    completed: false,
    priority: "high",
    tags: ["architecture", "caching", "backend"]
  },
  {
    title: "Database Index Optimization",
    description: "Create compound indexes on frequently queried fields (status, priority, createdAt).",
    completed: true,
    priority: "high",
    tags: ["database", "mongodb", "performance"]
  },
  {
    title: "Configure CORS & Helmet Security Headers",
    description: "Harden API against cross-site scripting and unauthorized domain origin requests.",
    completed: true,
    priority: "medium",
    tags: ["security", "express"]
  },
  {
    title: "Setup API Rate Limiting",
    description: "Prevent brute-force and DoS attacks by restricting burst traffic per IP.",
    completed: false,
    priority: "high",
    tags: ["security", "middleware"]
  },
  {
    title: "Write End-to-End Jest Integration Tests",
    description: "Cover all CRUD task endpoints with automated test assertions.",
    completed: false,
    priority: "medium",
    tags: ["testing", "qa"]
  },
  {
    title: "Refactor Controller to Service Pattern",
    description: "Decouple HTTP request parsing from business domain and data access logic.",
    completed: false,
    priority: "low",
    tags: ["refactoring", "clean-code"]
  },
  {
    title: "Implement JWT Token Refresh Rotation",
    description: "Secure user sessions using short-lived access tokens and refresh tokens in HTTP-only cookies.",
    completed: true,
    priority: "high",
    tags: ["auth", "security"]
  },
  {
    title: "Dockerize Express and MongoDB Services",
    description: "Provide a docker-compose.yml file for consistent multi-environment developer setup.",
    completed: false,
    priority: "medium",
    tags: ["devops", "docker"]
  },
  {
    title: "Measure P99 Latency with autocannon / k6",
    description: "Conduct load testing under concurrent client conditions to verify cache efficacy.",
    completed: false,
    priority: "high",
    tags: ["benchmarking", "performance"]
  },
  {
    title: "Draft Practical 9 Lab Report & Documentation",
    description: "Record uncached vs cached response times and submit lab journal observations.",
    completed: true,
    priority: "high",
    tags: ["documentation", "college"]
  }
];

// Generate an extended set of tasks (50 total) to ensure realistic database query payload
const generateExpandedTasks = () => {
  const priorities = ["low", "medium", "high"];
  const categories = ["DevOps", "Frontend", "Backend", "Database", "Security", "Analytics", "Testing"];
  const extended = [...sampleTasks];

  for (let i = 11; i <= 50; i++) {
    const cat = categories[i % categories.length];
    const prio = priorities[i % priorities.length];
    extended.push({
      title: `${cat} Task #${i}: Implement benchmark scenario for batch operations`,
      description: `Comprehensive evaluation of system resource utilization during ${cat.toLowerCase()} query execution with payload simulation index ${i}.`,
      completed: i % 3 === 0,
      priority: prio,
      tags: [cat.toLowerCase(), "optimization", `batch-${i % 5}`],
      dueDate: new Date(Date.now() + i * 86400000)
    });
  }
  return extended;
};

const seedDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/taskdb_prac9";
    await mongoose.connect(uri);
    console.log(`[Seed] Connected to database: ${uri}`);

    // Clear existing tasks
    await Task.deleteMany({});
    console.log("[Seed] Cleared existing tasks from database.");

    // Insert sample tasks
    const tasksToInsert = generateExpandedTasks();
    const inserted = await Task.insertMany(tasksToInsert);
    console.log(`[Seed] Successfully inserted ${inserted.length} tasks into MongoDB.`);

    // Build indexes
    await Task.syncIndexes();
    console.log("[Seed] Compound and single-field query indexes synchronized.");

    await mongoose.disconnect();
    console.log("[Seed] Database disconnected. Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] Failed to seed database: ${error.message}`);
    process.exit(1);
  }
};

seedDB();

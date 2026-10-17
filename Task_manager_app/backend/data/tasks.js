// In-memory data store (no database — resets on server restart)
const tasks = [
  {
    id: 1,
    title: "Set up Express server",
    description: "Initialize project and install dependencies",
    status: "done"
  },
  {
    id: 2,
    title: "Build CRUD routes",
    description: "Implement GET, POST, PUT, DELETE for /tasks",
    status: "in-progress"
  },
  {
    id: 3,
    title: "Connect React frontend",
    description: "Wire up Axios calls to the API",
    status: "pending"
  }
];

module.exports = { tasks };

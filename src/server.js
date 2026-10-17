const app = require('./app');

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log('=========================================');
    console.log('Task Management API Server Running');
    console.log(`Port: ${PORT}`);
    console.log(`Health Check: http://localhost:${PORT}/`);
    console.log(`Endpoints:    http://localhost:${PORT}/tasks`);
    console.log('=========================================');
  });
}

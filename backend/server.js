const app = require('./app');
const connectDB = require('./config/db');
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on the PORT ${PORT}`);
})

// app.js -> responsible for creating express app, middlewares, routes, error handling
// server.js -> responsible for loading env, Connecting to the database, starting the server
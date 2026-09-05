import "dotenv/config";
import app from "./app.js";
import prisma from "./config/prisma.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try{
    await prisma.$connect();
    console.log("PostgreSQL database connected successfully");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  }
  catch(err){
    console.error("Error connecting to the database", err);
    process.exit(1);
  }
};

startServer();








// app.js -> responsible for creating express app, middlewares, routes, error handling
// server.js -> responsible for loading env, Connecting to the database, starting the server
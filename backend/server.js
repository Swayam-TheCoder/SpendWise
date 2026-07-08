const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { success } = require('zod');

dotenv.config();
connectDB();

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())
app.use(helmet());
app.use(cookieParser());
app.use(morgan("dev"));

// Health route check
app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Expense Tracker API is running"
  })
})

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on the PORT ${PORT}`);
})



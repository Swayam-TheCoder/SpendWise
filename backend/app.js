const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

dotenv.config();

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

module.exports = app;
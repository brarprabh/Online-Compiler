const path = require('path');
// Force Node to look for .env in the CURRENT folder (__dirname)
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

console.log("DEBUG: JWT_SECRET is:", process.env.JWT_SECRET);

const express = require('express');
const app = express();

const cors = require('cors');
const connectDB = require('./server/config/db');
const authRoutes = require('./server/routes/authRoutes');
const problemRoutes = require('./server/routes/problemRoutes');
const { initializeTags } = require('./server/services/initializeTags');

connectDB().then(() => {
  initializeTags();
});


// 1. Middleware
// This parses incoming requests with JSON payloads (e.g., { "language": "cpp", "code": "..." })
// Without this, req.body would be undefined.
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use('/', authRoutes);
app.use('/', problemRoutes);

app.listen(5000, () => {
  console.log('Listening on port 5000!');
});
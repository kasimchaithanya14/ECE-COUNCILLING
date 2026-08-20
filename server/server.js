import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './db.js';
import apiRouter from './routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Enable CORS
app.use(cors({
  origin: true,
  credentials: true
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Route Mount
app.use('/api', apiRouter);

// Base Route
app.get('/', (req, res) => {
  res.json({ message: 'Dhanekula Institute Academic Portal Backend API is active.' });
});

// Start Server & Initialize Database
const startServer = async () => {
  try {
    console.log('Initializing database schema...');
    await initDb();
    
    app.listen(PORT, () => {
      console.log(`Backend server successfully running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Fatal: Failed to start backend server:', error);
    process.exit(1);
  }
};

startServer();

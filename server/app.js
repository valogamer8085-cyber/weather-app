import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import weatherRouter from './routes/weather.js';
import { errorHandler } from './utils/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Parsing Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets
app.use(express.static(path.join(ROOT_DIR, 'public')));

// Mount API routes
app.use('/api', weatherRouter);

// Fallback route for SPA - send index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(ROOT_DIR, 'public', 'index.html'));
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🌤️ Weather Forecasting Application Server Active`);
  console.log(`🌐 Server running at: http://localhost:${PORT}`);
  console.log(`📡 Mode: ${process.env.OPENWEATHER_API_KEY || process.env.WEATHERAPI_KEY ? 'Live Weather API' : 'Mock Fallback Engine'}`);
  console.log(`=================================================`);
});

export default app;

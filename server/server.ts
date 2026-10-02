import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';
import { app } from './app.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

// Serve static frontend files in production
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[RITAM REVIEW AGENCY] Educational Server running on http://0.0.0.0:${PORT}`);
});

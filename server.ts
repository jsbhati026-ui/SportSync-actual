import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT && process.env.PORT !== '8080' ? process.env.PORT : 3000;

app.use(express.json());

const distPath = path.resolve(__dirname, 'dist');

// Serve static assets from dist
app.use(express.static(distPath));

// Health check endpoint
app.get('/healthz', (_req, res) => {
  res.status(200).send('OK');
});

// Single Page Application (SPA) fallback - serve index.html for client-side routing
app.get('*', (_req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Application build not found. Please run npm run build.');
  }
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`SportSync production server is running on http://0.0.0.0:${PORT}`);
});

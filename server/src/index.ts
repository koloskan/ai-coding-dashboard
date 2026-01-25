import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import routes from './routes';
import { loadAllCSVData } from './data/csvLoader';
import { getDataStoreStatus } from './data/dataStore';

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  const dataStatus = getDataStoreStatus();
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    dataLoaded: dataStatus.loaded,
    filesLoaded: dataStatus.filesLoaded,
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// Initialize server with data loading
async function startServer(): Promise<void> {
  try {
    // Load all CSV data before starting the server
    console.log('');
    console.log('📂 Loading CSV data from /data folder...');
    console.log('');
    
    await loadAllCSVData();
    
    // Start the Express server
    app.listen(PORT, () => {
      console.log('');
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📊 Marketing Dashboard API ready`);
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;

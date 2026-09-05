// =======================================================
// SevaSetu Full-Stack Application Server
// Node.js + Express.js + JavaScript + Vite Integration
// Connected to MySQL schema: sevasetu (8 Tables)
// =======================================================

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

// API Route Handlers
import authRoutes from './server/routes/auth.js';
import eventsRoutes from './server/routes/events.js';
import volunteerApplicationsRoutes from './server/routes/volunteerApplications.js';
import donationsRoutes from './server/routes/donations.js';
import feedbackRoutes from './server/routes/feedback.js';
import certificatesRoutes from './server/routes/certificates.js';
import ngosRoutes from './server/routes/ngos.js';
import volunteersRoutes from './server/routes/volunteers.js';
import adminRoutes from './server/routes/admin.js';
import campaignsRoutes from './server/routes/campaigns.js';
import helpRequestsRoutes from './server/routes/helpRequests.js';
import contactRoutes from './server/routes/contact.js';
import savedNgosRoutes from './server/routes/savedNgos.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser & URL-encoded parser
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check & Database Status
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'SevaSetu Social Impact API',
      database: 'sevasetu (MySQL)',
      tables: [
        'users',
        'ngos',
        'volunteers',
        'events',
        'volunteer_applications',
        'donations',
        'feedback',
        'certificates',
      ],
      timestamp: new Date().toISOString(),
      runtime: 'Node.js + Express.js + JavaScript',
    });
  });

  // Mount Primary 8-Table API Endpoints
  app.use('/api/auth', authRoutes);
  app.use('/api/events', eventsRoutes);
  app.use('/api/volunteer-applications', volunteerApplicationsRoutes);
  app.use('/api/donations', donationsRoutes);
  app.use('/api/feedback', feedbackRoutes);
  app.use('/api/certificates', certificatesRoutes);
  app.use('/api/ngos', ngosRoutes);
  app.use('/api/volunteers', volunteersRoutes);
  app.use('/api/admin', adminRoutes);

  // Additional complementary endpoints
  app.use('/api/campaigns', campaignsRoutes);
  app.use('/api/help-requests', helpRequestsRoutes);
  app.use('/api/contact', contactRoutes);
  app.use('/api/saved-ngos', savedNgosRoutes);

  // Serve Frontend via Vite dev middleware or static dist
  if (process.env.NODE_ENV !== 'production') {
    console.log('[SevaSetu] Initializing Vite dev middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SevaSetu] Server running at http://localhost:${PORT}`);
    console.log(`[SevaSetu] API endpoints available under /api/*`);
  });
}

startServer().catch((err) => {
  console.error('[SevaSetu Server Startup Error]:', err);
});

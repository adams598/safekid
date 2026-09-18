import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth';
import { childrenRouter } from './routes/children';
import { zonesRouter } from './routes/zones';
import { trackingRouter } from './routes/tracking';
import { directionsRouter } from './routes/directions';
import { setupSocketHandlers } from './socket';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL ?? '*',
    methods: ['GET', 'POST'],
  },
});

// ── Middleware ────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL ?? '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { error: 'Trop de requêtes, réessayez dans 15 minutes.' },
  }),
);

// ── Routes ────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/children', childrenRouter);
app.use('/api/zones', zonesRouter);
app.use('/api/tracking', trackingRouter);
app.use('/api/directions', directionsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() });
});

// ── Socket.io ─────────────────────────────────────────────────────
setupSocketHandlers(io);

// ── Start ─────────────────────────────────────────────────────────
const PORT = process.env.PORT ?? 3000;
httpServer.listen(PORT, () => {
  console.log(`🛡️  SafeKid Server running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
});

export { io };

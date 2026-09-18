import { Router, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { DBLocationPoint } from '../models';
import { io } from '../index';

export const trackingRouter = Router();
trackingRouter.use(authMiddleware);

// In-memory circular buffer — replace with time-series DB in production
const locationHistory: DBLocationPoint[] = [];
const MAX_HISTORY = 10000;

// This endpoint is called by the chip/device when it sends a location update
trackingRouter.post('/location', (req: AuthRequest, res: Response) => {
  const { chipId, childId, latitude, longitude, speed, accuracy, batteryLevel } = req.body;

  if (!chipId || !childId || latitude == null || longitude == null) {
    res.status(400).json({ success: false, error: 'Données de localisation incomplètes.' });
    return;
  }

  const point: DBLocationPoint = {
    id: uuid(),
    chipId,
    childId,
    latitude: Number(latitude),
    longitude: Number(longitude),
    speed: Number(speed ?? 0),
    accuracy: Number(accuracy ?? 0),
    timestamp: new Date(),
  };

  locationHistory.push(point);
  if (locationHistory.length > MAX_HISTORY) {
    locationHistory.shift();
  }

  // Broadcast to all parents watching this child
  io.to(`child:${childId}`).emit('location:update', {
    chipId,
    childId,
    latitude: point.latitude,
    longitude: point.longitude,
    speed: point.speed,
    accuracy: point.accuracy,
    batteryLevel: Number(batteryLevel ?? 100),
    timestamp: point.timestamp.toISOString(),
  });

  res.json({ success: true, message: 'Position enregistrée.' });
});

// Get location history for a child
trackingRouter.get('/history/:childId', (req: AuthRequest, res: Response) => {
  const { childId } = req.params;
  const { limit = '50', date } = req.query;

  let points = locationHistory.filter((p) => p.childId === childId);

  if (date) {
    const d = new Date(date as string);
    points = points.filter((p) => {
      const pd = new Date(p.timestamp);
      return (
        pd.getFullYear() === d.getFullYear() &&
        pd.getMonth() === d.getMonth() &&
        pd.getDate() === d.getDate()
      );
    });
  }

  // Return most recent first
  const result = points
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, Number(limit));

  res.json({ success: true, data: result });
});

// Get last known position
trackingRouter.get('/last/:childId', (req: AuthRequest, res: Response) => {
  const { childId } = req.params;
  const last = [...locationHistory]
    .reverse()
    .find((p) => p.childId === childId);

  if (!last) {
    res.status(404).json({ success: false, error: 'Aucune position disponible.' });
    return;
  }
  res.json({ success: true, data: last });
});

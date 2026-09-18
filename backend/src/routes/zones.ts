import { Router, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { ApiResponse, DBSafeZone } from '../models';

export const zonesRouter = Router();
zonesRouter.use(authMiddleware);

const zones: DBSafeZone[] = [];

zonesRouter.get('/', (req: AuthRequest, res: Response) => {
  const userZones = zones.filter((z) => z.userId === req.userId);
  res.json({ success: true, data: userZones });
});

zonesRouter.get('/child/:childId', (req: AuthRequest, res: Response) => {
  const childZones = zones.filter(
    (z) => z.childId === req.params.childId && z.userId === req.userId,
  );
  res.json({ success: true, data: childZones });
});

zonesRouter.post('/', (req: AuthRequest, res: Response) => {
  const {
    childId, name, address,
    centerLatitude, centerLongitude,
    radiusMeters, type, notifyOnEntry, notifyOnExit, color,
  } = req.body;

  if (!childId || !name || !centerLatitude || !centerLongitude || !radiusMeters) {
    res.status(400).json({ success: false, error: 'Données de zone incomplètes.' });
    return;
  }

  const zone: DBSafeZone = {
    id: uuid(),
    childId,
    userId: req.userId!,
    name,
    address: address ?? '',
    centerLatitude: Number(centerLatitude),
    centerLongitude: Number(centerLongitude),
    radiusMeters: Number(radiusMeters),
    type: type ?? 'custom',
    isActive: true,
    notifyOnEntry: notifyOnEntry ?? true,
    notifyOnExit: notifyOnExit ?? true,
    color: color ?? '#5B6EF8',
    createdAt: new Date(),
  };

  zones.push(zone);
  res.status(201).json({ success: true, data: zone });
});

zonesRouter.put('/:id', (req: AuthRequest, res: Response) => {
  const idx = zones.findIndex((z) => z.id === req.params.id && z.userId === req.userId);
  if (idx === -1) {
    res.status(404).json({ success: false, error: 'Zone introuvable.' });
    return;
  }
  zones[idx] = { ...zones[idx], ...req.body };
  res.json({ success: true, data: zones[idx] });
});

zonesRouter.delete('/:id', (req: AuthRequest, res: Response) => {
  const idx = zones.findIndex((z) => z.id === req.params.id && z.userId === req.userId);
  if (idx === -1) {
    res.status(404).json({ success: false, error: 'Zone introuvable.' });
    return;
  }
  zones.splice(idx, 1);
  res.json({ success: true, message: 'Zone supprimée.' });
});

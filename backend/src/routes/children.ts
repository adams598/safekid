import { Router, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { ApiResponse, DBChild } from '../models';

export const childrenRouter = Router();
childrenRouter.use(authMiddleware);

const children: DBChild[] = [];

childrenRouter.get('/', (req: AuthRequest, res: Response) => {
  const userChildren = children.filter((c) => c.userId === req.userId);
  const response: ApiResponse = { success: true, data: userChildren };
  res.json(response);
});

childrenRouter.post('/', (req: AuthRequest, res: Response) => {
  const { name, age, color } = req.body;
  if (!name || !age) {
    res.status(400).json({ success: false, error: 'Nom et âge requis.' });
    return;
  }

  const child: DBChild = {
    id: uuid(),
    userId: req.userId!,
    name,
    age: Number(age),
    chipId: '',
    color: color ?? '#5B6EF8',
    createdAt: new Date(),
  };
  children.push(child);

  const response: ApiResponse = { success: true, data: child };
  res.status(201).json(response);
});

childrenRouter.put('/:id', (req: AuthRequest, res: Response) => {
  const idx = children.findIndex((c) => c.id === req.params.id && c.userId === req.userId);
  if (idx === -1) {
    res.status(404).json({ success: false, error: 'Enfant introuvable.' });
    return;
  }
  children[idx] = { ...children[idx], ...req.body };
  res.json({ success: true, data: children[idx] });
});

childrenRouter.delete('/:id', (req: AuthRequest, res: Response) => {
  const idx = children.findIndex((c) => c.id === req.params.id && c.userId === req.userId);
  if (idx === -1) {
    res.status(404).json({ success: false, error: 'Enfant introuvable.' });
    return;
  }
  children.splice(idx, 1);
  res.json({ success: true, message: 'Enfant supprimé.' });
});

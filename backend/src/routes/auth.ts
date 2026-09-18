import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { ApiResponse, DBUser } from '../models';

export const authRouter = Router();

// In-memory store (replace with real DB)
const users: DBUser[] = [];

authRouter.post('/register', async (req: Request, res: Response) => {
  const { fullName, email, phone, password, country } = req.body;

  if (!fullName || !email || !phone || !password) {
    const response: ApiResponse = { success: false, error: 'Tous les champs sont requis.' };
    res.status(400).json(response);
    return;
  }

  const existing = users.find((u) => u.email === email);
  if (existing) {
    const response: ApiResponse = { success: false, error: 'Cet email est déjà utilisé.' };
    res.status(409).json(response);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user: DBUser = {
    id: uuid(),
    fullName,
    email: email.toLowerCase(),
    phone,
    country: country ?? 'CM',
    passwordHash,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  users.push(user);

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET ?? 'safekid_secret',
    { expiresIn: '30d' },
  );

  const response: ApiResponse = {
    success: true,
    data: {
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email, phone: user.phone, country: user.country },
    },
  };
  res.status(201).json(response);
});

authRouter.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const response: ApiResponse = { success: false, error: 'Email et mot de passe requis.' };
    res.status(400).json(response);
    return;
  }

  const user = users.find((u) => u.email === email.toLowerCase());
  if (!user) {
    const response: ApiResponse = { success: false, error: 'Email ou mot de passe incorrect.' };
    res.status(401).json(response);
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const response: ApiResponse = { success: false, error: 'Email ou mot de passe incorrect.' };
    res.status(401).json(response);
    return;
  }

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET ?? 'safekid_secret',
    { expiresIn: '30d' },
  );

  const response: ApiResponse = {
    success: true,
    data: {
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email, phone: user.phone, country: user.country },
    },
  };
  res.json(response);
});

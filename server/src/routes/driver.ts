import express, { Request, Response } from 'express';
import { clerkAuthMiddleware } from '../middleware/clerkAuth';
import driver from '../models/driver';

const router = express.Router();

router.post(
  '/',
  clerkAuthMiddleware,
  async (req: Request & { userId?: string }, res: Response) => {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { name, license, vehicle } = req.body;

    const newDriver = new driver({
      name,
      license,
      vehicle,
      clerkUserId: userId,
    });

    await newDriver.save();

    res.status(201).json({ message: 'Driver created', driver: newDriver });
  }
);

export default router;

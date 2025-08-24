import express, { Request, Response } from 'express';
import { clerkAuthMiddleware } from '../middleware/clerkAuth';
import { DriverTable } from '../models/Driver';


const router = express.Router();

router.post(
  '/',
  clerkAuthMiddleware,
  async (req: Request & { userId?: string }, res: Response) => {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const {
      name,
      age,
      licenseNumber,
      vehicleModel,
      vehicleYear,
      plateNumber,
      province,
      userTableId, // Pass User _id from frontend if available
    } = req.body;

    try {
      const newDriver = await DriverTable.create({
        name,
        age,
        licenseNumber,
        vehicleModel,
        vehicleYear,
        plateNumber,
        province,
        externalUserId: userId,
        userId: userTableId, // Reference to User table (_id)
      });

      res.status(201).json({ message: 'Driver created', driver: newDriver });
    } catch (error) {
      res.status(500).json({ message: 'Error creating driver', error });
    }
  }
);

export default router;

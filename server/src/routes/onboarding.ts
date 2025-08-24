import express, { Request, Response } from 'express';
import { requireAuth } from '@clerk/express';
import { UserTable } from '../models/User';
import { DriverTable } from '../models/Driver';


const router = express.Router();

// 1. GET /onboardingStatus - Get user's onboarding status and role
router.get('/status', requireAuth(), async (req: Request, res: Response) => {
  const { userId } = req.auth as { userId: string };
  try {
    const user = await UserTable.findOne({ externalUserId: userId });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ isOnboarded: user.isOnboarded, role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. POST /onboard/rider - Complete onboarding as rider
router.post('/rider', requireAuth(), async (req: Request, res: Response) => {
  const { userId } = req.auth as { userId: string };
  const { name, emailId, province, username } = req.body;
  try {
    const user = await UserTable.findOneAndUpdate(
      { externalUserId: userId },
      {
        $set: {
          name,
          emailId,
          province,
          username,
          role: 'rider',
          isOnboarded: true,
        },
      },
      { new: true, upsert: true }
    );
    res.json({ message: 'Rider onboarded', user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 3. POST /onboard/driver - Complete onboarding as driver
router.post('/driver', requireAuth(), async (req: Request, res: Response) => {
  const { userId } = req.auth as { userId: string };
  console.log("Onboarding driver for userId:", userId);
  const {
    name,
    emailId,
    province,
    username,
    age,
    licenseNumber,
    vehicleModel,
    vehicleYear,
    plateNumber,
  } = req.body;

  console.log("Driver onboarding data:", req.body);
  try {
    // Update or create user as driver
    const user = await UserTable.findOneAndUpdate(
      { externalUserId: userId },
      {
        $set: {
          name,
          emailId,
          province,
          username,
          role: 'driver',
          isOnboarded: true,
        },
      },
      { new: true, upsert: true }
    );

    if(!user) {
      console.log("User not found after update");
      return res.status(404).json({ error: 'User not found after update' });
    }
    console.log("User after update:", user);

    // Create driver profile
    const driver = await DriverTable.create({
      userId: user._id,
      externalUserId: userId,
      name,
      age,
      licenseNumber,
      vehicleModel,
      vehicleYear,
      plateNumber,
      province,
    });

    if(!driver) {
      console.log("Failed to create driver profile");
      return res.status(500).json({ error: 'Failed to create driver profile' });
    }

    res.json({ message: 'Driver onboarded', user, driver });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export { router as onboardingRouter };
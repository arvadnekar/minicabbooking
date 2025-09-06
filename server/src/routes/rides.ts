import { requireAuth } from '@clerk/express';
import express from 'express';
import { io } from 'index';
import { RidesTable } from 'models/Ride';


const router = express.Router();


router.post('/request', requireAuth(), async (req, res) => {
    const { userId } = req.auth as { userId: string };

    // Destructure and validate required fields
    const { pickupLocation, dropoffLocation, paymentMethod, fare } = req.body;

    // Validate required fields
    if (
        !pickupLocation ||
        typeof pickupLocation.lat !== 'number' ||
        typeof pickupLocation.lng !== 'number' ||
        typeof pickupLocation.address !== 'string' ||
        !dropoffLocation ||
        typeof dropoffLocation.lat !== 'number' ||
        typeof dropoffLocation.lng !== 'number' ||
        typeof dropoffLocation.address !== 'string' ||
        typeof paymentMethod !== 'string' ||
        typeof fare !== 'number'
    ) {
        return res.status(400).json({
            error: 'pickupLocation, dropoffLocation, paymentMethod, and fare are required and must be valid.'
        });
    }

    try {
        // Check for ongoing ride
        const ongoingRide = await RidesTable.findOne({
            where: { userId, status: 'ongoing' }
        });
        if (ongoingRide) {
            return res.status(409).json({ error: 'You already have an ongoing ride.' });
        }

        // Create new ride with required fields, assignedDriver defaults to null, paid defaults to false
        const ride = await RidesTable.create({
            userId,
            pickupLocation,
            dropoffLocation,
            paymentMethod,
            fare,
            assignedDriver: null,
            paid: false,
            requestTime: new Date(),
            status: 'ongoing'
        });

        io.to('drivers').emit('new-ride', ride);

        return res.status(201).json(ride);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export function setupRideSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log("Driver connected:", socket.id);

    socket.on("joinDriversRoom", () => {
      socket.join("drivers");
      console.log(`Socket ${socket.id} joined drivers room`);
    });

    socket.on("accept-ride", async ({ rideId, driverId }) => {
      try {
        const ride = await RidesTable.findByIdAndUpdate(
          rideId,
          { assignedDriverId: driverId, status: "accepted" },
          { new: true }
        );
        if (ride) {
          io.to("drivers").emit("ride-updated", { rideId, status: "accepted", assignedDriverId: driverId });
          console.log(`Emitted ride-updated to drivers for ride ${rideId}`);
        }
      } catch (err) {
        console.error("Error accepting ride:", err);
      }
    });

    socket.on("reject-ride", async ({ rideId, driverId }) => {
      console.log(`Driver ${driverId} rejected ride ${rideId}`);
      // Optionally handle rejection logic here
    });

    socket.on("disconnect", () => {
      console.log("Driver disconnected:", socket.id);
    });
  });
}

export { router as ridesRouter };
import { requireAuth } from '@clerk/express';
import express from 'express';
import { io } from 'index';
import { RidesTable } from 'models/Ride';
import { DriverTable } from 'models/Driver'; // Add this import
import { UserTable } from 'models/User';


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

router.get('/active', requireAuth(), async (req, res) => {
  const { userId } = req.auth as { userId: string };
  const role = req.query.role; // 'driver' or 'rider'
  let ride;
  if (role === 'driver') {
    ride = await RidesTable.findOne({ assignedDriver: userId, status: 'ongoing' });
  } else {
    ride = await RidesTable.findOne({ userId, status: 'ongoing' });
  }
  // Instead of 404, always return 200 with ride or null
  res.status(200).json(ride || null);
});

export function setupRideSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log("Driver connected:", socket.id);

    // Driver joins drivers room
    socket.on("joinDriversRoom", () => {
      socket.join("drivers");
      console.log(`Socket ${socket.id} joined drivers room`);
    });

    // Driver accepts ride
    socket.on("accept-ride", async ({ rideId, driverId, location }) => {
      try {
        const ride = await RidesTable.findByIdAndUpdate(
          rideId,
          { assignedDriverId: driverId, status: "accepted", driverInitialLocation: location },
          { new: true }
        );
        if (ride) {
          // Fetch driver and user info
          const driver = await DriverTable.findOne({ externalUserId: driverId });
          const user = await UserTable.findOne({ externalUserId: driverId });
          const driverImageUrl = user?.imgUrl || "https://randomuser.me/api/portraits/men/1.jpg";
          const driverName = user?.name || driver?.name || "Driver";
          const car = driver?.vehicleModel
            ? `${driver.vehicleModel} (${driver.plateNumber || ""})`
            : "Car";

          // Notify rider with driver details
          io.to(`rider-${ride.userId}`).emit("driver-assigned", {
            rideId,
            driverId,
            name: driverName,
            car,
            phone: "Not shared",
            imageUrl: driverImageUrl,
          });
        }
      } catch (err) {
        console.error("Error accepting ride:", err);
      }
    });

    function getDistanceMeters(a, b) {
      if (!a || !b) return null;
      const R = 6371e3;
      const φ1 = (a.lat * Math.PI) / 180;
      const φ2 = (b.lat * Math.PI) / 180;
      const Δφ = ((b.lat - a.lat) * Math.PI) / 180;
      const Δλ = ((b.lng - a.lng) * Math.PI) / 180;
      const x =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const y = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
      return R * y;
    }

    // Driver sends location update every 5 seconds
    socket.on("driver-location", async ({ rideId, driverId, location }) => {
      const ride = await RidesTable.findById(rideId);
      if (ride) {
        io.to(`rider-${ride.userId}`).emit("driver-location", {
          rideId,
          driverId,
          location,
        });

        // Check if driver is near pickup location (e.g., < 200 meters)
        const pickup = ride.pickupLocation;
        const distance = getDistanceMeters(location, pickup);
        if (distance !== null && distance < 200 && ride.status !== "arrived") {
          await RidesTable.findByIdAndUpdate(rideId, { status: "arrived" });
          io.to(`rider-${ride.userId}`).emit("driver-arrived", { rideId, driverId });
        }
      }
    });

    // Rider joins their own room for updates
    socket.on("joinRiderRoom", ({ userId }) => {
      socket.join(`rider-${userId}`);
      console.log(`Rider ${userId} joined their room`);
    });

    // Driver starts ride
    socket.on("start-ride", async ({ rideId, driverId }) => {
      try {
        const ride = await RidesTable.findByIdAndUpdate(
          rideId,
          { status: "in_progress" },
          { new: true }
        );
        if (ride) {
          io.to(`rider-${ride.userId}`).emit("start-ride", { rideId, driverId });
        }
      } catch (err) {
        console.error("Error starting ride:", err);
      }
    });

    // Driver completes ride
    socket.on("ride-completed", async ({ rideId, driverId }) => {
      try {
        // Update ride status to completed
        const ride = await RidesTable.findByIdAndUpdate(
          rideId,
          { status: "completed", completedTime: new Date() },
          { new: true }
        );
        if (ride) {
          // Notify rider that ride is completed
          io.to(`rider-${ride.userId}`).emit("ride-completed", { rideId, driverId });
          // Optionally, notify driver as well
          socket.emit("ride-completed", { rideId });
        }
      } catch (err) {
        console.error("Error completing ride:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("Driver disconnected:", socket.id);
    });
  });
}

export { router as ridesRouter };
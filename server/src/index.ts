// @ts-nocheck

import {
  clerkClient,
  clerkMiddleware,
  getAuth,
  requireAuth,
} from "@clerk/express";
import cors from "cors";
import "dotenv/config";
import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { connectToDatabase } from "../config/db";
import { onboardingRouter } from "./routes/onboarding";
import { userRouter } from "./routes/user";
import { ridesRouter, setupRideSocketHandlers } from "routes/rides";
import https from 'https';

const app = express();
const options = {
  key: fs.readFileSync("./privkey.pem"),
  cert: fs.readFileSync("./fullchain.pem"),
};

const PORT = process.env.PORT || 443;

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

app.use(
  clerkMiddleware({
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  })
);

app.get("/health", (_req, res) => {
  res.status(200).send("OK");
})

app.get("/api/user/role", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const user = await clerkClient.users.getUser(userId);
  res.status(200).json({ user });
});

app.use("/api/onboarding", onboardingRouter);

app.use("/api/user", requireAuth(), userRouter);

app.use("/api/rides", requireAuth(), ridesRouter);

// Use requireAuth() to protect this route
// If user is not authenticated, requireAuth() will redirect back to the homepage
app.get("/protected", requireAuth(), async (req, res) => {
  // Use `getAuth()` to get the user's `userId`
  // or you can use `req.auth`
  const { userId } = getAuth(req);

  // Use Clerk's JavaScript Backend SDK to get the user's User object
  const user = await clerkClient.users.getUser(userId as string);

  res.status(200).json({ user });
});

// Create HTTP server and attach Socket.IO
const server = https.createServer(options, app);
export const io = new SocketIOServer(server, {
  cors: { origin: "*" }
});

// Driver connection logic (optional, or move to rides if you want)
// io.on("connection", (socket) => {
//   console.log("Driver connected:", socket.id);

//   socket.on("joinDriversRoom", () => {
//     socket.join("drivers");
//   });

//   socket.on("disconnect", () => {
//     console.log("Driver disconnected:", socket.id);
//   });
// });

// Setup ride-related socket handlers
setupRideSocketHandlers(io);

// Start the server
server.listen(PORT, async () => {
  try {
    await connectToDatabase();
    console.log("Database connected");
    console.log(`Example app listening on port ${PORT}`);
  } catch (err) {
    console.error("Failed to connect to database.", err);
    process.exit(1);
  }
});

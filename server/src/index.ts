import {
  clerkClient,
  clerkMiddleware,
  getAuth,
  requireAuth,
} from "@clerk/express";
import cors from "cors";
import "dotenv/config";
import express, { Request, Response } from "express";
import { connectToDatabase } from "../config/db";
import { onboardingRouter } from "./routes/onboarding";
import { userRouter } from "./routes/user";

const app = express();
const PORT = 3000;

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

app.get("/api/user/role", async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const user = await clerkClient.users.getUser(userId);
  res.status(200).json({ user });
});

app.use("/api/onboarding", onboardingRouter);

app.use("/api/user", requireAuth(), userRouter);

// Use requireAuth() to protect this route
// If user is not authenticated, requireAuth() will redirect back to the homepage
app.get("/protected", requireAuth(), async (req: Request, res: Response) => {
  // Use `getAuth()` to get the user's `userId`
  // or you can use `req.auth`
  const { userId } = getAuth(req);

  // Use Clerk's JavaScript Backend SDK to get the user's User object
  const user = await clerkClient.users.getUser(userId as string);

  res.status(200).json({ user });
});

// Start the server and listen on the specified port
app.listen(PORT, async () => {
  try {
    await connectToDatabase();
    console.log("Database connected");
    console.log(`Example app listening at http://localhost:${PORT}`);
  } catch (err) {
    console.error("Failed to connect to database.", err);
    process.exit(1); // Exit if DB connection fails
  }
});

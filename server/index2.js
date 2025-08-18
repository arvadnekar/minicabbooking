// import express from "express";
// import cookieParser from "cookie-parser";
// import cors from "cors";
// import dotenv from "dotenv";
// import mongoose from "mongoose";

// // Import routes and middleware
// import authMiddleware from "./middleware/authMiddleware.js";
// import userRoutes from "./routes/userRoutes.js";

// dotenv.config();
// const app = express();
// const PORT = process.env.PORT || 3000;

// // MongoDB connection
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.error("MongoDB connection error:", err));

// // Middleware
// app.use(cors({ origin: "http://localhost:3001", credentials: true }));
// app.use(cookieParser());
// app.use(express.json());

// // Routes
// app.use("/api/users", userRoutes);  // Protected user routes

// // Test protected route
// app.get("/dashboard", authMiddleware, (req, res) => {
//   res.json({ message: "Welcome to dashboard", user: req.user });
// });

// // Public route
// app.get("/", (req, res) => res.send("Welcome to MiniCab backend server!"));

// // Start server
// app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

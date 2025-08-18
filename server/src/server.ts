import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
// import driverRoutes from "./routes/driver.ts"; // ⚠ add .js

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Use driver routes
// app.use("/api/driver", driverRoutes);

mongoose.connect(process.env.MONGO_URI || "")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err))

app.listen(process.env.PORT || 3000, () => console.log("Server running"));

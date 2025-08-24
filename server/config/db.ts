import mongoose from "mongoose";

let isConnected = false;

export const connectToDatabase = async () => {
  if (isConnected) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string);
    isConnected = true;
    console.log("Database connected");
    return conn.connection;
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
};
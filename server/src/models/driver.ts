import mongoose, { Schema, Document, model } from 'mongoose';

export interface IDriver extends Document {
  name: string;
  license: string;
  vehicle: {
    make: string;
    model: string;
    plateNumber: string;
  };
  clerkUserId: string; // reference to Clerk user
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema(
  {
    make: { type: String, required: true },
    model: { type: String, required: true },
    plateNumber: { type: String, required: true },
  },
  { _id: false } // prevents creating separate _id for vehicle
);

const DriverSchema = new Schema<IDriver>(
  {
    name: { type: String, required: true },
    license: { type: String, required: true },
    vehicle: { type: VehicleSchema, required: true },
    clerkUserId: { type: String, required: true },
  },
  { timestamps: true }
);

export default model<IDriver>('Driver', DriverSchema);

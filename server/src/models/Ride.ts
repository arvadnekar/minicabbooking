import { prop, getModelForClass, Ref, modelOptions } from "@typegoose/typegoose";
import { User } from "./User";

export class Location {
  @prop({ required: true, type: Number })
  public lat!: number;

  @prop({ required: true, type: Number })
  public lng!: number;

  @prop({ required: true, type: String })
  public address!: string;
}

export class Feedback {
  @prop({ type: String })
  public byRider?: string;

  @prop({ type: String })
  public byDriver?: string;
}

export enum RideStatus {
  Ongoing = "ongoing",
  Completed = "completed",
  Cancelled = "cancelled",
  Accepted = "accepted"
}

@modelOptions({
  options: { customName: 'rides' },
  schemaOptions: { timestamps: true }
})
export class Ride {
  @prop({ required: true, type: String })
  public userId!: string; // Now stores externalUserId directly

  @prop({ type: String, default: null })
  public assignedDriverId?: string;

  @prop({ required: true, _id: false, type: () => Location })
  public pickupLocation!: Location;

  @prop({ required: true, _id: false, type: () => Location })
  public dropoffLocation!: Location;

  @prop({ required: true, type: Date })
  public requestTime!: Date;

  @prop({ type: Date })
  public rideStartTime?: Date;

  @prop({ type: Date })
  public rideEndTime?: Date;

  @prop({ required: true, type: Number })
  public fare!: number;

  @prop({ required: true, type: String })
  public paymentMethod!: string;

  @prop({ required: true, default: false, type: Boolean })
  public paid!: boolean;

  @prop({ type: Number })
  public tip?: number;

  @prop({ type: Number })
  public rating?: number;

  @prop({ type: String })
  public comment?: string;

  @prop({ type: Number })
  public duration?: number;

  @prop({ type: Number })
  public distance?: number;

  @prop({ type: Number })
  public surgeMultiplier?: number;

  @prop({ _id: false, type: () => Feedback })
  public feedback?: Feedback;

  @prop({ type: Number })
  public waitingTime?: number;

  @prop({ type: String })
  public transactionId?: string;

  @prop({ type: Number })
  public extraCharges?: number;

  @prop({ enum: RideStatus, required: true, default: RideStatus.Ongoing, type: String })
  public status!: RideStatus;
}

export const RidesTable = getModelForClass(Ride);
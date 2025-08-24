import { getModelForClass, modelOptions, prop, Ref } from '@typegoose/typegoose';
import { User } from './User';


@modelOptions({
  options: { customName: 'drivers' },
  schemaOptions: {
    timestamps: true
  }
})
export class Driver {
  @prop({ ref: () => User, required: true })
  public userId!: Ref<User>; // Reference to User table (_id)

  @prop({ type: String, required: true })
  public externalUserId!: string; // Clerk user ID

  @prop({ type: String, required: true })
  public name!: string;

  @prop({ type: Number })
  public age?: number;

  @prop({ type: String, required: true })
  public licenseNumber!: string;

  @prop({ type: String })
  public province?: string;

  @prop({ type: String })
  public vehicleModel?: string;

  @prop({ type: Number })
  public vehicleYear?: number;

  @prop({ type: String })
  public plateNumber?: string;
}

export const DriverTable = getModelForClass(Driver);

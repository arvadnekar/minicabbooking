import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import { Role } from '../libs/constants';

@modelOptions({
  options: { customName: 'users' },
  schemaOptions: {
    timestamps: true
  }
})
export class User {
  @prop({ type: String, required: true, unique: true, trim: true })
  public externalUserId!: string; // Clerk user ID

  @prop({ type: String })
  public provider?: string; // e.g., 'email', 'google', etc.

  @prop({ type: String })
  public imgUrl?: string; // Clerk profile image

  @prop({ type: String, required: true, trim: true })
  public emailId!: string;

  @prop({ type: String })
  public name?: string;

  @prop({ type: String })
  public username?: string; // Optional username

  @prop({ type: String, enum: Role, required: true })
  public role!: Role;

  @prop({ type: String })
  public province?: string; // Province for both rider and driver

  @prop({ type: Boolean, default: false })
  public isOnboarded!: boolean;

  @prop({ type: Date })
  public lastLoginAt?: Date; // Optional last login date
}

export const UserTable = getModelForClass(User);
import { Types } from "mongoose";

export const objectId = (
  id: string | Types.ObjectId | Buffer | Uint8Array
): Types.ObjectId => {
  return new Types.ObjectId(id);
};
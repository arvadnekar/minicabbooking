import express, { Request, Response } from "express";
import { UserTable } from "../models/User";
const router = express.Router();

router.post("/sync", async (req: Request, res: Response) => {
  const {
    externalUserId,
    emailId,
    name,
    username,
    imgUrl,
    provider,
    role,
    province,
  } = req.body;

  try {
    const user = await UserTable.findOneAndUpdate(
      { externalUserId },
      {
        $set: {
          emailId,
          name,
          username,
          imgUrl,
          provider,
          role,
          province,
        },
      },
      { new: true, upsert: true }
    );
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ error: "Failed to sync user" });
  }
});

export {router as userRouter};
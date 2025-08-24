import { NextFunction, type Request, type Response } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";

const JWKS = createRemoteJWKSet(new URL("https://api.clerk.com/v1/jwks"));

export async function clerkAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ message: "Missing auth token" });

    const token = authHeader.split(" ")[1]; // Bearer <token>
    if (!token) return res.status(401).json({ message: "Invalid token" });

    // Verify JWT using JWKS
    const { payload } = await jwtVerify(token, JWKS);

    // Attach userId to request (TypeScript knows about it from type augmentation)
    req.userId = payload.sub as string;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized", error: err });
  }
}

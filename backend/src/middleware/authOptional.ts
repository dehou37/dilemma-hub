import jwt from "jsonwebtoken";
import prisma from "../prisma.ts";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

export default async function authOptional(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
  if (!token) return next();

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    if (payload?.userId) {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, username: true, email: true },
      });
      if (user) {
        (req as any).user = user;
      }
    }
  } catch (err) {
    // invalid token - ignore and continue as unauthenticated
  }

  next();
}

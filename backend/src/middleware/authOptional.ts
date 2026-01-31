import jwt from "jsonwebtoken";
import prisma from "../prisma.ts";
import type { Request, Response, NextFunction } from "express";

// JWT_SECRET is validated in index.ts, but also check here for safety  
function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return secret;
}

function parseCookie(cookieHeader: string | undefined) {
  if (!cookieHeader) return {} as Record<string, string>;
  return cookieHeader.split("; ").reduce<Record<string, string>>((acc, part) => {
    const idx = part.indexOf("=");
    if (idx === -1) return acc;
    const key = part.slice(0, idx);
    const val = decodeURIComponent(part.slice(idx + 1));
    acc[key] = val;
    return acc;
  }, {} as Record<string, string>);
}

export default async function authOptional(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

  if (!token) {
    // Try cookie 'token'
    const cookies = parseCookie(req.headers.cookie);
    token = cookies["token"];
  }

  if (!token) return next();

  try {
    const payload = jwt.verify(token, getJWTSecret()) as any;
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

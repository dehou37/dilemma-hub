import type { Request, Response, NextFunction } from "express";

export default function authRequired(req: Request, res: Response, next: NextFunction) {
  if ((req as any).user) return next();
  res.status(401).json({ error: "Authentication required" });
}

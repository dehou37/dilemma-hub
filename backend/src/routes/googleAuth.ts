import { Router, Request, Response } from "express";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import prisma from "../prisma.ts";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

function setAccessCookie(res: any, token: string) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
}

function setRefreshCookie(res: any, token: string) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

// Google OAuth callback
// Expects { idToken } from frontend (from Google Sign-In)
router.post("/callback", async (req: Request, res: Response) => {
  try {
    const { email, name, googleId } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({ error: "email and googleId required" });
    }

    // Check if user exists
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create new user with a random password (they'll use Google to login)
      const randomPassword = await argon2.hash(Math.random().toString());
      user = await prisma.user.create({
        data: {
          email,
          username: name || email.split("@")[0],
          password: randomPassword,
        },
      });
    }

    // Issue tokens
    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
    setAccessCookie(res, accessToken);
    setRefreshCookie(res, refreshToken);

    res.json({ user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during Google auth" });
  }
});

export default router;

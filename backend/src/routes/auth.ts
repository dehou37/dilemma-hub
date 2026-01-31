import { Router } from "express";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import prisma from "../prisma.ts";
import authOptional from "../middleware/authOptional.ts";

const router = Router();

// JWT_SECRET is validated in index.ts, but also check here for safety
function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return secret;
}

function setAccessCookie(res: any, token: string) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax", // "none" required for cross-domain in production
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
}

function setRefreshCookie(res: any, token: string) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax", // "none" required for cross-domain in production
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "username, email and password required" });
    }

    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (existing) return res.status(409).json({ error: "User already exists" });

    const hashed = await argon2.hash(password);
    const user = await prisma.user.create({ data: { username, email, password: hashed } });

    const accessToken = jwt.sign({ userId: user.id }, getJWTSecret(), { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId: user.id }, getJWTSecret(), { expiresIn: "7d" });
    setAccessCookie(res, accessToken);
    setRefreshCookie(res, refreshToken);

    res.json({ 
      user: { id: user.id, username: user.username, email: user.email },
      token: accessToken,
      refreshToken: refreshToken
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email and password required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await argon2.verify(user.password!, password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const accessToken = jwt.sign({ userId: user.id }, getJWTSecret(), { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId: user.id }, getJWTSecret(), { expiresIn: "7d" });
    setAccessCookie(res, accessToken);
    setRefreshCookie(res, refreshToken);

    res.json({ 
      user: { id: user.id, username: user.username, email: user.email },
      token: accessToken,
      refreshToken: refreshToken
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Return current user if authenticated (authOptional sets req.user when token present)
router.get("/me", authOptional, (req, res) => {
  const user = (req as any).user || null;
  res.json({ user });
});

// Refresh access token using refreshToken cookie
router.post("/refresh", async (req, res) => {
  try {
    const cookieHeader = req.headers.cookie || "";
    const cookies = cookieHeader.split("; ").reduce<Record<string, string>>((acc, part) => {
      const idx = part.indexOf("=");
      if (idx === -1) return acc;
      acc[part.slice(0, idx)] = decodeURIComponent(part.slice(idx + 1));
      return acc;
    }, {} as Record<string, string>);
    const token = cookies["refreshToken"];
    if (!token) return res.status(401).json({ error: "No refresh token" });

    const payload = jwt.verify(token, getJWTSecret()) as any;
    const userId = payload.userId;
    const accessToken = jwt.sign({ userId }, getJWTSecret(), { expiresIn: "15m" });
    setAccessCookie(res, accessToken);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Invalid refresh token" });
  }
});

router.post("/logout", (_req, res) => {
  // Clear cookies
  res.clearCookie("token");
  res.clearCookie("refreshToken");
  res.json({ ok: true });
});

// Update profile
router.put("/update-profile", authOptional, async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) return res.status(401).json({ error: "Authentication required" });

  const { username, email } = req.body;

  if (!username || !email) {
    return res.status(400).json({ error: "Username and email are required" });
  }

  try {
    // Check if username or email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
        NOT: { id: userId },
      },
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ error: "Username already taken" });
      }
      if (existingUser.email === email) {
        return res.status(400).json({ error: "Email already taken" });
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { username, email },
      select: { id: true, username: true, email: true },
    });

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Change password
router.put("/change-password", authOptional, async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) return res.status(401).json({ error: "Authentication required" });

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current and new passwords are required" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Verify current password
    const valid = await argon2.verify(user.password, currentPassword);
    if (!valid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Hash and update new password
    const hashedPassword = await argon2.hash(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({ ok: true, message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to change password" });
  }
});

export default router;

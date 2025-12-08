import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.ts";
import dilemmaRoutes from "./routes/dilemmas.ts";
import voteRoutes from "./routes/votes.ts";
import commentRoutes from "./routes/comments.ts";
import authOptional from "./middleware/authOptional.ts";

dotenv.config();

// ✅ Strict env validation (Render-safe)
const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET"];
const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingEnvVars.length) {
  console.error("❌ Missing env vars:", missingEnvVars.join(", "));
  process.exit(1);
}

const app = express();

// ✅ Security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});

// ✅ SAFE production CORS
app.use(cors({
  origin: process.env.FRONTEND_URL?.split(",") || true,
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(authOptional);

app.get("/", (req, res) => {
  res.json({ ok: true, message: "Dilemma Hub API running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/dilemmas", dilemmaRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/comments", commentRoutes);

// ✅ ✅ ✅ CRITICAL Render fix
const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});

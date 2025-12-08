import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import authRoutes from "./routes/auth.ts";
import dilemmaRoutes from "./routes/dilemmas.ts";
import voteRoutes from "./routes/votes.ts";
import commentRoutes from "./routes/comments.ts";
import authOptional from "./middleware/authOptional.ts";

// Express server entry

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from root directory (parent of backend folder)
dotenv.config({ path: join(__dirname, "../../.env") });

// Environment variable validation
const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET"];
const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(", ")}`);
  console.error("Please set these in your .env file before starting the server.");
  process.exit(1);
}

if (process.env.JWT_SECRET === "dev_secret_change_me") {
  console.warn("⚠️  WARNING: Using default JWT_SECRET. Change this in production!");
}

const app = express();

// Security headers - Basic implementation without helmet for ESM compatibility
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});

// CORS configuration
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(",") 
  : ["http://localhost:3000", "http://127.0.0.1:3000"];

app.use(cors({ 
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true 
}));

app.use(express.json({ limit: "10mb" }));

// Attach optional auth to all requests so views/pages can access req.user when available
app.use(authOptional);

// Simple root route for quick health check
app.get("/", (req, res) => {
	res.json({ ok: true, message: "Dilemma Hub API running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dilemmas", dilemmaRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/comments", commentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
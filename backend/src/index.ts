import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.ts";
import dilemmaRoutes from "./routes/dilemmas.ts";
import voteRoutes from "./routes/votes.ts";
import commentRoutes from "./routes/comments.ts";
import authOptional from "./middleware/authOptional.ts";

// Express server entry

dotenv.config();

const app = express();
// Allow frontend to send/receive cookies. Set FRONTEND_URL in .env for production.
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());

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
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.ts";
import dilemmaRoutes from "./routes/dilemmas.ts";
import voteRoutes from "./routes/votes.ts";
import commentRoutes from "./routes/comments.ts";

// Express server entry

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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
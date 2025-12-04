import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import dilemmaRoutes from "./routes/dilemmas";
import voteRoutes from "./routes/votes";
import commentRoutes from "./routes/comments";
// Express server entry
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dilemmas", dilemmaRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/comments", commentRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
//# sourceMappingURL=index.js.map
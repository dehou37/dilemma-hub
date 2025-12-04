import { Router } from "express";
import { voteDilemma, getAllVotes, getVoteById, getVotesByDilemma } from "../controllers/voteController.ts";
import authRequired from "../middleware/authRequired.ts";

const router = Router();

// List votes
router.get("/", getAllVotes);
// Get single vote
router.get("/:id", getVoteById);
// Votes for a specific dilemma
router.get("/dilemma/:dilemmaId", getVotesByDilemma);
// Create a vote (authenticated users only)
router.post("/", authRequired, voteDilemma);

export default router;

import { Router } from "express";
import { voteDilemma } from "../controllers/voteController";

const router = Router();

router.post("/", voteDilemma);

export default router;

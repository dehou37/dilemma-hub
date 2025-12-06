import { Router } from "express";
import { getAllDilemmas, getDilemmaById, createDilemma, getDilemmasByUserId, getMyDilemmas } from "../controllers/dilemmaController.ts";
import authRequired from "../middleware/authRequired.ts";

const router = Router();

router.get("/", getAllDilemmas);
// Get current user's dilemmas (authenticated)
router.get("/my-posts", authRequired, getMyDilemmas);
// Get dilemmas by user ID
router.get("/user/:userId", getDilemmasByUserId);
router.get("/:id", getDilemmaById);
// Creating a dilemma requires authentication
router.post("/", authRequired, createDilemma);

export default router;
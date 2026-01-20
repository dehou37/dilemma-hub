import { Router } from "express";
import { getAllDilemmas, getDilemmaById, createDilemma, getDilemmasByUserId, getMyDilemmas, updateDilemma, deleteDilemma, getStats, getTrending, getCategories } from "../controllers/dilemmaController.ts";
import authRequired from "../middleware/authRequired.ts";

const router = Router();

router.get("/", getAllDilemmas);
router.get("/stats", getStats);
router.get("/trending", getTrending);
router.get("/categories", getCategories);
// Get current user's dilemmas (authenticated)
router.get("/my-posts", authRequired, getMyDilemmas);
// Get dilemmas by user ID
router.get("/user/:userId", getDilemmasByUserId);
router.get("/:id", getDilemmaById);
// Creating a dilemma requires authentication
router.post("/", authRequired, createDilemma);
// Update dilemma (authenticated, must be author)
router.put("/:id", authRequired, updateDilemma);
// Delete dilemma (authenticated, must be author)
router.delete("/:id", authRequired, deleteDilemma);

export default router;
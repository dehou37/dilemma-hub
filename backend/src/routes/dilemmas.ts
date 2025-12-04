import { Router } from "express";
import { getAllDilemmas, getDilemmaById, createDilemma } from "../controllers/dilemmaController.ts";
import authRequired from "../middleware/authRequired.ts";

const router = Router();

router.get("/", getAllDilemmas);
router.get("/:id", getDilemmaById);
// Creating a dilemma requires authentication
router.post("/", authRequired, createDilemma);

export default router;
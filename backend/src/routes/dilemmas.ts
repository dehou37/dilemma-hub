import { Router } from "express";
import { getAllDilemmas, getDilemmaById, createDilemma } from "../controllers/dilemmaController.ts";

const router = Router();

router.get("/", getAllDilemmas);
router.get("/:id", getDilemmaById);
router.post("/", createDilemma);

export default router;
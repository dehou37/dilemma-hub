import { Router } from "express";
import authRequired from "../middleware/authRequired.ts";
import { generateAIImage, generateAIComic } from "../controllers/aiController.ts";

const router = Router();

// Generate AI image from prompt
router.post("/generate-image", authRequired, generateAIImage);

// Generate AI comic from prompt
router.post("/generate-comic", authRequired, generateAIComic);

export default router;

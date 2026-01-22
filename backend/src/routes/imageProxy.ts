import { Router } from "express";
import { proxyImage } from "../controllers/imageProxyController.js";

const router = Router();

// Proxy image requests to hide API key
router.get("/", proxyImage);

export default router;

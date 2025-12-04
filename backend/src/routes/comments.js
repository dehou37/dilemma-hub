import { Router } from "express";
import { addComment } from "../controllers/commentController";
const router = Router();
router.post("/", addComment);
export default router;
//# sourceMappingURL=comments.js.map
import { Router } from "express";
import { addComment, getAllComments, getCommentById } from "../controllers/commentController.ts";

const router = Router();

// List comments
router.get("/", getAllComments);
// Get single comment
router.get("/:id", getCommentById);
// Create comment
router.post("/", addComment);

export default router;

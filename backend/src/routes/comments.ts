import { Router } from "express";
import { addComment, getAllComments, getCommentById, getCommentsByDilemmaId } from "../controllers/commentController.ts";
import authRequired from "../middleware/authRequired.ts";

const router = Router();

// List comments
router.get("/", getAllComments);
// Get comments by dilemma ID
router.get("/dilemma/:dilemmaId", getCommentsByDilemmaId);
// Get single comment
router.get("/:id", getCommentById);
// Create comment (authenticated users only)
router.post("/", authRequired, addComment);

export default router;

import { Router } from "express";

const router = Router();

router.post("/register", (req, res) => {
  res.send("Register endpoint - integrate Clerk later");
});

router.post("/login", (req, res) => {
  res.send("Login endpoint - integrate Clerk later");
});

export default router;

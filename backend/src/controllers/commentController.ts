import type { Request, Response } from "express";
import prisma from "../prisma.ts";

export const addComment = async (req: Request, res: Response) => {
  const { dilemmaId, content } = req.body;
  const userId = (req as any).user?.id;
  if (!userId) return res.status(401).json({ error: "Authentication required" });

  const comment = await prisma.comment.create({
    data: { userId, dilemmaId, content },
    include: { user: { select: { id: true, username: true } } },
  });
  res.json(comment);
};

export const getAllComments = async (req: Request, res: Response) => {
  const comments = await prisma.comment.findMany({ orderBy: { createdAt: "desc" } });
  res.json(comments);
};

export const getCommentById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) return res.status(404).json({ error: "Not found" });
  res.json(comment);
};

export const getCommentsByDilemmaId = async (req: Request, res: Response) => {
  const { dilemmaId } = req.params;
  const comments = await prisma.comment.findMany({
    where: { dilemmaId },
    include: { user: { select: { id: true, username: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(comments);
};

import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const addComment = async (req: Request, res: Response) => {
  const { userId, dilemmaId, content } = req.body;
  const comment = await prisma.comment.create({ data: { userId, dilemmaId, content } });
  res.json(comment);
};

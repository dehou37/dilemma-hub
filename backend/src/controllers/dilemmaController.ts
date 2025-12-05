import type { Request, Response } from "express";
import prisma from "../prisma.ts";

export const getAllDilemmas = async (req: Request, res: Response) => {
  const dilemmas = await prisma.dilemma.findMany({
    orderBy: { createdAt: "desc" },
    include: { votes: true, comments: true },
  });
  res.json(dilemmas);
};

export const getDilemmaById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const dilemma = await prisma.dilemma.findUnique({ where: { id }, include: { votes: true, comments: true } });
  res.json(dilemma);
};

export const createDilemma = async (req: Request, res: Response) => {
  const { title, description, options, category } = req.body;
  const authorId = (req as any).user?.id;
  if (!authorId) return res.status(401).json({ error: "Authentication required" });

  const dilemma = await prisma.dilemma.create({
    data: { title, description, options, category, authorId },
  });
  res.json(dilemma);
};

import type { Request, Response } from "express";
import prisma from "../prisma.ts";

export const getAllDilemmas = async (req: Request, res: Response) => {
  const dilemmas = await prisma.dilemma.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, username: true, email: true } },
      votes: true,
      comments: true,
    },
  });
  res.json(dilemmas);
};

export const getDilemmaById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const dilemma = await prisma.dilemma.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, username: true, email: true } },
      votes: { include: { user: { select: { id: true, username: true } } } },
      comments: {
        include: { user: { select: { id: true, username: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  res.json(dilemma);
};

export const getDilemmasByUserId = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const dilemmas = await prisma.dilemma.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
    include: { votes: true, comments: true },
  });
  res.json(dilemmas);
};

export const getMyDilemmas = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) return res.status(401).json({ error: "Authentication required" });

  const dilemmas = await prisma.dilemma.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, username: true, email: true } },
      votes: true,
      comments: true,
    },
  });
  res.json(dilemmas);
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

export const updateDilemma = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, options, category } = req.body;
  const userId = (req as any).user?.id;
  
  if (!userId) return res.status(401).json({ error: "Authentication required" });

  try {
    // Check if dilemma exists and user is the author
    const dilemma = await prisma.dilemma.findUnique({ where: { id } });
    if (!dilemma) return res.status(404).json({ error: "Dilemma not found" });
    if (dilemma.authorId !== userId) {
      return res.status(403).json({ error: "Not authorized to edit this dilemma" });
    }

    // Update the dilemma
    const updated = await prisma.dilemma.update({
      where: { id },
      data: { title, description, options, category },
      include: {
        author: { select: { id: true, username: true, email: true } },
        votes: true,
        comments: true,
      },
    });
    
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update dilemma" });
  }
};

export const deleteDilemma = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.id;
  
  if (!userId) return res.status(401).json({ error: "Authentication required" });

  try {
    // Check if dilemma exists and user is the author
    const dilemma = await prisma.dilemma.findUnique({ where: { id } });
    if (!dilemma) return res.status(404).json({ error: "Dilemma not found" });
    if (dilemma.authorId !== userId) {
      return res.status(403).json({ error: "Not authorized to delete this dilemma" });
    }

    // Delete the dilemma (votes and comments will cascade delete if configured)
    await prisma.dilemma.delete({ where: { id } });
    
    res.json({ ok: true, message: "Dilemma deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete dilemma" });
  }
};

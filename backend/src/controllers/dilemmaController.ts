import type { Request, Response } from "express";
import prisma from "../prisma.ts";

export const getAllDilemmas = async (req: Request, res: Response) => {
  try {
    const { search, page = "1", limit = "10" } = req.query;
    
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where = search
      ? {
          OR: [
            { title: { contains: search as string, mode: "insensitive" } },
            { description: { contains: search as string, mode: "insensitive" } },
            { author: { username: { contains: search as string, mode: "insensitive" } } },
          ],
        }
      : undefined;

    const total = await prisma.dilemma.count({ where });

    const dilemmas = await prisma.dilemma.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNum,
      include: {
        author: { select: { id: true, username: true, email: true } },
        votes: true,
        comments: true,
      },
    });

    res.json({
      data: dilemmas,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasMore: skip + dilemmas.length < total,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch dilemmas" });
  }
};

export const getDilemmaById = async (req: Request, res: Response) => {
  try {
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
    if (!dilemma) return res.status(404).json({ error: "Dilemma not found" });
    res.json(dilemma);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch dilemma" });
  }
};

export const getDilemmasByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const dilemmas = await prisma.dilemma.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "desc" },
      include: { votes: true, comments: true },
    });
    res.json(dilemmas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch dilemmas" });
  }
};

export const getMyDilemmas = async (req: Request, res: Response) => {
  try {
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch your dilemmas" });
  }
};

export const createDilemma = async (req: Request, res: Response) => {
  try {
    const { title, description, options, category } = req.body;
    const authorId = (req as any).user?.id;
    if (!authorId) return res.status(401).json({ error: "Authentication required" });

    const dilemma = await prisma.dilemma.create({
      data: { title, description, options, category, authorId },
    });
    res.json(dilemma);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create dilemma" });
  }
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

import type { Request, Response } from "express";
import prisma from "../prisma.ts";

export const voteDilemma = async (req: Request, res: Response) => {
  try {
    const { dilemmaId, option } = req.body;
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: "Authentication required" });

    const vote = await prisma.vote.create({ data: { userId, dilemmaId, option } });
    res.json(vote);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "You may have already voted" });
  }
};

export const getAllVotes = async (_req: Request, res: Response) => {
  try {
    const votes = await prisma.vote.findMany({ orderBy: { createdAt: "desc" } });
    res.json(votes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch votes" });
  }
};

export const getVoteById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vote = await prisma.vote.findUnique({ where: { id } });
    if (!vote) return res.status(404).json({ error: "Not found" });
    res.json(vote);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch vote" });
  }
};

export const getVotesByDilemma = async (req: Request, res: Response) => {
  try {
    const { dilemmaId } = req.params;
    const votes = await prisma.vote.findMany({ where: { dilemmaId } });
    res.json(votes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch votes" });
  }
};

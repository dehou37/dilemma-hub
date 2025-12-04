import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const voteDilemma = async (req: Request, res: Response) => {
  const { userId, dilemmaId, option } = req.body;
  try {
    const vote = await prisma.vote.create({ data: { userId, dilemmaId, option } });
    res.json(vote);
  } catch (err) {
    res.status(400).json({ error: "You may have already voted" });
  }
};

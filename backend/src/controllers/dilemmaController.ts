import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllDilemmas = async (req: Request, res: Response) => {
  const dilemmas = await prisma.dilemma.findMany();
  res.json(dilemmas);
};

export const getDilemmaById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const dilemma = await prisma.dilemma.findUnique({ where: { id } });
  res.json(dilemma);
};

export const createDilemma = async (req: Request, res: Response) => {
  const { title, description, options, authorId } = req.body;
  const dilemma = await prisma.dilemma.create({
    data: { title, description, options, authorId },
  });
  res.json(dilemma);
};

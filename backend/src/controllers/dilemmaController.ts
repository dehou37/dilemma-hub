import type { Request, Response } from "express";
import prisma from "../prisma.ts";
import { generateImage } from "../services/aiImageService.ts";

export const getAllDilemmas = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    const where = search
      ? {
          OR: [
            { title: { contains: search as string, mode: "insensitive" } },
            { description: { contains: search as string, mode: "insensitive" } },
            { author: { username: { contains: search as string, mode: "insensitive" } } },
          ],
        }
      : undefined;

    const dilemmas = await prisma.dilemma.findMany({
      where,
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
    const { title, description, options, category, generateAIImage, imagePrompt, imageStyle } = req.body;
    const authorId = (req as any).user?.id;
    if (!authorId) return res.status(401).json({ error: "Authentication required" });

    let imageUrl = null;
    let finalImagePrompt = null;

    // Generate AI image if requested
    if (generateAIImage && imagePrompt) {
      try {
        const imageResult = await generateImage({
          prompt: imagePrompt,
          style: imageStyle || "vivid",
          size: "1024x1024",
        });
        imageUrl = imageResult.url;
        finalImagePrompt = imagePrompt;
      } catch (error: any) {
        console.error("Error generating AI image:", error);
        // Continue creating dilemma even if image generation fails
      }
    }

    const dilemma = await prisma.dilemma.create({
      data: { 
        title, 
        description, 
        options, 
        category, 
        authorId,
        imageUrl,
        imagePrompt: finalImagePrompt,
      },
    });
    res.json(dilemma);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create dilemma" });
  }
};

export const updateDilemma = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, options, category, generateAIImage, imagePrompt, imageStyle } = req.body;
  const userId = (req as any).user?.id;
  
  if (!userId) return res.status(401).json({ error: "Authentication required" });

  try {
    // Check if dilemma exists and user is the author
    const dilemma = await prisma.dilemma.findUnique({ where: { id } });
    if (!dilemma) return res.status(404).json({ error: "Dilemma not found" });
    if (dilemma.authorId !== userId) {
      return res.status(403).json({ error: "Not authorized to edit this dilemma" });
    }

    let imageUrl = dilemma.imageUrl;
    let finalImagePrompt = dilemma.imagePrompt;

    // Generate new AI image if requested
    if (generateAIImage && imagePrompt) {
      try {
        const imageResult = await generateImage({
          prompt: imagePrompt,
          style: imageStyle || "vivid",
          size: "1024x1024",
        });
        imageUrl = imageResult.url;
        finalImagePrompt = imagePrompt;
      } catch (error: any) {
        console.error("Error generating AI image:", error);
        // Continue updating dilemma even if image generation fails
      }
    }

    // Update the dilemma
    const updated = await prisma.dilemma.update({
      where: { id },
      data: { 
        title, 
        description, 
        options, 
        category,
        imageUrl,
        imagePrompt: finalImagePrompt,
      },
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

export const getStats = async (req: Request, res: Response) => {
  try {
    const totalDilemmas = await prisma.dilemma.count();
    const totalVotes = await prisma.vote.count();
    const totalComments = await prisma.comment.count();

    res.json({
      totalDilemmas,
      totalVotes,
      totalComments,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

export const getTrending = async (req: Request, res: Response) => {
  try {
    // Get all dilemmas with vote counts
    const dilemmas = await prisma.dilemma.findMany({
      include: {
        author: { select: { id: true, username: true, email: true } },
        votes: true,
        comments: true,
      },
    });

    // Sort by vote count and take top 3
    const trending = dilemmas
      .sort((a, b) => b.votes.length - a.votes.length)
      .slice(0, 3);

    res.json(trending);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch trending dilemmas" });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    // Get all unique categories from database
    const dilemmas = await prisma.dilemma.findMany({
      select: { category: true },
    });

    const categories = Array.from(
      new Set(dilemmas.map(d => d.category ? d.category.toUpperCase() : "OTHER"))
    ).filter(Boolean);

    // Sort categories, with OTHER at the end
    const sorted = categories.filter(c => c !== "OTHER").sort();
    if (categories.includes("OTHER")) {
      sorted.push("OTHER");
    }

    res.json(["All", ...sorted]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

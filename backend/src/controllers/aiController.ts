import type { Request, Response } from "express";
import { generateImage, generateComic } from "../services/aiImageService.js";

/**
 * POST /api/ai/generate-image
 * Generate an AI image based on a prompt
 */
export const generateAIImage = async (req: Request, res: Response) => {
  try {
    const { prompt, style, size } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (prompt.length > 1000) {
      return res.status(400).json({ error: "Prompt is too long (max 1000 characters)" });
    }

    const result = await generateImage({
      prompt,
      style: style || "vivid",
      size: size || "1024x1024",
    });

    res.json({
      imageUrl: result.url,
      revisedPrompt: result.revisedPrompt,
    });
  } catch (err: any) {
    console.error("Error generating image:", err);
    res.status(500).json({ 
      error: err.message || "Failed to generate image",
    });
  }
};

/**
 * POST /api/ai/generate-comic
 * Generate a comic-style image based on a prompt
 */
export const generateAIComic = async (req: Request, res: Response) => {
  try {
    const { prompt, size } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (prompt.length > 1000) {
      return res.status(400).json({ error: "Prompt is too long (max 1000 characters)" });
    }

    const result = await generateComic({
      prompt,
      size: size || "1024x1024",
    });

    res.json({
      imageUrl: result.url,
      revisedPrompt: result.revisedPrompt,
    });
  } catch (err: any) {
    console.error("Error generating comic:", err);
    res.status(500).json({ 
      error: err.message || "Failed to generate comic",
    });
  }
};

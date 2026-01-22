import type { Request, Response } from "express";

/**
 * Proxy image requests to hide the API key from the frontend
 * GET /api/image-proxy?url=<encoded_pollinations_url>
 */
export const proxyImage = async (req: Request, res: Response) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "URL parameter is required" });
    }

    // Verify the URL is from Pollinations
    if (!url.startsWith("https://gen.pollinations.ai/")) {
      return res.status(403).json({ error: "Invalid image source" });
    }

    // Fetch the image
    const response = await fetch(url);

    if (!response.ok) {
      console.error("Failed to fetch image:", response.status);
      return res.status(response.status).json({ error: "Failed to fetch image" });
    }

    // Get the image buffer
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/png";

    // Set cache headers for better performance
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache for 1 year

    // Send the image
    res.send(Buffer.from(imageBuffer));
  } catch (error: any) {
    console.error("Error proxying image:", error);
    res.status(500).json({ error: "Failed to proxy image" });
  }
};

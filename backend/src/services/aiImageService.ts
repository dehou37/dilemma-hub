export interface GenerateImageParams {
  prompt: string;
  style?: "vivid" | "natural";
  size?: "1024x1024" | "1792x1024" | "1024x1792";
}

export interface GeneratedImage {
  url: string;
  revisedPrompt?: string;
}

/**
 * Generate an image using Pollinations.ai API
 * Downloads the image and converts to base64 data URL for frontend display
 * Requires POLLINATIONS_API_KEY in .env file
 */
export async function generateImage(params: GenerateImageParams): Promise<GeneratedImage> {
  try {
    const { prompt } = params;
    const apiKey = process.env.POLLINATIONS_API_KEY;

    if (!apiKey) {
      throw new Error("POLLINATIONS_API_KEY is not configured");
    }

    // Use gptimage model
    const encodedPrompt = encodeURIComponent(prompt);
    const apiUrl = `https://gen.pollinations.ai/image/${encodedPrompt}?model=gptimage&key=${apiKey}`;

    console.log("Generating image with Pollinations API (gptimage model)...");

    // Make the request
    const response = await fetch(apiUrl, {
      method: "GET",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Pollinations API error:", response.status, errorText);
      throw new Error(`Pollinations API error: ${response.status} - ${errorText}`);
    }

    // Get the image as an ArrayBuffer
    const imageBuffer = await response.arrayBuffer();
    
    // Convert to base64
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    
    // Get content type from response headers
    const contentType = response.headers.get('content-type') || 'image/png';
    
    // Create a data URL that can be used directly in <img> tags
    const dataUrl = `data:${contentType};base64,${base64Image}`;

    console.log("Image generated successfully");

    return {
      url: dataUrl,
      revisedPrompt: prompt,
    };
  } catch (error: any) {
    console.error("Error generating image:", error);
    throw new Error(error.message || "Failed to generate image");
  }
}

/**
 * Generate a comic-style image with multiple panels
 */
export async function generateComic(params: GenerateImageParams): Promise<GeneratedImage> {
  // Enhance the prompt to create a comic-style image
  const comicPrompt = `Comic book style, vibrant colors, bold outlines, panel layout: ${params.prompt}`;
  
  return generateImage({
    ...params,
    prompt: comicPrompt,
  });
}

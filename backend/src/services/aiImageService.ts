import { supabase } from "../supabaseClient.js";

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
 * Generate an image using Pollinations.ai API and upload to Supabase Storage
 * Returns permanent Supabase Storage URL
 * Requires POLLINATIONS_API_KEY, SUPABASE_URL, and SUPABASE_SERVICE_KEY in .env
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
    const pollinationsUrl = `https://gen.pollinations.ai/image/${encodedPrompt}?model=gptimage&key=${apiKey}`;

    console.log("Generating image with Pollinations API (gptimage model)...");

    // Fetch the image from Pollinations
    const response = await fetch(pollinationsUrl, {
      method: "GET",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Pollinations API error:", response.status, errorText);
      throw new Error(`Pollinations API error: ${response.status}`);
    }

    // Get the image as a buffer
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/png';
    const extension = contentType.split('/')[1] || 'png';

    console.log("Image generated, uploading to Supabase Storage...");

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const filename = `ai-images/${timestamp}-${randomString}.${extension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('dilemma-images') // Make sure this bucket exists in Supabase
      .upload(filename, Buffer.from(imageBuffer), {
        contentType: contentType,
        cacheControl: '31536000', // Cache for 1 year
      });

    if (error) {
      console.error("Supabase upload error:", error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('dilemma-images')
      .getPublicUrl(filename);

    const publicUrl = publicUrlData.publicUrl;

    console.log("Image uploaded successfully to Supabase:", publicUrl);

    return {
      url: publicUrl,
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

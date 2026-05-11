import express, { Router, Request, Response } from "express";
import { processIAHome, processIAHomeWithLogging } from "../../services/replicate";

const router: Router = express.Router();

/**
 * POST /api/ia-home/process
 * Process an image with Replicate AI
 */
router.post("/process", async (req: Request, res: Response) => {
  try {
    const { imageUrl, prompt } = req.body;

    // Validate input
    if (!imageUrl || !prompt) {
      res.status(400).json({
        error: "Missing required fields: imageUrl and prompt",
      });
      return;
    }

    // Validate URL format
    try {
      new URL(imageUrl);
    } catch {
      res.status(400).json({
        error: "Invalid imageUrl format",
      });
      return;
    }

    // Process the image
    const result = await processIAHomeWithLogging(
      imageUrl,
      prompt,
      30,
      (status, attempt) => {
        console.log(`[Attempt ${attempt}] Status: ${status}`);
      }
    );

    res.status(200).json({
      success: true,
      result: result,
      message: "Image processed successfully",
    });
  } catch (error: any) {
    console.error("Error processing image:", error);
    res.status(500).json({
      error: error.message || "Internal server error",
      success: false,
    });
  }
});

/**
 * GET /api/ia-home/health
 * Check API configuration and health
 */
router.get("/health", (req: Request, res: Response) => {
  const hasToken = !!process.env.REPLICATE_API_TOKEN;
  const hasModelId = !!process.env.REPLICATE_MODEL_VERSION_ID;

  res.status(200).json({
    status: "ok",
    hasReplicateToken: hasToken,
    hasModelVersionId: hasModelId,
    configured: hasToken && hasModelId,
    timestamp: new Date().toISOString(),
  });
});

export default router;

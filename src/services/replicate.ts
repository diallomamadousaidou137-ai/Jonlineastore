// Fonction robuste pour appeler Replicate avec polling
export async function processIAHome(
  imageUrl: string,
  prompt: string,
  maxAttempts: number = 30
): Promise<string> {
  const apiToken = process.env.REPLICATE_API_TOKEN;

  if (!apiToken) {
    throw new Error("REPLICATE_API_TOKEN is not set");
  }

  // Step 1: Create prediction
  const createResponse = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Token ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: "your_actual_model_version_id", // Replace with real version
      input: {
        image: imageUrl,
        prompt: prompt,
      },
    }),
  });

  if (!createResponse.ok) {
    const error = await createResponse.json();
    throw new Error(`Replicate API error: ${error.detail || createResponse.statusText}`);
  }

  const prediction = await createResponse.json();
  const predictionId = prediction.id;

  // Step 2: Poll for completion
  let attempts = 0;
  while (attempts < maxAttempts) {
    const pollResponse = await fetch(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Token ${apiToken}`,
        },
      }
    );

    if (!pollResponse.ok) {
      throw new Error(`Failed to poll prediction: ${pollResponse.statusText}`);
    }

    const result = await pollResponse.json();

    if (result.status === "succeeded") {
      // Return the output URL or data
      return result.output?.[0] || result.output;
    }

    if (result.status === "failed") {
      throw new Error(`Prediction failed: ${result.error}`);
    }

    // Wait before polling again (exponential backoff optional)
    await new Promise((resolve) => setTimeout(resolve, 1000));
    attempts++;
  }

  throw new Error("Prediction timeout - exceeded maximum polling attempts");
}

/**
 * Enhanced version with better error handling and logging
 */
export async function processIAHomeWithLogging(
  imageUrl: string,
  prompt: string,
  maxAttempts: number = 30,
  onProgress?: (status: string, attempt: number) => void
): Promise<string> {
  const apiToken = process.env.REPLICATE_API_TOKEN;

  if (!apiToken) {
    throw new Error("REPLICATE_API_TOKEN is not set");
  }

  try {
    // Step 1: Create prediction
    onProgress?.("Creating prediction...", 0);
    
    const createResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "your_actual_model_version_id",
        input: {
          image: imageUrl,
          prompt: prompt,
        },
      }),
    });

    if (!createResponse.ok) {
      const error = await createResponse.json();
      throw new Error(`Replicate API error: ${error.detail || createResponse.statusText}`);
    }

    const prediction = await createResponse.json();
    const predictionId = prediction.id;

    console.log(`Prediction created with ID: ${predictionId}`);

    // Step 2: Poll for completion
    let attempts = 0;
    while (attempts < maxAttempts) {
      const pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Token ${apiToken}`,
          },
        }
      );

      if (!pollResponse.ok) {
        throw new Error(`Failed to poll prediction: ${pollResponse.statusText}`);
      }

      const result = await pollResponse.json();
      
      onProgress?.(result.status, attempts + 1);

      if (result.status === "succeeded") {
        console.log("Prediction succeeded");
        return result.output?.[0] || result.output;
      }

      if (result.status === "failed") {
        console.error("Prediction failed:", result.error);
        throw new Error(`Prediction failed: ${result.error}`);
      }

      console.log(`Attempt ${attempts + 1}/${maxAttempts} - Status: ${result.status}`);

      // Wait before polling again
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }

    throw new Error("Prediction timeout - exceeded maximum polling attempts");
  } catch (error) {
    console.error("Error in processIAHome:", error);
    throw error;
  }
}

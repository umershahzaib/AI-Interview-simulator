import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

if (!GEMINI_API_KEY) {
  console.warn("⚠️  GEMINI_API_KEY not found in environment variables");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export class GeminiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isConnectionError: boolean = false
  ) {
    super(message);
    this.name = "GeminiError";
  }
}

/**
 * Get Gemini configuration
 */
export function getGeminiConfig() {
  return {
    model: GEMINI_MODEL,
    hasApiKey: !!GEMINI_API_KEY,
  };
}

/**
 * Check if Gemini is properly configured
 */
export async function checkGeminiHealth(): Promise<{
  available: boolean;
  configured: boolean;
  error?: string;
}> {
  try {
    if (!GEMINI_API_KEY) {
      return {
        available: false,
        configured: false,
        error: "Gemini API key not configured",
      };
    }

    // Simple test to verify API key works
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const result = await model.generateContent("Hi");
    const response = await result.response;

    if (response.text()) {
      return {
        available: true,
        configured: true,
      };
    }

    return {
      available: false,
      configured: true,
      error: "Gemini API returned empty response",
    };
  } catch (error) {
    return {
      available: false,
      configured: !!GEMINI_API_KEY,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send a prompt to Gemini and get a response
 */
export async function generateCompletion(
  prompt: string,
  options: {
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  } = {}
): Promise<string> {
  const { temperature = 0.7, maxTokens = 2048, systemPrompt } = options;

  if (!GEMINI_API_KEY) {
    throw new GeminiError(
      "Gemini API key not configured. Please set GEMINI_API_KEY environment variable.",
      500
    );
  }

  try {
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new GeminiError("Gemini returned empty response");
    }

    return text;
  } catch (error) {
    if (error instanceof GeminiError) {
      throw error;
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Check for common API errors
    if (errorMessage.includes("API_KEY_INVALID")) {
      throw new GeminiError("Invalid Gemini API key", 401);
    }
    if (errorMessage.includes("QUOTA_EXCEEDED")) {
      throw new GeminiError("Gemini API quota exceeded", 429);
    }
    if (errorMessage.includes("MODEL_NOT_FOUND")) {
      throw new GeminiError(`Model ${GEMINI_MODEL} not found`, 404);
    }

    throw new GeminiError(`Gemini API error: ${errorMessage}`, 500, true);
  }
}

/**
 * Generate a structured response using Gemini with JSON parsing
 */
export async function generateStructuredResponse<T>(
  prompt: string,
  schema: z.ZodType<T>,
  options: {
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
    retries?: number;
  } = {}
): Promise<T> {
  const { temperature = 0.7, maxTokens = 2048, systemPrompt, retries = 2 } = options;

  if (!GEMINI_API_KEY) {
    throw new GeminiError(
      "Gemini API key not configured. Please set GEMINI_API_KEY environment variable.",
      500
    );
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const enhancedSystemPrompt = systemPrompt
        ? `${systemPrompt}\n\nIMPORTANT: You must respond with ONLY valid JSON. Do not include markdown code blocks, explanations, or any text outside the JSON object.`
        : "You must respond with ONLY valid JSON. Do not include markdown code blocks, explanations, or any text outside the JSON object.";

      const model = genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
          responseMimeType: "application/json",
        },
        systemInstruction: enhancedSystemPrompt,
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();

      // Clean up common JSON formatting issues
      if (text.startsWith("```json")) {
        text = text.replace(/```json\n?/g, "").replace(/```\n?$/g, "");
      } else if (text.startsWith("```")) {
        text = text.replace(/```\n?/g, "");
      }

      // Parse JSON
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (parseError) {
        throw new GeminiError(
          `Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : "Invalid JSON"}`
        );
      }

      // Validate with Zod schema
      const validated = schema.parse(parsed);
      return validated;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < retries) {
        console.warn(
          `Structured response attempt ${attempt + 1} failed: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  throw new GeminiError("Failed to generate structured response after retries");
}

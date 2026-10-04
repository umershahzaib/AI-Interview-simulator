import Groq from "groq-sdk";
import { z } from "zod";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

if (!GROQ_API_KEY) {
  console.warn("⚠️  GROQ_API_KEY not found in environment variables");
}

const groq = new Groq({
  apiKey: GROQ_API_KEY,
});

export class GroqError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isConnectionError: boolean = false
  ) {
    super(message);
    this.name = "GroqError";
  }
}

/**
 * Get Groq configuration
 */
export function getGroqConfig() {
  return {
    model: GROQ_MODEL,
    hasApiKey: !!GROQ_API_KEY,
  };
}

/**
 * Check if Groq is properly configured
 */
export async function checkGroqHealth(): Promise<{
  available: boolean;
  configured: boolean;
  error?: string;
}> {
  try {
    if (!GROQ_API_KEY) {
      return {
        available: false,
        configured: false,
        error: "Groq API key not configured",
      };
    }

    // Simple test to verify API key works
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: "Say 'test'" }],
      model: GROQ_MODEL,
      max_tokens: 50,
      temperature: 0.1,
    });

    // Check if we got a valid response structure (even if content is empty)
    if (completion.choices && completion.choices.length > 0) {
      return {
        available: true,
        configured: true,
      };
    }

    return {
      available: false,
      configured: true,
      error: "Groq API returned invalid response structure",
    };
  } catch (error) {
    return {
      available: false,
      configured: !!GROQ_API_KEY,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send a prompt to Groq and get a response
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

  if (!GROQ_API_KEY) {
    throw new GroqError(
      "Groq API key not configured. Please set GROQ_API_KEY environment variable.",
      500
    );
  }

  try {
    const messages: Array<{
      role: "system" | "user" | "assistant";
      content: string;
    }> = [];

    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }

    messages.push({ role: "user", content: prompt });

    const completion = await groq.chat.completions.create({
      messages,
      model: GROQ_MODEL,
      temperature,
      max_tokens: maxTokens,
    });

    const text = completion.choices[0]?.message?.content;

    if (!text) {
      throw new GroqError("Groq returned empty response");
    }

    return text;
  } catch (error) {
    if (error instanceof GroqError) {
      throw error;
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Check for common API errors
    if (errorMessage.includes("invalid_api_key") || errorMessage.includes("401")) {
      throw new GroqError("Invalid Groq API key", 401);
    }
    if (errorMessage.includes("rate_limit") || errorMessage.includes("429")) {
      throw new GroqError("Groq API rate limit exceeded", 429);
    }
    if (errorMessage.includes("model_not_found") || errorMessage.includes("404")) {
      throw new GroqError(`Model ${GROQ_MODEL} not found`, 404);
    }

    throw new GroqError(`Groq API error: ${errorMessage}`, 500, true);
  }
}

/**
 * Generate a structured response using Groq with JSON parsing
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

  if (!GROQ_API_KEY) {
    throw new GroqError(
      "Groq API key not configured. Please set GROQ_API_KEY environment variable.",
      500
    );
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const enhancedSystemPrompt = systemPrompt
        ? `${systemPrompt}\n\nIMPORTANT: You must respond with ONLY valid JSON. Do not include markdown code blocks, explanations, or any text outside the JSON object.`
        : "You must respond with ONLY valid JSON. Do not include markdown code blocks, explanations, or any text outside the JSON object.";

      const messages: Array<{
        role: "system" | "user" | "assistant";
        content: string;
      }> = [];

      if (enhancedSystemPrompt) {
        messages.push({ role: "system", content: enhancedSystemPrompt });
      }

      messages.push({ role: "user", content: prompt });

      const completion = await groq.chat.completions.create({
        messages,
        model: GROQ_MODEL,
        temperature,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
      });

      let text = completion.choices[0]?.message?.content?.trim();

      if (!text) {
        throw new GroqError("Groq returned empty response");
      }

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
        throw new GroqError(
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

  throw new GroqError(
    `Failed to generate structured response after ${retries + 1} attempts: ${lastError?.message}`
  );
}

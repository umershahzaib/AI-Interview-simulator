import { z } from "zod";

const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2:latest";

export interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
}

export class OllamaError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isConnectionError: boolean = false
  ) {
    super(message);
    this.name = "OllamaError";
  }
}

/**
 * Send a prompt to Ollama and get a response
 */
export async function generateCompletion(
  prompt: string,
  options: {
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  } = {}
): Promise<string> {
  const { temperature = 0.7, systemPrompt } = options;

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt,
        stream: false,
        options: {
          temperature,
        },
      }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new OllamaError(
          `Model '${OLLAMA_MODEL}' not found. Please run: ollama pull ${OLLAMA_MODEL}`,
          404
        );
      }
      throw new OllamaError(
        `Ollama request failed: ${response.statusText}`,
        response.status
      );
    }

    const data: OllamaResponse = await response.json();
    return data.response;
  } catch (error) {
    if (error instanceof OllamaError) {
      throw error;
    }

    // Connection errors
    if (
      error instanceof TypeError &&
      (error.message.includes("fetch") || error.message.includes("network"))
    ) {
      throw new OllamaError(
        "Cannot connect to Ollama. Make sure Ollama is running at " +
          OLLAMA_BASE_URL,
        undefined,
        true
      );
    }

    throw new OllamaError(
      `Unexpected error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Generate a structured response using JSON schema
 */
export async function generateStructuredResponse<T>(
  prompt: string,
  schema: z.ZodSchema<T>,
  options: {
    temperature?: number;
    systemPrompt?: string;
    retries?: number;
  } = {}
): Promise<T> {
  const { retries = 2, ...otherOptions } = options;

  const fullPrompt = `${prompt}

IMPORTANT: Respond ONLY with valid JSON that matches this structure. Do not include any text before or after the JSON.`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await generateCompletion(fullPrompt, otherOptions);

      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr);

      // Validate with Zod
      const validated = schema.parse(parsed);
      return validated;
    } catch (error) {
      if (attempt === retries) {
        throw new OllamaError(
          `Failed to generate valid structured response after ${retries + 1} attempts: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
      // Retry with a slightly different approach
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw new OllamaError("Failed to generate structured response");
}

/**
 * Check if Ollama is available and the model is installed
 */
export async function checkOllamaHealth(): Promise<{
  available: boolean;
  modelInstalled: boolean;
  error?: string;
}> {
  try {
    // Check if Ollama is running
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: "GET",
    });

    if (!response.ok) {
      return {
        available: false,
        modelInstalled: false,
        error: "Ollama is not responding",
      };
    }

    const data = await response.json();
    const models = data.models || [];
    const modelInstalled = models.some(
      (m: { name: string }) => m.name === OLLAMA_MODEL
    );

    return {
      available: true,
      modelInstalled,
      error: modelInstalled
        ? undefined
        : `Model '${OLLAMA_MODEL}' not installed. Run: ollama pull ${OLLAMA_MODEL}`,
    };
  } catch (error) {
    return {
      available: false,
      modelInstalled: false,
      error:
        "Cannot connect to Ollama. Make sure it's running at " +
        OLLAMA_BASE_URL,
    };
  }
}

export function getOllamaConfig() {
  return {
    baseUrl: OLLAMA_BASE_URL,
    model: OLLAMA_MODEL,
  };
}

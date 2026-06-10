import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config";
import { logger } from "./logger";

export interface LlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LlmOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  responseJson?: boolean;
}

/**
 * Unified LLM client. Provider priority:
 * 1. Google Gemini (primary) — gemini-2.0-flash
 * 2. Perplexity (fallback) — Sonar model when Gemini is exhausted
 */
export class LlmClient {
  private geminiClient: GoogleGenerativeAI | null = null;
  private initialized = false;

  private getGemini(): GoogleGenerativeAI {
    if (!this.geminiClient) {
      if (!config.gemini.apiKey) {
        throw new Error("GEMINI_API_KEY is not configured");
      }
      this.geminiClient = new GoogleGenerativeAI(config.gemini.apiKey);
    }
    return this.geminiClient;
  }

  isPerplexityAvailable(): boolean {
    return Boolean(config.perplexity.apiKey);
  }

  isGeminiAvailable(): boolean {
    return Boolean(config.gemini.apiKey);
  }

  private logStatus(): void {
    if (this.initialized) return;
    this.initialized = true;

    const providers: string[] = [];
    if (this.isGeminiAvailable()) providers.push("Gemini (primary)");
    if (this.isPerplexityAvailable()) providers.push("Perplexity (fallback)");

    if (providers.length === 0) {
      logger.warn(
        "[LlmClient] No LLM provider configured! Set GEMINI_API_KEY or PERPLEXITY_API_KEY in .env",
      );
    } else {
      logger.info(
        `[LlmClient] Providers: ${providers.join(" -> ")}`,
      );
    }
  }

  /**
   * Send a chat completion request. Tries Gemini -> Perplexity.
   */
  async chatCompletion(
    messages: LlmMessage[],
    options: LlmOptions = {},
  ): Promise<string> {
    this.logStatus();

    // 1. Try Gemini
    if (this.isGeminiAvailable()) {
      try {
        return await this.callGemini(messages, options);
      } catch (err: any) {
        logger.warn(
          `[LlmClient] Gemini failed: ${err.message}. Trying Perplexity...`,
        );
      }
    }

    // 2. Try Perplexity
    if (this.isPerplexityAvailable()) {
      try {
        return await this.callPerplexity(messages, options);
      } catch (err: any) {
        throw new Error(`Perplexity fallback also failed: ${err.message}`);
      }
    }

    throw new Error(
      "No LLM provider configured. Set GEMINI_API_KEY or PERPLEXITY_API_KEY in .env",
    );
  }

  // ========================================
  // GEMINI
  // ========================================

  private async callGemini(
    messages: LlmMessage[],
    options: LlmOptions,
  ): Promise<string> {
    const client = this.getGemini();
    const model = client.getGenerativeModel({ model: config.gemini.model });

    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    for (const msg of messages) {
      // Gemini only supports "user" and "model" roles
      let role: string;
      if (msg.role === "assistant") role = "model";
      else if (msg.role === "system") role = "user";
      else role = "user";
      contents.push({ role, parts: [{ text: msg.content }] });
    }

    const generationConfig: any = {
      temperature: options.temperature ?? 0.3,
      maxOutputTokens: options.maxTokens ?? 2048,
    };

    if (options.topP !== undefined) {
      generationConfig.topP = options.topP;
    }

    if (options.responseJson) {
      generationConfig.responseMimeType = "application/json";
    }

    const result = await model.generateContent({
      contents,
      generationConfig,
    });

    return result.response.text();
  }

  // ========================================
  // PERPLEXITY (fallback)
  // ========================================

  private async callPerplexity(
    messages: LlmMessage[],
    options: LlmOptions,
  ): Promise<string> {
    // Perplexity Sonar API rejects "system" role - merge into first user message
    const adapted = this.adaptForPerplexity(messages);

    const body: Record<string, unknown> = {
      model: config.perplexity.model,
      messages: adapted,
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 2048,
    };

    if (options.topP !== undefined) {
      body.top_p = options.topP;
    }

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.perplexity.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Perplexity HTTP ${response.status}: ${errorText.slice(0, 400)}`,
      );
    }

    const data = (await response.json()) as any;
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Perplexity returned empty content");
    }

    return content;
  }

  private adaptForPerplexity(
    messages: LlmMessage[],
  ): Array<{ role: "user" | "assistant"; content: string }> {
    const systemParts: string[] = [];
    const result: Array<{ role: "user" | "assistant"; content: string }> = [];
    let merged = false;

    for (const msg of messages) {
      if (msg.role === "system") {
        systemParts.push(msg.content);
      } else {
        const role = msg.role === "user" ? "user" : "assistant";
        if (!merged && systemParts.length && role === "user") {
          result.push({
            role: "user",
            content: systemParts.join("\n\n") + "\n\n" + msg.content,
          });
          merged = true;
        } else {
          result.push({ role, content: msg.content });
        }
      }
    }

    if (!merged && systemParts.length) {
      result.unshift({ role: "user", content: systemParts.join("\n\n") });
    }

    return result;
  }
}

export const llmClient = new LlmClient();

import { llmClient } from "../../lib/llm-client";
import { config } from "../../config";
import { logger } from "../../lib/logger";
import { TICKET_ANALYSIS_PROMPT_VERSION } from "./prompt-version";

/** Structured output from the AI ticket analysis */
export interface TicketAnalysis {
  cleanTicket: string;
  summary: string;
  category: string;
  priority: string;
  possibleRootCause: string;
  suggestedSolutions: string[];
  keywords: string[];
  promptVersion: string;
}

/** Structured output from the AI natural language ticket parsing */
export interface ParsedTicketResult {
  department: "MIS" | "ITS";
  title: string;
  category?: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  details: string;
  mrn?: string | null;
  maintenanceDesktopLaptop?: boolean | null;
  maintenanceInternetNetwork?: boolean | null;
  maintenancePrinter?: boolean | null;
  maintenanceDetails?: string | null;
  borrowRequest?: boolean | null;
  borrowDetails?: string | null;
  websiteNewRequest?: boolean | null;
  websiteUpdate?: boolean | null;
  softwareNewRequest?: boolean | null;
  softwareUpdate?: boolean | null;
  softwareInstall?: boolean | null;
}

const NLP_SYSTEM_PROMPT = `[Prompt v${TICKET_ANALYSIS_PROMPT_VERSION}] You are an ICT support ticket parser. Analyze user input and extract structured ticket data. Output valid JSON only.

Department: ITS=hardware/network/printer/equipment; MIS=accounts/website/software/database/apps.

Category: e.g. Website, Software, Database, Hardware, Network, Printer, Account, Borrow, Wifi, Security.

Details: Rewrite description professionally.

Fields:
- mrn: extract MRN-XXXXX or null
- maintenanceDesktopLaptop: true if computer/laptop repair
- maintenanceInternetNetwork: true if wifi/internet/network
- maintenancePrinter: true if printer/toner
- borrowRequest: true if borrowing equipment
- borrowDetails: {purpose, duration, venueRoom, borrowedItems} or null
- websiteNewRequest: true if new website request
- websiteUpdate: true if website content change
- softwareNewRequest: true if new custom software
- softwareUpdate: true if bug fix/adjustment
- softwareInstall: true if install software/driver

Priority: CRITICAL=server down/multi-office; HIGH=user blocked; MEDIUM=workaround exists; LOW=minor.

Output format:
{
  "department": "MIS|ITS",
  "title": "3-7 word title",
  "category": "brief category",
  "priority": "LOW|MEDIUM|HIGH|CRITICAL",
  "details": "professional description",
  "mrn": "extracted or null",
  "maintenanceDesktopLaptop": true/false,
  "maintenanceInternetNetwork": true/false,
  "maintenancePrinter": true/false,
  "maintenanceDetails": "details or null",
  "borrowRequest": true/false,
  "borrowDetails": {"purpose":"...","duration":"...","venueRoom":"...","borrowedItems":"..."} or null,
  "websiteNewRequest": true/false,
  "websiteUpdate": true/false,
  "softwareNewRequest": true/false,
  "softwareUpdate": true/false,
  "softwareInstall": true/false
}`;

const SYSTEM_PROMPT = `[Prompt v${TICKET_ANALYSIS_PROMPT_VERSION}] You are an ICT support ticket analyst. Analyze tickets and return structured output. Output valid JSON only.

1. Clean & rewrite: Professional description preserving original meaning.
2. Summarize: 1-2 sentence summary.
3. Classify category: Network, Hardware, Software, Account Access, Printer, Security, or Other.
4. Assign priority: CRITICAL=many users/servers affected; HIGH=user blocked; MEDIUM=workaround exists; LOW=minor.
5. Suggest 3-5 troubleshooting steps.
6. Identify possible root cause (1-2 sentences).
7. Generate 5 search keywords.

Output format:
{
  "clean_ticket": "",
  "summary": "",
  "category": "",
  "priority": "",
  "possible_root_cause": "",
  "suggested_solutions": ["", "", ""],
  "keywords": ["", "", ""]
}

Rules: Do not invent info. Use common ICT knowledge. Be concise and technical.`;

export class GeminiService {
  /** Check if any LLM provider is available */
  isAvailable(): boolean {
    return llmClient.isPerplexityAvailable() || llmClient.isGeminiAvailable();
  }

  /**
   * Analyze a ticket description using Gemini AI.
   * Returns structured analysis with category, priority, solutions, etc.
   */
  async analyzeTicket(
    title: string,
    description: string,
    additionalContext?: string,
  ): Promise<TicketAnalysis> {
    const ticketContent = [
      title && `Title: ${title}`,
      `Description: ${description}`,
      additionalContext && `Additional Context: ${additionalContext}`,
    ]
      .filter(Boolean)
      .join("\n");

    const { text } = await llmClient.chatCompletion(
      [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "assistant",
          content:
            "Understood. Send me the support ticket and I will analyze it and return the result in JSON format.",
        },
        { role: "user", content: ticketContent },
      ],
      {
        temperature: 0.3,
        maxTokens: 2048,
        responseJson: true,
      },
    );
    logger.info("[GeminiService] Raw AI response received");

    try {
      const parsed = JSON.parse(text);
      return this.mapAnalysis(parsed);
    } catch (parseError) {
      // Attempt to recover from truncated JSON by closing open brackets
      logger.warn(
        "[GeminiService] Initial JSON parse failed, attempting recovery...",
      );
      try {
        const repaired = this.repairTruncatedJson(text);
        const parsed = JSON.parse(repaired);
        logger.info("[GeminiService] Successfully recovered truncated JSON");
        return this.mapAnalysis(parsed);
      } catch {
        logger.error("[GeminiService] Failed to parse AI response:", text);
        throw new Error("Failed to parse AI analysis response");
      }
    }
  }

  /**
   * Search for similar tickets based on a description.
   * Returns keywords for database search.
   */
  async extractSearchKeywords(description: string): Promise<string[]> {
    try {
      const { text } = await llmClient.chatCompletion(
        [
          {
            role: "user",
            content: `Extract 5-8 specific technical search keywords from this ICT support ticket description. Return ONLY a JSON array of strings, nothing else.

Description: ${description}`,
          },
        ],
        {
          temperature: 0.2,
          maxTokens: 256,
          responseJson: true,
        },
      );

      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      logger.error("[GeminiService] Failed to get keywords response:", err);
      return [];
    }
  }

  /**
   * Parse a natural language ticket input into structured fields.
   */
  async parseNLPInput(input: string): Promise<ParsedTicketResult> {
    if (!this.isAvailable()) {
      logger.warn(
        "[GeminiService] No LLM provider configured. Falling back to default parser.",
      );
      return this.fallbackNLPParse(input);
    }

    try {
      const { text } = await llmClient.chatCompletion(
        [
          { role: "system", content: NLP_SYSTEM_PROMPT },
          {
            role: "assistant",
            content:
              "Understood. Send me the natural language query, and I will parse it and return the result in the specified JSON format.",
          },
          { role: "user", content: `Input content: ${input}` },
        ],
        {
          temperature: 0.1,
          maxTokens: 2048,
          responseJson: true,
        },
      );
      logger.info("[GeminiService] Raw NLP parse response received");

      let parsed: any;
      try {
        parsed = JSON.parse(text);
      } catch {
        const repaired = this.repairTruncatedJson(text);
        parsed = JSON.parse(repaired);
      }

      let borrowDetailsStr = "";
      if (parsed.borrowDetails && typeof parsed.borrowDetails === "object") {
        const parts = [];
        if (parsed.borrowDetails.purpose)
          parts.push(`Purpose: ${parsed.borrowDetails.purpose}`);
        if (parsed.borrowDetails.duration)
          parts.push(`Duration: ${parsed.borrowDetails.duration}`);
        if (parsed.borrowDetails.venueRoom)
          parts.push(`Venue/Room: ${parsed.borrowDetails.venueRoom}`);
        if (parsed.borrowDetails.borrowedItems)
          parts.push(`Borrowed Items: ${parsed.borrowDetails.borrowedItems}`);
        borrowDetailsStr = parts.join("\n");
      } else if (typeof parsed.borrowDetails === "string") {
        borrowDetailsStr = parsed.borrowDetails;
      }

      return {
        department: parsed.department === "MIS" ? "MIS" : "ITS",
        title: parsed.title || this.deriveFallbackTitle(input),
        category: parsed.category || "Other",
        priority: this.normalizePriority(parsed.priority) as any,
        details: parsed.details || input,
        mrn: parsed.mrn || null,
        maintenanceDesktopLaptop: parsed.maintenanceDesktopLaptop || false,
        maintenanceInternetNetwork: parsed.maintenanceInternetNetwork || false,
        maintenancePrinter: parsed.maintenancePrinter || false,
        maintenanceDetails: parsed.maintenanceDetails || null,
        borrowRequest: parsed.borrowRequest || false,
        borrowDetails: borrowDetailsStr || null,
        websiteNewRequest: parsed.websiteNewRequest || false,
        websiteUpdate: parsed.websiteUpdate || false,
        softwareNewRequest: parsed.softwareNewRequest || false,
        softwareUpdate: parsed.softwareUpdate || false,
        softwareInstall: parsed.softwareInstall || false,
      };
    } catch (err: any) {
      logger.error(
        "[GeminiService] Failed to parse NLP input with LLM:",
        err.message,
      );
      return this.fallbackNLPParse(input);
    }
  }

  private fallbackNLPParse(input: string): ParsedTicketResult {
    const lowerInput = input.toLowerCase();

    // Guess department
    let department: "MIS" | "ITS" = "ITS";
    if (
      lowerInput.includes("portal") ||
      lowerInput.includes("website") ||
      lowerInput.includes("software") ||
      lowerInput.includes("database") ||
      lowerInput.includes("mis") ||
      lowerInput.includes("grade") ||
      lowerInput.includes("enroll")
    ) {
      department = "MIS";
    }

    // Guess priority
    let priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "MEDIUM";
    if (
      lowerInput.includes("urgent") ||
      lowerInput.includes("critical") ||
      lowerInput.includes("broken") ||
      lowerInput.includes("down") ||
      lowerInput.includes("not working")
    ) {
      priority = "HIGH";
    }

    // Simple fields guesser
    const hasPrinter =
      lowerInput.includes("printer") ||
      lowerInput.includes("paper jam") ||
      lowerInput.includes("toner");
    const hasInternet =
      lowerInput.includes("wifi") ||
      lowerInput.includes("internet") ||
      lowerInput.includes("network") ||
      lowerInput.includes("ethernet");
    const hasComputer =
      lowerInput.includes("computer") ||
      lowerInput.includes("pc") ||
      lowerInput.includes("laptop") ||
      lowerInput.includes("desktop") ||
      lowerInput.includes("power");

    // Guess MRN if any
    const mrnMatch = input.match(/mrn-?\s*([0-9a-zA-Z]+)/i);
    const mrn = mrnMatch ? `MRN-${mrnMatch[1].toUpperCase()}` : null;

    return {
      department,
      title: this.deriveFallbackTitle(input),
      category:
        department === "MIS"
          ? "SOFTWARE"
          : hasPrinter
            ? "PRINTER"
            : hasInternet
              ? "NETWORK"
              : "HARDWARE",
      priority,
      details: input,
      mrn,
      maintenanceDesktopLaptop: hasComputer,
      maintenanceInternetNetwork: hasInternet,
      maintenancePrinter: hasPrinter,
      maintenanceDetails:
        hasComputer || hasInternet || hasPrinter
          ? "Identified via automatic keyword fallback parser."
          : null,
      borrowRequest:
        lowerInput.includes("borrow") ||
        lowerInput.includes("request projector") ||
        lowerInput.includes("projector"),
      borrowDetails: lowerInput.includes("borrow")
        ? "Please specify borrowed items, duration, and venue."
        : null,
      websiteNewRequest: department === "MIS" && lowerInput.includes("new"),
      websiteUpdate:
        department === "MIS" &&
        (lowerInput.includes("update") || lowerInput.includes("edit")),
      softwareNewRequest:
        department === "MIS" &&
        (lowerInput.includes("develop") || lowerInput.includes("system")),
      softwareUpdate:
        department === "MIS" &&
        (lowerInput.includes("bug") || lowerInput.includes("fix")),
      softwareInstall:
        lowerInput.includes("install") || lowerInput.includes("setup"),
    };
  }

  private deriveFallbackTitle(input: string): string {
    const raw = input.trim();
    if (!raw) return "Support Ticket Request";
    const sentences = raw.split(/[.!?]/);
    const firstPhrase = sentences[0].trim();
    const words = firstPhrase.split(/\s+/);
    if (words.length > 6) {
      return words.slice(0, 6).join(" ") + "...";
    }
    return firstPhrase || "Support Ticket Request";
  }

  private normalizePriority(raw: string): string {
    const upper = (raw || "").toUpperCase().trim();
    if (["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(upper)) return upper;
    return "MEDIUM";
  }

  private mapAnalysis(parsed: any): TicketAnalysis {
    return {
      cleanTicket: parsed.clean_ticket || "",
      summary: parsed.summary || "",
      category: parsed.category || "Other",
      priority: this.normalizePriority(parsed.priority),
      possibleRootCause: parsed.possible_root_cause || "",
      suggestedSolutions: Array.isArray(parsed.suggested_solutions)
        ? parsed.suggested_solutions
        : [],
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      promptVersion: TICKET_ANALYSIS_PROMPT_VERSION,
    };
  }

  /** Try to repair truncated JSON by closing open brackets/braces */
  private repairTruncatedJson(text: string): string {
    let repaired = text.trim();
    // Remove trailing comma if present
    repaired = repaired.replace(/,\s*$/, "");
    // Remove incomplete string value (e.g. truncated in the middle of a string)
    repaired = repaired.replace(/"[^"]*$/, '""');

    // Count open/close brackets and braces
    let openBraces = 0;
    let openBrackets = 0;
    let inString = false;
    let escape = false;

    for (const ch of repaired) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === "\\") {
        escape = true;
        continue;
      }
      if (ch === '"') {
        inString = !inString;
        continue;
      }
      if (inString) continue;
      if (ch === "{") openBraces++;
      if (ch === "}") openBraces--;
      if (ch === "[") openBrackets++;
      if (ch === "]") openBrackets--;
    }

    // Close any unclosed brackets/braces
    while (openBrackets > 0) {
      repaired += "]";
      openBrackets--;
    }
    while (openBraces > 0) {
      repaired += "}";
      openBraces--;
    }

    return repaired;
  }
}

/** Singleton instance */
export const geminiService = new GeminiService();

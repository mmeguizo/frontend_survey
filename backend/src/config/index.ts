export const config = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  isDevelopment: process.env.NODE_ENV !== "production",
  isProduction: process.env.NODE_ENV === "production",

  cors: {
    origins: [
      "http://localhost:4000",
      "https://studio.apollographql.com",
      "http://localhost:4200",
      "https://localhost:4200",
      "http://localhost:4201",
      "https://localhost:4201",
      "http://10.100.168.9:4200",
      "https://10.100.168.9:4200",
      "http://10.100.168.9:4201",
      "https://10.100.168.9:4201",
      "http://10.100.168.9:4201",
      "https://10.100.168.9:55001",
    ],
    credentials: true,
  },

  // cors: {
  //   origins: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:4200'],
  // },

  publicBaseUrl: process.env.PUBLIC_BASE_URL || "http://localhost:4000",

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY2,
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  },

  perplexity: {
    apiKey: process.env.PERPLEXITY_API_KEY || "",
    model: process.env.PERPLEXITY_MODEL || "sonar",
  },

  huggingface: {
    token: process.env.HF_TOKEN || "",
    model: process.env.HF_MODEL || "Qwen/Qwen2.5-72B-Instruct",
  },

  ai: {
    // How long to wait for a single provider before trying the next one.
    // Default 45s is generous enough for free-tier Hugging Face cold starts
    // but short enough to fail over before the frontend gives up.
    requestTimeoutMs: Number(
      process.env.AI_REQUEST_TIMEOUT_MS || 45000,
    ),
  },
};

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET environment variable must be set in production");
}

export const authConfig = {
  google: {
    clientId: process.env.OAUTH_CLIENT_ID || "",
    clientSecret: process.env.OAUTH_CLIENT_SECRET || "",
    redirectUri: process.env.OAUTH_REDIRECT_URI || "",
  },
  jwt: {
    secret: jwtSecret || "dev-only-secret-do-not-use-in-production",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
};

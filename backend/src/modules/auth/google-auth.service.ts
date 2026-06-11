import { createRemoteJWKSet, jwtVerify } from 'jose';
import { authConfig } from '../../config/auth';
import { logger } from '../../lib/logger';

export interface GoogleUser {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}

export class GoogleAuthService {
  private jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

  async exchangeCodeForToken(
    code: string,
    redirectUri: string,
  ): Promise<{ id_token: string; access_token: string } | null> {
    try {
      const params = new URLSearchParams({
        code,
        client_id: authConfig.google.clientId,
        client_secret: authConfig.google.clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      });

      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      if (!res.ok) {
        const err = await res.text();
        logger.error(`Google token exchange failed: ${res.status} ${err}`);
        return null;
      }

      const data = await res.json();
      return {
        id_token: data.id_token,
        access_token: data.access_token,
      };
    } catch (error) {
      logger.error('Google token exchange error:', error);
      return null;
    }
  }

  async verifyIdToken(idToken: string): Promise<GoogleUser | null> {
    if (!authConfig.google.clientId) {
      logger.warn('Google OAuth client ID not configured');
      return null;
    }

    try {
      if (!this.jwks) {
        this.jwks = createRemoteJWKSet(
          new URL('https://www.googleapis.com/oauth2/v3/certs'),
        );
      }

      const { payload } = await jwtVerify(idToken, this.jwks, {
        issuer: ['https://accounts.google.com', 'accounts.google.com'],
        audience: authConfig.google.clientId,
      });

      return {
        sub: String(payload.sub ?? ''),
        email: typeof payload.email === 'string' ? payload.email : undefined,
        email_verified:
          typeof payload.email_verified === 'boolean'
            ? payload.email_verified
            : undefined,
        name: typeof payload.name === 'string' ? payload.name : undefined,
        picture: typeof payload.picture === 'string' ? payload.picture : undefined,
      };
    } catch (error) {
      logger.debug('Google ID token verification failed:', error);
      return null;
    }
  }

  async fetchUserInfo(accessToken: string): Promise<GoogleUser | null> {
    try {
      const res = await fetch(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      if (!res.ok) {
        logger.warn(`Google userinfo request failed: ${res.status}`);
        return null;
      }

      const data = await res.json();
      return {
        sub: data.sub,
        email: data.email,
        email_verified: data.email_verified,
        name: data.name,
        picture: data.picture,
      };
    } catch (error) {
      logger.error('Error fetching Google userinfo:', error);
      return null;
    }
  }
}

export const googleAuthService = new GoogleAuthService();

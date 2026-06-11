/**
 * Environment configuration
 * Centralized configuration for application settings
 */

export interface Environment {
  production: boolean;
  apiUrl: string;
  wsUrl: string;
  google: {
    clientId: string;
  };
}

export const environment: Environment = {
  production: false,
  apiUrl: 'http://localhost:4000/graphql',
  wsUrl: 'ws://localhost:4000/graphql',
  google: {
    clientId: '1081954751485-a4s2spmm54c954e1ejsu179dieca71ii.apps.googleusercontent.com',
  },
};

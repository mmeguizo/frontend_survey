import {
  ApplicationConfig,
  inject,
  NgZone,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  provideAppInitializer,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { icons } from './icons-provider';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import {
  UserOutline,
  LogoutOutline,
  InboxOutline,
  FileTextOutline,
  SyncOutline,
  DashboardOutline,
  HomeOutline,
  SettingOutline,
  MenuFoldOutline,
  MenuUnfoldOutline,
  UploadOutline,
  EyeOutline,
  EyeInvisibleOutline,
  BarChartOutline,
  AlertOutline,
  WarningOutline,
  ClockCircleOutline,
  HourglassOutline,
  FieldTimeOutline,
  ReloadOutline,
  StarOutline,
  StarFill,
  FilePdfOutline,
  FileExcelOutline,
} from '@ant-design/icons-angular/icons';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache, ApolloLink, split } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import type { GraphQLError } from 'graphql';
import { NzMessageService } from 'ng-zorro-antd/message';
import { environment } from './core/config/environment';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { AuthService as AppAuthService } from './core/services/auth.service';
import { Router } from '@angular/router';

registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideNzIcons(icons),
    provideNzI18n(en_US),
    provideAnimationsAsync(),
    // Initialize auth state from localStorage before app starts (Angular 19+ API)
    provideAppInitializer(() => {
      // console.log('[APP_INIT] 🚀 provideAppInitializer callback STARTING');
      const authService = inject(AppAuthService);
      authService.initFromStorage();
      // console.log('[APP_INIT] ✅ provideAppInitializer callback COMPLETE');
    }),
    // HTTP client with interceptors for auth, error handling, and loading
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, errorInterceptor, loadingInterceptor]),
    ),
    // Apollo GraphQL client
    provideApollo(() => {
      const httpLink = inject(HttpLink);
      const router = inject(Router);
      const ngZone = inject(NgZone);

      // Only use auth on the browser, not during SSR
      if (typeof window !== 'undefined') {
        const appAuthService = inject(AppAuthService);

        // Error link to handle unauthorized errors and auto-logout
        // Use a flag to prevent multiple logout calls
        let isLoggingOut = false;

        // Reset the flag when navigation changes (user has logged out and can log in again)
        router.events.subscribe((event: any) => {
          if (event.url === '/login') {
            isLoggingOut = false;
          }
        });

        const errorLink = onError((errorResponse: any) => {
          const graphQLErrors = errorResponse.graphQLErrors as
            | ReadonlyArray<GraphQLError>
            | undefined;
          const networkError = errorResponse.networkError as any;

          // Debug: Log all errors received
          console.log('[Apollo ErrorLink] Error received:', {
            graphQLErrors: graphQLErrors?.map((e) => ({
              message: e.message,
              code: e.extensions?.['code'],
            })),
            networkError: networkError
              ? { status: networkError.status, message: networkError.message }
              : null,
          });

          if (graphQLErrors && !isLoggingOut) {
            for (const err of graphQLErrors) {
              const errorCode = err.extensions?.['code'] as string;
              const errorMessage = err.message?.toLowerCase() || '';

              // Check for authentication/authorization errors
              const isAuthError =
                errorCode === 'UNAUTHENTICATED' ||
                errorCode === 'UNAUTHORIZED' ||
                errorCode === 'FORBIDDEN' ||
                errorMessage.includes('unauthorized') ||
                errorMessage.includes('forbidden') ||
                errorMessage.includes('jwt expired') ||
                errorMessage.includes('jwt malformed') ||
                errorMessage.includes('invalid token') ||
                errorMessage.includes('invalid signature') ||
                errorMessage.includes('session expired') ||
                errorMessage.includes('authentication required') ||
                errorMessage.includes('token expired') ||
                errorMessage.includes('no authorization');

              // Check for internal server error that might be caused by auth failure
              // When JWT expires, backend wraps the error as "Internal server error"
              const isInternalErrorWithAuth =
                errorCode === 'INTERNAL_SERVER_ERROR' && appAuthService.getToken() !== null; // User has a token that might be expired

              if (isAuthError || isInternalErrorWithAuth) {
                console.warn(
                  '[Apollo] Authentication error detected, logging out user. Error:',
                  err.message,
                  'Code:',
                  errorCode,
                );
                isLoggingOut = true;
                // Clear auth state and redirect to login
                // Must run inside NgZone so Angular Router navigation works
                ngZone.run(() => {
                  appAuthService.logout();
                });
                // Fallback: force redirect if router navigation didn't work
                setTimeout(() => {
                  if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                  }
                }, 500);
                return;
              }
            }
          }

          if (networkError && !isLoggingOut) {
            // console.log('[Apollo ErrorLink] Network error:', networkError);
            // Check for 401 network error
            if ('status' in networkError && networkError.status === 401) {
              console.warn('[Apollo] 401 Network error detected, logging out user');
              isLoggingOut = true;
              ngZone.run(() => {
                appAuthService.logout();
              });
              // Fallback: force redirect if router navigation didn't work
              setTimeout(() => {
                if (window.location.pathname !== '/login') {
                  window.location.href = '/login';
                }
              }, 500);
            }
          }
        });

        // Create auth link to add Authorization header (local JWT only)
        const authLink = setContext(async () => {
          const localToken = appAuthService.getToken();
          if (localToken) {
            return {
              headers: {
                Authorization: `Bearer ${localToken}`,
              },
            };
          }
          return { headers: {} };
        });

        // Chain: errorLink -> authLink -> httpLink
        const httpChain = ApolloLink.from([
          errorLink,
          authLink,
          httpLink.create({ uri: environment.apiUrl }),
        ]);

        // WebSocket link for subscriptions (real-time updates)
        const wsLink = new GraphQLWsLink(
          createClient({
            url: environment.wsUrl,
            connectionParams: () => {
              const token = appAuthService.getToken();
              return token ? { authorization: `Bearer ${token}` } : {};
            },
            // Auto-reconnect on connection loss
            retryAttempts: Infinity,
            shouldRetry: () => true,
          }),
        );

        // Split: subscriptions go through WebSocket, everything else through HTTP
        const link = split(
          ({ query }) => {
            const definition = getMainDefinition(query);
            return (
              definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
            );
          },
          wsLink,
          httpChain,
        );

        return {
          link,
          cache: new InMemoryCache({
            typePolicies: {
              Query: {
                fields: {
                  tickets: {
                    merge(_existing, incoming) {
                      return incoming;
                    },
                  },
                  myTickets: {
                    merge(_existing, incoming) {
                      return incoming;
                    },
                  },
                  myCreatedTickets: {
                    merge(_existing, incoming) {
                      return incoming;
                    },
                  },
                  myNotifications: {
                    merge(_existing, incoming) {
                      return incoming;
                    },
                  },
                },
              },
            },
          }),
        };
      }

      // Server-side: no auth
      return {
        link: httpLink.create({ uri: environment.apiUrl }),
        cache: new InMemoryCache({
          typePolicies: {
            Query: {
              fields: {
                tickets: {
                  merge(_existing, incoming) {
                    return incoming;
                  },
                },
                myTickets: {
                  merge(_existing, incoming) {
                    return incoming;
                  },
                },
                myCreatedTickets: {
                  merge(_existing, incoming) {
                    return incoming;
                  },
                },
                myNotifications: {
                  merge(_existing, incoming) {
                    return incoming;
                  },
                },
              },
            },
          },
        }),
      };
    }),
    provideNzIcons([
      UserOutline,
      LogoutOutline,
      InboxOutline,
      FileTextOutline,
      SyncOutline,
      DashboardOutline,
      HomeOutline,
      SettingOutline,
      MenuFoldOutline,
      MenuUnfoldOutline,
      UploadOutline,
      AlertOutline,
      BarChartOutline,
      WarningOutline,
      ClockCircleOutline,
      HourglassOutline,
      FieldTimeOutline,
      ReloadOutline,
      StarOutline,
      StarFill,
      FilePdfOutline,
      FileExcelOutline,
    ]),
  ],
};

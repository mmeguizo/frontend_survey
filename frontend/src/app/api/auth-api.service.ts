import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

interface LoginData {
  login: {
    token: string;
    user: {
      id: number;
      email: string;
      name: string | null;
      avatarUrl: string | null;
      role: string;
    };
  };
}

interface LoginVariables {
  email: string;
  password: string;
}

interface GoogleAuthData {
  googleAuth: {
    token: string;
    user: {
      id: number;
      email: string;
      name: string | null;
      avatarUrl: string | null;
      role: string;
    };
  };
}

interface GoogleAuthVariables {
  code: string;
  redirectUri: string;
}

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        name
        avatarUrl
        role
      }
    }
  }
`;

const GOOGLE_AUTH_MUTATION = gql`
  mutation GoogleAuth($code: String!, $redirectUri: String!) {
    googleAuth(code: $code, redirectUri: $redirectUri) {
      token
      user {
        id
        email
        name
        avatarUrl
        role
      }
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly apollo = inject(Apollo);

  login(email: string, password: string) {
    return this.apollo.mutate<LoginData, LoginVariables>({
      mutation: LOGIN_MUTATION,
      variables: { email, password },
    });
  }

  googleAuth(code: string, redirectUri: string) {
    return this.apollo.mutate<GoogleAuthData, GoogleAuthVariables>({
      mutation: GOOGLE_AUTH_MUTATION,
      variables: { code, redirectUri },
    });
  }
}

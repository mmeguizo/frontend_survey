import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { firstValueFrom } from 'rxjs';
import { AuthApiService } from '../api/auth-api.service';
import { AuthService } from '../core/services/auth.service';

function mapRoleToRoute(role: unknown): string {
  const r = typeof role === 'string' ? role.toUpperCase() : '';
  switch (r) {
    case 'ADMIN':
      return '/admin';
    case 'MIS_HEAD':
    case 'ITS_HEAD':
    case 'DEVELOPER':
    case 'TECHNICAL':
      return '/tickets';
    case 'SECRETARY':
    case 'DIRECTOR':
      return '/tickets/approvals';
    case 'USER':
      return '/dashboard';
    default:
      return '/dashboard';
  }
}

@Component({
  selector: 'app-auth-callback',
  imports: [NzSpinModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="callback-loading">
      <nz-spin nzSimple [nzSize]="'large'"></nz-spin>
      <p>Processing authentication...</p>
    </div>
  `,
  styles: [`
    .callback-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      gap: 16px;
    }
  `],
})
export class AuthCallbackComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly message = inject(NzMessageService);
  private readonly authService = inject(AuthService);
  private readonly authApi = inject(AuthApiService);

  async ngOnInit(): Promise<void> {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');

    if (error) {
      const errorDesc = params.get('error_description') || 'Authentication failed.';
      this.message.error(errorDesc);
      setTimeout(() => this.router.navigateByUrl('/login'), 1500);
      return;
    }

    if (!code) {
      this.message.error('No authorization code received. Please try again.');
      setTimeout(() => this.router.navigateByUrl('/login'), 1500);
      return;
    }

    const storedState = sessionStorage.getItem('google_oauth_state');
    sessionStorage.removeItem('google_oauth_state');

    if (state && storedState && state !== storedState) {
      this.message.error('Invalid state parameter. Possible CSRF attack.');
      setTimeout(() => this.router.navigateByUrl('/login'), 1500);
      return;
    }

    try {
      const redirectUri = window.location.origin + '/callback';
      const result = await firstValueFrom(
        this.authApi.googleAuth(code, redirectUri),
      );

      const graphQLErrors = (result as any).errors;
      if (graphQLErrors?.length) {
        const errMsg = graphQLErrors[0].message || 'Authentication failed';
        this.message.error(errMsg);
        setTimeout(() => this.router.navigateByUrl('/login'), 1500);
        return;
      }

      const { token, user } = result.data?.googleAuth || {};

      if (user && token) {
        this.authService.setAuth(
          {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatarUrl: user.avatarUrl,
          },
          token,
        );

        const target = mapRoleToRoute(user.role);
        this.message.success('Login successful!');
        this.router.navigateByUrl(target);
      } else {
        this.message.error('Failed to get user profile.');
        setTimeout(() => this.router.navigateByUrl('/login'), 1500);
      }
    } catch (err: any) {
      console.error('Google auth callback error:', err);
      const errMsg = err?.message || 'Authentication failed. Please try again.';
      this.message.error(errMsg);
      setTimeout(() => this.router.navigateByUrl('/login'), 1500);
    }
  }
}

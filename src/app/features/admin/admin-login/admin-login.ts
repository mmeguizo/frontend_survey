import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SurveyService } from '../../../core/services/survey.service';
import { LoginRequest, LoginResponse } from '../../../core/models/survey.model';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.scss',
})
export class AdminLoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private surveyService = inject(SurveyService);
  private snackBar = inject(MatSnackBar);

  isLoading = false;
  showForgotPassword = false;
  resetToken = '';

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  forgotPasswordForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  resetPasswordForm = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  });

  ngOnInit(): void {
    if (localStorage.getItem('survey_admin_token')) {
      this.router.navigate(['/admin/surveys']);
    }

    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.resetToken = params['token'];
        this.showForgotPassword = true;
      }
    });
  }

  login(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    const credentials = this.loginForm.value as LoginRequest;
    this.surveyService.login(credentials).subscribe({
      next: (response: LoginResponse) => {
        localStorage.setItem('survey_admin_token', response.access_token);
        this.snackBar.open('Login successful!', 'Close', { duration: 3000 });
        this.router.navigate(['/admin/surveys'], { replaceUrl: true });
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.snackBar.open('Invalid username or password.', 'Close', { duration: 5000 });
      },
    });
  }

  toggleForgotPassword(): void {
    this.showForgotPassword = !this.showForgotPassword;
    this.forgotPasswordForm.reset();
  }

  sendResetEmail(): void {
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.isLoading = true;
    const email = this.forgotPasswordForm.value.email || '';
    this.surveyService.forgotPassword(email).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('If an account exists with this email, a reset link has been sent.', 'Close', { duration: 5000 });
        this.showForgotPassword = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Failed to send reset email. Please try again.', 'Close', { duration: 5000 });
      },
    });
  }

  resetPassword(): void {
    if (this.resetPasswordForm.invalid) {
      return;
    }

    const { newPassword, confirmPassword } = this.resetPasswordForm.value;
    if (newPassword !== confirmPassword) {
      this.snackBar.open('Passwords do not match.', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    this.surveyService.resetPassword(this.resetToken, newPassword || '').subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Password reset successfully! You can now login.', 'Close', { duration: 3000 });
        this.showForgotPassword = false;
        this.resetToken = '';
        this.resetPasswordForm.reset();
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Invalid or expired reset token.', 'Close', { duration: 5000 });
      },
    });
  }
}
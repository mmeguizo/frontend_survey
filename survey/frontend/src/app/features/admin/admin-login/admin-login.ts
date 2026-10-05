import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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
  private surveyService = inject(SurveyService);
  private snackBar = inject(MatSnackBar);

  isLoading = false;

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  ngOnInit(): void {
    if (localStorage.getItem('survey_admin_token')) {
      this.router.navigate(['/admin/surveys']);
    }
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
}
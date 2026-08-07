import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SurveyService } from '../../../core/services/survey.service';
import { AdminToolbarComponent } from '../admin-toolbar/admin-toolbar';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    AdminToolbarComponent,
  ],
  templateUrl: './change-password.html',
  styleUrls: ['./change-password.scss'],
})
export class ChangePasswordComponent {
  private fb = inject(FormBuilder);
  private surveyService = inject(SurveyService);
  private snackBar = inject(MatSnackBar);

  isLoading = false;
  hideCurrent = true;
  hideNew = true;
  hideConfirm = true;

  passwordForm = this.fb.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: this.matchPasswords }
  );

  matchPasswords(form: { get: (key: string) => { value: string } | null }): { passwordMismatch: boolean } | null {
    const newPass = form.get('newPassword')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return newPass === confirm ? null : { passwordMismatch: true };
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      return;
    }
    this.isLoading = true;
    const { currentPassword, newPassword } = this.passwordForm.value as {
      currentPassword: string;
      newPassword: string;
    };
    this.surveyService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Password updated successfully.', 'Close', { duration: 4000 });
        this.passwordForm.reset();
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        const message =
          err.status === 401
            ? 'Current password is incorrect.'
            : 'Failed to update password.';
        this.snackBar.open(message, 'Close', { duration: 5000 });
      },
    });
  }
}

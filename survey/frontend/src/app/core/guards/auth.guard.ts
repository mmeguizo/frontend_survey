import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('survey_admin_token');

  if (!token) {
    router.navigate(['/admin/login']);
    return false;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('survey_admin_token');
      router.navigate(['/admin/login']);
      return false;
    }
  } catch {
    localStorage.removeItem('survey_admin_token');
    router.navigate(['/admin/login']);
    return false;
  }

  return true;
};
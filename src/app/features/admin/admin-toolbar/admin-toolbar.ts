import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-admin-toolbar',
  standalone: true,
  imports: [RouterModule, MatIconModule, MatButtonModule],
  templateUrl: './admin-toolbar.html',
  styleUrls: ['./admin-toolbar.scss'],
})
export class AdminToolbarComponent {
  private router = inject(Router);

  logout(): void {
    localStorage.removeItem('survey_admin_token');
    this.router.navigate(['/admin/login'], { replaceUrl: true });
  }
}

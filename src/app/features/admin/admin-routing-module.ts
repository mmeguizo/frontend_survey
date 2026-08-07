import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLoginComponent } from './admin-login/admin-login';
import { SurveyListComponent } from './survey-list/survey-list.component';
import { SurveyAnalyticsComponent } from './survey-analytics/survey-analytics.component';
import { PrintQrComponent } from './print-qr/print-qr.component';
import { SurveyDetailComponent } from './survey-detail/survey-detail';
import { ChangePasswordComponent } from './change-password/change-password';
import { authGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: AdminLoginComponent },
  { path: 'reset-password', component: AdminLoginComponent },
  { path: 'surveys', component: SurveyListComponent, canActivate: [authGuard] },
  { path: 'surveys/:id', component: SurveyDetailComponent, canActivate: [authGuard] },
  { path: 'analytics', component: SurveyAnalyticsComponent, canActivate: [authGuard] },
  { path: 'qr', component: PrintQrComponent, canActivate: [authGuard] },
  { path: 'change-password', component: ChangePasswordComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'surveys', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }

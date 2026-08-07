import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing-module';
import { AdminLoginComponent } from './admin-login/admin-login';
import { SurveyListComponent } from './survey-list/survey-list.component';
import { SurveyAnalyticsComponent } from './survey-analytics/survey-analytics.component';
import { PrintQrComponent } from './print-qr/print-qr.component';
import { SurveyDetailComponent } from './survey-detail/survey-detail';
import { ChangePasswordComponent } from './change-password/change-password';
import { AdminToolbarComponent } from './admin-toolbar/admin-toolbar';

@NgModule({
  imports: [
    CommonModule,
    AdminRoutingModule,
    AdminLoginComponent,
    SurveyListComponent,
    SurveyAnalyticsComponent,
    PrintQrComponent,
    SurveyDetailComponent,
    ChangePasswordComponent,
    AdminToolbarComponent,
  ],
  exports: [
    AdminRoutingModule
  ]
})
export class AdminModule { }

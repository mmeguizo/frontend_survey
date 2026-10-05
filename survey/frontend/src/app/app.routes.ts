import { Routes } from '@angular/router';
import { SurveyFormComponent } from './features/survey/survey-form/survey-form';

export const routes: Routes = [
  { path: 'survey', component: SurveyFormComponent },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin-routing-module').then(m => m.AdminRoutingModule)
  },
  { path: '', redirectTo: '/survey', pathMatch: 'full' },
];

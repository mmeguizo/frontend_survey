import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SurveyService } from '../../../core/services/survey.service';
import { SurveyAnalytics as SurveyAnalyticsModel } from '../../../core/models/survey.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';
import { AdminToolbarComponent } from '../admin-toolbar/admin-toolbar';

@Component({
  selector: 'app-survey-analytics',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, AdminToolbarComponent],
  templateUrl: './survey-analytics.component.html',
  styleUrls: ['./survey-analytics.component.scss'],
})
export class SurveyAnalyticsComponent implements OnInit {
  private surveyService = inject(SurveyService);
  analytics: SurveyAnalyticsModel | null = null;

  ngOnInit(): void {
    this.loadAnalytics();
  }

  get sqdEntries(): { key: string; value: number }[] {
    if (!this.analytics?.sqdAveragesPerQuestion) return [];
    return Object.entries(this.analytics.sqdAveragesPerQuestion).map(([key, value]) => ({
      key,
      value: value as number,
    }));
  }

  loadAnalytics(): void {
    this.surveyService.getAnalytics().subscribe({
      next: (data: SurveyAnalyticsModel) => {
        this.analytics = data;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to load analytics', err);
      },
    });
  }

  getSqdColor(avg: number): string {
    if (avg >= 4) return 'sqd-badge-green';
    if (avg >= 2.5) return 'sqd-badge-yellow';
    return 'sqd-badge-red';
  }

  getSqdIcon(avg: number): string {
    if (avg >= 4) return 'sentiment_very_satisfied';
    if (avg >= 2.5) return 'sentiment_neutral';
    return 'sentiment_very_dissatisfied';
  }

  getSqdLabel(avg: number): string {
    if (avg >= 4) return 'Good';
    if (avg >= 2.5) return 'Average';
    return 'Needs Improvement';
  }

  getTopClientType(): string {
    if (!this.analytics?.clientTypeDistribution?.length) return 'N/A';
    return this.analytics.clientTypeDistribution.reduce((max, curr) =>
      curr.count > max.count ? curr : max
    ).clientType;
  }

  get averageSqdDisplay(): string {
    const avg = this.analytics?.averageSqd;
    return avg !== null && avg !== undefined ? avg.toFixed(2) : 'N/A';
  }
}

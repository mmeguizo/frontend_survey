import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SurveyService } from '../../../core/services/survey.service';
import { Survey } from '../../../core/models/survey.model';
import { AdminToolbarComponent } from '../admin-toolbar/admin-toolbar';
import { HttpErrorResponse } from '@angular/common/http';

interface SqdRow {
  key: string;
  question: string;
  value: number | null;
}

@Component({
  selector: 'app-survey-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    AdminToolbarComponent,
  ],
  templateUrl: './survey-detail.html',
  styleUrls: ['./survey-detail.scss'],
})
export class SurveyDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private surveyService = inject(SurveyService);
  private snackBar = inject(MatSnackBar);

  survey: Survey | null = null;
  loading = true;

  private static readonly SQD_QUESTIONS: { key: string; question: string }[] = [
    { key: 'sqd0', question: 'Overall, how will you rate the service you received?' },
    { key: 'sqd1', question: 'The personnel greeted you promptly and courteously.' },
    { key: 'sqd2', question: 'The personnel were knowledgeable about the service.' },
    { key: 'sqd3', question: 'The service was provided within reasonable time.' },
    { key: 'sqd4', question: 'The office was clean and well-maintained.' },
    { key: 'sqd5', question: 'The fees (if any) were clearly posted.' },
    { key: 'sqd6', question: 'You were given complete information about the requirements.' },
    { key: 'sqd7', question: 'The service counter was easily accessible.' },
    { key: 'sqd8', question: 'The overall appearance of the office was satisfactory.' },
  ];

  private static readonly RATING_LABELS: Record<number, string> = {
    5: 'Strongly Agree',
    4: 'Agree',
    3: 'Neutral',
    2: 'Disagree',
    1: 'Strongly Disagree',
    0: 'N/A',
  };

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadSurvey(id);
  }

  loadSurvey(id: number): void {
    this.surveyService.getSurveyById(id).subscribe({
      next: (data: Survey) => {
        this.survey = data;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to load survey', err);
        this.loading = false;
        this.snackBar.open('Failed to load survey details.', 'Close', { duration: 5000 });
      },
    });
  }

  get sqdRows(): SqdRow[] {
    if (!this.survey) return [];
    return SurveyDetailComponent.SQD_QUESTIONS.map(q => ({
      key: q.key,
      question: q.question,
      value: (this.survey as unknown as Record<string, number | null>)[q.key] ?? null,
    }));
  }

  ratingLabel(value: number | null): string {
    if (value === null || value === undefined) return 'No answer';
    return SurveyDetailComponent.RATING_LABELS[value] ?? String(value);
  }

  starList(value: number | null): boolean[] {
    if (value === null || value === undefined || value <= 0) return [];
    return Array.from({ length: 5 }, (_, i) => i < value);
  }

  avgSqd(): number | null {
    if (!this.survey) return null;
    const values = [
      this.survey.sqd0, this.survey.sqd1, this.survey.sqd2, this.survey.sqd3, this.survey.sqd4,
      this.survey.sqd5, this.survey.sqd6, this.survey.sqd7, this.survey.sqd8,
    ].filter((v): v is number => v !== null && v !== undefined);
    if (values.length === 0) return null;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  goBack(): void {
    this.router.navigate(['/admin/surveys']);
  }
}

import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SurveyService } from '../../../core/services/survey.service';
import { Survey, PaginatedResponse, SurveyAnalytics } from '../../../core/models/survey.model';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { AdminToolbarComponent } from '../admin-toolbar/admin-toolbar';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface DonutSegment {
  label: string;
  count: number;
  frac: number;
  length: number;
  startDeg: number;
  color: string;
}

@Component({
  selector: 'app-survey-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatCardModule,
    MatTooltipModule,
    AdminToolbarComponent,
  ],
  templateUrl: './survey-list.component.html',
  styleUrls: ['./survey-list.component.scss'],
})
export class SurveyListComponent implements OnInit {
  private surveyService = inject(SurveyService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  private static readonly DONUT_COLORS = ['#0d47a1', '#2e7d32', '#f9a825', '#6a1b9a', '#00838f'];
  private static readonly DONUT_RADIUS = 80;
  private static readonly DONUT_CIRCUMFERENCE = 2 * Math.PI * 80;

  searchQuery: string = '';
  analytics: SurveyAnalytics | null = null;
  exporting = false;
  readonly donutCircumference = SurveyListComponent.DONUT_CIRCUMFERENCE;

  displayedColumns: string[] = ['id', 'ticketId', 'clientType', 'date', 'sqdAvg', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  surveys: any[] = [];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.loadSurveys();
    this.loadAnalytics();
  }

  loadSurveys(): void {
    this.surveyService.getSurveys(1, 10, this.searchQuery).subscribe({
      next: (response: PaginatedResponse<Survey>) => {
        this.surveys = response.items.map(survey => ({ ...survey, sqdAvg: this.sqdAvgOf(survey) }));
        this.dataSource = new MatTableDataSource(this.surveys);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (err: unknown) => {
        console.error('Failed to load surveys', err);
        this.snackBar.open('Failed to load surveys.', 'Close', { duration: 5000 });
      },
    });
  }

  loadAnalytics(): void {
    this.surveyService.getAnalytics().subscribe({
      next: (data: SurveyAnalytics) => {
        this.analytics = data;
      },
      error: (err: unknown) => {
        console.error('Failed to load analytics', err);
      },
    });
  }

  sqdAvgOf(survey: Survey): number | null {
    const values = [
      survey.sqd0, survey.sqd1, survey.sqd2, survey.sqd3, survey.sqd4,
      survey.sqd5, survey.sqd6, survey.sqd7, survey.sqd8,
    ].filter((v): v is number => v !== null && v !== undefined);
    if (values.length === 0) return null;
    return values.reduce((a, b) => a + b, 0) / values.length;
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

  get donutData(): DonutSegment[] {
    const dist = this.analytics?.clientTypeDistribution || [];
    const total = this.analytics?.totalSurveys || 0;
    let cumulativeDeg = 0;
    return dist.map((item, index) => {
      const frac = total > 0 ? item.count / total : 0;
      const segment: DonutSegment = {
        label: item.clientType,
        count: item.count,
        frac,
        length: frac * SurveyListComponent.DONUT_CIRCUMFERENCE,
        startDeg: cumulativeDeg,
        color: SurveyListComponent.DONUT_COLORS[index % SurveyListComponent.DONUT_COLORS.length],
      };
      cumulativeDeg += frac * 360;
      return segment;
    });
  }

  pct(frac: number): number {
    return Math.round(frac * 100);
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.filteredData.length === 0) {
      this.snackBar.open('No surveys found.', 'Close', { duration: 3000 });
    }
  }

  navigateToDetail(surveyId: number): void {
    this.router.navigate(['/admin/surveys', surveyId]);
  }

  private static readonly EXPORT_HEADERS = [
    'ID',
    'Ticket ID',
    'Client Type',
    'Date',
    'Sex',
    'Age',
    'Region of Residence',
    'Service Talisay',
    'Service External',
    'CC1 Awareness',
    'CC2 Visibility',
    'CC3 Helpfulness',
    'SQD0',
    'SQD1',
    'SQD2',
    'SQD3',
    'SQD4',
    'SQD5',
    'SQD6',
    'SQD7',
    'SQD8',
    'SQD Average',
    'Email Address',
    'Suggestions',
  ];

  exportCsv(): void {
    if (this.exporting) return;
    this.exporting = true;
    this.surveyService.getSurveys(1, 100000).subscribe({
      next: (response: PaginatedResponse<Survey>) => {
        const header = SurveyListComponent.EXPORT_HEADERS.join(',');
        const rows = response.items.map(survey =>
          [
            survey.id,
            survey.ticketId,
            survey.clientType,
            survey.date,
            survey.sex,
            survey.age,
            survey.regionOfResidence,
            survey.serviceTalisay ? 'Yes' : 'No',
            survey.serviceExternal ? 'Yes' : 'No',
            survey.cc1Awareness ?? '',
            survey.cc2Visibility ?? '',
            survey.cc3Helpfulness ?? '',
            survey.sqd0 ?? '',
            survey.sqd1 ?? '',
            survey.sqd2 ?? '',
            survey.sqd3 ?? '',
            survey.sqd4 ?? '',
            survey.sqd5 ?? '',
            survey.sqd6 ?? '',
            survey.sqd7 ?? '',
            survey.sqd8 ?? '',
            this.sqdAvgOf(survey)?.toFixed(2) ?? '',
            survey.emailAddress ?? '',
            survey.suggestions ?? '',
          ]
            .map(this.csvEscape)
            .join(',')
        );
        const csv = [header, ...rows].join('\r\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        this.downloadBlob(blob, `survey-responses-${new Date().toISOString().slice(0, 10)}.csv`);
        this.exporting = false;
      },
      error: (err: unknown) => {
        console.error('Export CSV failed', err);
        this.exporting = false;
        this.snackBar.open('Failed to export surveys.', 'Close', { duration: 5000 });
      },
    });
  }

  exportPdf(): void {
    if (this.exporting) return;
    this.exporting = true;
    this.surveyService.getSurveys(1, 100000).subscribe({
      next: (response: PaginatedResponse<Survey>) => {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
        doc.setFontSize(14);
        doc.setTextColor(0, 77, 64);
        doc.text('Survey Responses Report', 40, 40);
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text(
          `Carlos Hilado Memorial State University - ICT Office | Generated: ${new Date().toLocaleString()} | Total: ${response.total}`,
          40,
          56
        );
        autoTable(doc, {
          startY: 72,
          head: [SurveyListComponent.EXPORT_HEADERS],
          body: response.items.map(survey => [
            survey.id,
            survey.ticketId,
            survey.clientType,
            survey.date,
            survey.sex,
            survey.age,
            survey.regionOfResidence,
            survey.serviceTalisay ? 'Yes' : 'No',
            survey.serviceExternal ? 'Yes' : 'No',
            survey.cc1Awareness ?? '',
            survey.cc2Visibility ?? '',
            survey.cc3Helpfulness ?? '',
            survey.sqd0 ?? '',
            survey.sqd1 ?? '',
            survey.sqd2 ?? '',
            survey.sqd3 ?? '',
            survey.sqd4 ?? '',
            survey.sqd5 ?? '',
            survey.sqd6 ?? '',
            survey.sqd7 ?? '',
            survey.sqd8 ?? '',
            this.sqdAvgOf(survey)?.toFixed(2) ?? '',
            survey.emailAddress ?? '',
            survey.suggestions ?? '',
          ]),
          styles: { fontSize: 7, cellPadding: 3 },
          headStyles: { fillColor: [0, 77, 64], textColor: 255, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [240, 244, 243] },
        });
        doc.save(`survey-responses-${new Date().toISOString().slice(0, 10)}.pdf`);
        this.exporting = false;
      },
      error: (err: unknown) => {
        console.error('Export PDF failed', err);
        this.exporting = false;
        this.snackBar.open('Failed to export surveys.', 'Close', { duration: 5000 });
      },
    });
  }

  private csvEscape(value: unknown): string {
    const str = value === null || value === undefined ? '' : String(value);
    return /[",\r\n]/.test(str) ? '"' + str.replace(/"/g, '""') + '"' : str;
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  cutString(str: string, limit: number): string {
    return str.length > limit ? str.substring(0, limit) + '...' : str;
  }

  getSqdAvgClass(averageSqd?: number | null): string {
    if (averageSqd === undefined || averageSqd === null) return 'sqd-na';
    if (averageSqd >= 4) return 'sqd-high';
    if (averageSqd >= 3) return 'sqd-medium';
    if (averageSqd >= 2) return 'sqd-low';
    return 'sqd-very-low';
  }
}

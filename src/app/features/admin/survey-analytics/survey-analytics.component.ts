import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  PieController,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { SurveyService } from '../../../core/services/survey.service';
import { Survey } from '../../../core/models/survey.model';
import { HttpErrorResponse } from '@angular/common/http';
import { AdminToolbarComponent } from '../admin-toolbar/admin-toolbar';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  PieController,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

@Component({
  selector: 'app-survey-analytics',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    BaseChartDirective,
    AdminToolbarComponent,
  ],
  templateUrl: './survey-analytics.component.html',
  styleUrls: ['./survey-analytics.component.scss'],
})
export class SurveyAnalyticsComponent implements OnInit {
  private surveyService = inject(SurveyService);
  private fb = inject(FormBuilder);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  loading = false;
  allSurveys: Survey[] = [];
  filteredSurveys: Survey[] = [];

  filterForm = this.fb.group({
    clientType: [''],
    office: [''],
    dateFrom: [''],
    dateTo: [''],
  });

  clientTypes = ['CITIZEN', 'BUSINESS', 'GOVERNMENT'];
  offices: string[] = [];

  displayedColumns = ['id', 'date', 'clientType', 'office', 'service', 'averageSqd'];

  clientTypeChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  officeChartData: ChartData<'pie'> = { labels: [], datasets: [] };
  sqdChartData: ChartData<'bar'> = { labels: [], datasets: [] };

  clientTypeChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: { legend: { display: false } },
  };

  officeChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } },
  };

  sqdChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, max: 5 } },
  };

  ngOnInit(): void {
    this.loadSurveys();
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  loadSurveys(): void {
    this.loading = true;
    this.surveyService.getSurveys(1, 1000, '').subscribe({
      next: (response: any) => {
        this.allSurveys = response.items || [];
        this.extractOffices();
        this.applyFilters();
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to load surveys', err);
        this.loading = false;
      },
    });
  }

  extractOffices(): void {
    const officeSet = new Set<string>();
    this.allSurveys.forEach(s => {
      if (s.office) officeSet.add(s.office);
    });
    this.offices = Array.from(officeSet).sort();
  }

  applyFilters(): void {
    const { clientType, office, dateFrom, dateTo } = this.filterForm.value;
    this.filteredSurveys = this.allSurveys.filter(s => {
      if (clientType && s.clientType !== clientType) return false;
      if (office && s.office !== office) return false;
      if (dateFrom && s.date < dateFrom) return false;
      if (dateTo && s.date > dateTo) return false;
      return true;
    });
    this.updateCharts();
  }

  updateCharts(): void {
    const clientTypeCounts: Record<string, number> = {};
    const officeCounts: Record<string, number> = {};
    const sqdSums: Record<string, number> = {};
    const sqdCounts: Record<string, number> = {};

    this.filteredSurveys.forEach(s => {
      clientTypeCounts[s.clientType] = (clientTypeCounts[s.clientType] || 0) + 1;
      if (s.office) officeCounts[s.office] = (officeCounts[s.office] || 0) + 1;
      for (let i = 0; i <= 8; i++) {
        const key = `sqd${i}`;
        const val = (s as any)[key];
        if (val !== null && val !== undefined) {
          sqdSums[key] = (sqdSums[key] || 0) + val;
          sqdCounts[key] = (sqdCounts[key] || 0) + 1;
        }
      }
    });

    this.clientTypeChartData = {
      labels: Object.keys(clientTypeCounts),
      datasets: [{ data: Object.values(clientTypeCounts), backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726'] }],
    };

    this.officeChartData = {
      labels: Object.keys(officeCounts),
      datasets: [{ data: Object.values(officeCounts) }],
    };

    const sqdLabels = Object.keys(sqdSums).sort();
    const sqdAverages = sqdLabels.map(k => sqdCounts[k] > 0 ? sqdSums[k] / sqdCounts[k] : 0);
    this.sqdChartData = {
      labels: sqdLabels.map(k => k.toUpperCase()),
      datasets: [{ data: sqdAverages, backgroundColor: '#26A69A' }],
    };
  }

  clearFilters(): void {
    this.filterForm.reset({ clientType: '', office: '', dateFrom: '', dateTo: '' });
  }

  exportToCsv(): void {
    const headers = ['ID', 'Date', 'Client Type', 'Office', 'Service', 'Avg SQD'];
    const rows = this.filteredSurveys.map(s => [
      s.id,
      s.date,
      s.clientType,
      s.office || '',
      s.service || '',
      this.getAverageSqd(s).toFixed(2),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'survey-reports.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  exportToPdf(): void {
    const doc = new jsPDF();
    doc.text('Survey Reports', 14, 15);
    const headers = [['ID', 'Date', 'Client Type', 'Office', 'Service', 'Avg SQD']];
    const rows = this.filteredSurveys.map(s => [
      s.id,
      s.date,
      s.clientType,
      s.office || '',
      s.service || '',
      this.getAverageSqd(s).toFixed(2),
    ]);
    autoTable(doc, { head: headers, body: rows, startY: 20 });
    doc.save('survey-reports.pdf');
  }

  getAverageSqd(survey: Survey): number {
    const sqdFields = ['sqd0', 'sqd1', 'sqd2', 'sqd3', 'sqd4', 'sqd5', 'sqd6', 'sqd7', 'sqd8'];
    const values = sqdFields.map(f => (survey as any)[f]).filter(v => v !== null && v !== undefined);
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }

  get totalSurveys(): number {
    return this.filteredSurveys.length;
  }

  get averageSqd(): string {
    if (this.filteredSurveys.length === 0) return 'N/A';
    const sum = this.filteredSurveys.reduce((acc, s) => acc + this.getAverageSqd(s), 0);
    return (sum / this.filteredSurveys.length).toFixed(2);
  }

  get topOffice(): string {
    if (this.filteredSurveys.length === 0) return 'N/A';
    const counts: Record<string, number> = {};
    this.filteredSurveys.forEach(s => {
      if (s.office) counts[s.office] = (counts[s.office] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  }
}

import {
  Component,
  ChangeDetectionStrategy,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Apollo, gql } from 'apollo-angular';
import { map } from 'rxjs/operators';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';

const SURVEY_RESPONSES_QUERY = gql`
  query SurveyResponses($pagination: PaginationInput) {
    surveyResponses(pagination: $pagination) {
      items {
        id
        ticketId
        userId
        clientType
        date
        sex
        age
        regionOfResidence
        serviceTalisay
        serviceExternal
        cc1Awareness
        cc2Visibility
        cc3Helpfulness
        sqd0
        sqd1
        sqd2
        sqd3
        sqd4
        sqd5
        sqd6
        sqd7
        sqd8
        suggestions
        emailAddress
        createdAt
        user {
          id
          name
          email
        }
      }
      totalCount
      page
      pageSize
      totalPages
    }
  }
`;

const SURVEY_ANALYTICS_QUERY = gql`
  query SurveyAnalytics {
    surveyAnalytics {
      totalSurveys
      averageSqdScores {
        dimension
        average
        count
      }
      ccAwarenessDistribution {
        code
        label
        count
      }
    }
  }
`;

@Component({
  selector: 'app-surveys',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    DatePipe,
    NzCardModule,
    NzTableModule,
    NzTagModule,
    NzIconModule,
    NzStatisticModule,
    NzGridModule,
    NzSpinModule,
    NzEmptyModule,
    NzInputModule,
    NzDatePickerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="padding: 24px; max-width: 1400px; margin: 0 auto">
      <div
        style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px"
      >
        <h1
          style="margin: 0; font-size: 22px; font-weight: 600; display: flex; align-items: center; gap: 8px"
        >
          <nz-icon nzType="smile" nzTheme="outline"></nz-icon> Client Satisfaction Surveys
        </h1>
        <nz-tag nzColor="blue">{{ analytics()?.totalSurveys || 0 }} total</nz-tag>
      </div>

      <nz-spin [nzSpinning]="loading()">
        @if (analytics(); as a) {
          <div nz-row [nzGutter]="16" style="margin-bottom: 16px">
            <div nz-col [nzXs]="24" [nzSm]="8">
              <nz-card
                ><nz-statistic [nzValue]="a.totalSurveys" [nzTitle]="'Total Surveys'"></nz-statistic
              ></nz-card>
            </div>
            @for (avg of a.averageSqdScores.slice(0, 3); track avg.dimension) {
              <div nz-col [nzXs]="24" [nzSm]="8">
                <nz-card
                  ><nz-statistic [nzValue]="avg.average" [nzTitle]="avg.dimension"></nz-statistic
                ></nz-card>
              </div>
            }
          </div>
        }

        <!-- Search & Filter -->
        <div style="display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap">
          <nz-input-group nzSearch [nzAddOnBefore]="searchIcon" style="max-width: 300px">
            <ng-template #searchIcon><nz-icon nzType="search"></nz-icon></ng-template>
            <input
              nz-input
              placeholder="Search by name or email..."
              [ngModel]="searchText()"
              (ngModelChange)="searchText.set($event)"
            />
          </nz-input-group>
        </div>

        @if (analytics(); as a) {
          <nz-card nzTitle="Service Quality Dimension (SQD) Averages" style="margin-bottom: 16px">
            <nz-table [nzData]="a.averageSqdScores" [nzShowPagination]="false" nzSize="small">
              <thead>
                <tr>
                  <th>Dimension</th>
                  <th>Average Score</th>
                  <th>Responses</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                @for (score of a.averageSqdScores; track score.dimension) {
                  <tr>
                    <td>{{ score.dimension }}</td>
                    <td>
                      <strong
                        [style.color]="
                          score.average >= 4
                            ? '#52c41a'
                            : score.average >= 3
                              ? '#faad14'
                              : '#ff4d4f'
                        "
                        >{{ score.average | number: '1.2-2' }}</strong
                      >
                    </td>
                    <td>{{ score.count }}</td>
                    <td>
                      @if (score.average >= 4) {
                        <nz-tag nzColor="green">Good</nz-tag>
                      } @else if (score.average >= 3) {
                        <nz-tag nzColor="orange">Fair</nz-tag>
                      } @else {
                        <nz-tag nzColor="red">Needs Improvement</nz-tag>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </nz-table>
          </nz-card>
        }

        <!-- Survey Responses with Pagination -->
        <nz-card nzTitle="Survey Responses">
          @if (filteredSurveys().length > 0) {
            <nz-table
              [nzData]="filteredSurveys()"
              [nzLoading]="loading()"
              nzSize="small"
              [nzPageSize]="pageSize()"
              [nzShowSizeChanger]="true"
              [nzPageSizeOptions]="[5, 10, 20, 50]"
              [nzTotal]="totalCount()"
              [nzPageIndex]="currentPage()"
              (nzPageIndexChange)="currentPage.set($event)"
              (nzPageSizeChange)="pageSize.set($event)"
            >
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>User</th>
                  <th>Date</th>
                  <th>Avg SQD</th>
                  <th>Type</th>
                  <th>Suggestions</th>
                </tr>
              </thead>
              <tbody>
                @for (s of filteredSurveys(); track s.id) {
                  <tr>
                    <td>
                      <a routerLink="/tickets/{{ s.ticketId }}">{{ s.ticketId }}</a>
                    </td>
                    <td>{{ s.user?.name || s.user?.email }}</td>
                    <td>{{ s.createdAt | date: 'shortDate' }}</td>
                    <td>
                      <strong
                        [style.color]="
                          calcAvgSqd(s) >= 4
                            ? '#52c41a'
                            : calcAvgSqd(s) >= 3
                              ? '#faad14'
                              : '#ff4d4f'
                        "
                        >{{ calcAvgSqd(s) | number: '1.1-1' }}</strong
                      >
                    </td>
                    <td>{{ s.clientType || '-' }}</td>
                    <td
                      style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap"
                    >
                      {{ s.suggestions || '-' }}
                    </td>
                  </tr>
                }
              </tbody>
            </nz-table>
          } @else {
            <nz-empty
              nzNotFoundImage="simple"
              nzNotFoundContent="No survey responses yet"
            ></nz-empty>
          }
        </nz-card>
      </nz-spin>
    </div>
  `,
})
export class SurveysPage implements OnInit {
  private readonly apollo = inject(Apollo);

  readonly loading = signal(false);
  readonly allSurveys = signal<any[]>([]);
  readonly analytics = signal<any>(null);
  readonly searchText = signal('');
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly totalCount = signal(0);

  readonly filteredSurveys = computed(() => {
    const search = this.searchText().toLowerCase().trim();
    const surveys = this.allSurveys();
    if (!search) return surveys;
    return surveys.filter(
      (s) =>
        (s.user?.name?.toLowerCase() || '').includes(search) ||
        (s.user?.email?.toLowerCase() || '').includes(search),
    );
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.apollo
      .query<any>({
        query: SURVEY_RESPONSES_QUERY,
        variables: { pagination: { page: 1, pageSize: 100 } },
        fetchPolicy: 'network-only',
      })
      .pipe(map((r) => r.data?.surveyResponses))
      .subscribe({
        next: (data) => {
          if (data?.items) {
            this.allSurveys.set(data.items);
            this.totalCount.set(data.totalCount);
          }
        },
        error: (err) => console.error('Failed to load surveys:', err),
      });

    this.apollo
      .query<any>({
        query: SURVEY_ANALYTICS_QUERY,
        fetchPolicy: 'network-only',
      })
      .pipe(map((r) => r.data?.surveyAnalytics))
      .subscribe({
        next: (data) => {
          if (data) this.analytics.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Failed to load analytics:', err);
          this.loading.set(false);
        },
      });
  }

  calcAvgSqd(survey: any): number {
    const fields = ['sqd0', 'sqd1', 'sqd2', 'sqd3', 'sqd4', 'sqd5', 'sqd6', 'sqd7', 'sqd8'];
    const values = fields.map((f) => survey[f]).filter((v: any) => v !== null && v !== undefined);
    if (values.length === 0) return 0;
    return values.reduce((a: number, b: number) => a + b, 0) / values.length;
  }
}

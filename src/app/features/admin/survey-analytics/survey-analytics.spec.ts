import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { SurveyAnalyticsComponent } from './survey-analytics.component';
import { SurveyService } from '../../../core/services/survey.service';

describe('SurveyAnalyticsComponent', () => {
  let component: SurveyAnalyticsComponent;
  let fixture: ComponentFixture<SurveyAnalyticsComponent>;

  beforeEach(async () => {
    const surveyServiceSpy = jasmine.createSpyObj('SurveyService', ['getSurveys']);
    surveyServiceSpy.getSurveys.and.returnValue(
      of({ items: [], total: 0, page: 1, limit: 1000 })
    );

    await TestBed.configureTestingModule({
      imports: [SurveyAnalyticsComponent],
      providers: [provideRouter([]), { provide: SurveyService, useValue: surveyServiceSpy }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SurveyAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load surveys on init', () => {
    expect(component.allSurveys).toBeDefined();
  });

  it('should apply filters', () => {
    component.allSurveys = [
      { id: 1, date: '2024-01-01', clientType: 'CITIZEN', office: 'Office A', service: 'Service 1' } as any,
      { id: 2, date: '2024-01-02', clientType: 'BUSINESS', office: 'Office B', service: 'Service 2' } as any,
    ];
    component.filterForm.patchValue({ clientType: 'CITIZEN' });
    component.applyFilters();
    expect(component.filteredSurveys.length).toBe(1);
    expect(component.filteredSurveys[0].clientType).toBe('CITIZEN');
  });

  it('should clear filters', () => {
    component.filterForm.patchValue({ clientType: 'CITIZEN', office: 'Office A' });
    component.clearFilters();
    expect(component.filterForm.value.clientType).toBe('');
    expect(component.filterForm.value.office).toBe('');
  });

  it('should calculate average SQD', () => {
    const survey = { sqd0: 4, sqd1: 3, sqd2: 5, sqd3: null, sqd4: 2, sqd5: 4, sqd6: 3, sqd7: 5, sqd8: 4 } as any;
    const avg = component.getAverageSqd(survey);
    expect(avg).toBeCloseTo(3.75, 2);
  });

  it('should export to CSV', () => {
    component.filteredSurveys = [
      { id: 1, date: '2024-01-01', clientType: 'CITIZEN', office: 'Office A', service: 'Service 1', sqd0: 4 } as any,
    ];
    spyOn(URL, 'createObjectURL').and.returnValue('blob:url');
    spyOn(document, 'createElement').and.returnValue({ click: () => {}, href: '', download: '' } as any);
    component.exportToCsv();
    expect(URL.createObjectURL).toHaveBeenCalled();
  });
});

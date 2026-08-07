import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { SurveyListComponent } from './survey-list.component';
import { SurveyService } from '../../../core/services/survey.service';

describe('SurveyListComponent', () => {
  let component: SurveyListComponent;
  let fixture: ComponentFixture<SurveyListComponent>;

  beforeEach(async () => {
    const surveyServiceSpy = jasmine.createSpyObj('SurveyService', ['getSurveys', 'getAnalytics']);
    surveyServiceSpy.getSurveys.and.returnValue(of({ items: [], total: 0, page: 1, limit: 10, totalPages: 0 }));
    surveyServiceSpy.getAnalytics.and.returnValue(
      of({ totalSurveys: 0, averageSqd: 0, clientTypeDistribution: [], sqdAveragesPerQuestion: {} })
    );

    await TestBed.configureTestingModule({
      imports: [SurveyListComponent],
      providers: [provideRouter([]), { provide: SurveyService, useValue: surveyServiceSpy }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SurveyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
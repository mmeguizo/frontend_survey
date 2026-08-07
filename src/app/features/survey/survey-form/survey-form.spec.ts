import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { SurveyFormComponent } from './survey-form';
import { SurveyService } from '../../../core/services/survey.service';

describe('SurveyForm', () => {
  let component: SurveyFormComponent;
  let fixture: ComponentFixture<SurveyFormComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    const surveyServiceSpy = jasmine.createSpyObj('SurveyService', ['submitSurvey']);

    await TestBed.configureTestingModule({
      imports: [SurveyFormComponent],
      providers: [
        { provide: SurveyService, useValue: surveyServiceSpy },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(SurveyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    httpMock.expectOne('https://psgc.cloud/api/regions').flush([]);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
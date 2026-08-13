import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { SurveyFormComponent } from './survey-form';
import { SurveyService } from '../../../core/services/survey.service';

describe('SurveyForm', () => {
  let component: SurveyFormComponent;
  let fixture: ComponentFixture<SurveyFormComponent>;

  beforeEach(async () => {
    const surveyServiceSpy = jasmine.createSpyObj('SurveyService', ['submitSurvey']);

    await TestBed.configureTestingModule({
      imports: [SurveyFormComponent],
      providers: [
        { provide: SurveyService, useValue: surveyServiceSpy },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SurveyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
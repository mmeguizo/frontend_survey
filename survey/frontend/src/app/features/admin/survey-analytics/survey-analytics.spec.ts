import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyAnalytics } from './survey-analytics';

describe('SurveyAnalytics', () => {
  let component: SurveyAnalytics;
  let fixture: ComponentFixture<SurveyAnalytics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveyAnalytics]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SurveyAnalytics);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

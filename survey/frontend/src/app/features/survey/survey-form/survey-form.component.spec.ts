import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SurveyFormComponent } from './survey-form';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SurveyService } from '../../core/services/survey.service';
import { of } from 'rxjs';

describe('SurveyFormComponent', () => {
  let component: SurveyFormComponent;
  let fixture: ComponentFixture<SurveyFormComponent>;
  let surveyService: jasmine.SpyObj<SurveyService>;

  beforeEach(async () => {
    const surveyServiceSpy = jasmine.createSpyObj('SurveyService', ['submitSurvey']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatRadioModule,
        MatCheckboxModule,
        MatButtonModule,
        MatStepperModule,
        MatIconModule,
        MatSnackBarModule,
        SurveyFormComponent,
      ],
      providers: [
        { provide: SurveyService, useValue: surveyServiceSpy },
      ],
    }).compileComponents();

    surveyService = TestBed.inject(SurveyService) as jasmine.SpyObj<SurveyService>;
    fixture = TestBed.createComponent(SurveyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.step1Form.get('date')?.value).toEqual(expect.any(String));
    expect(component.step1Form.get('age')?.value).toBe('');
    expect(component.step1Form.get('regionOfResidence')?.value).toBe('');
    expect(component.step1Form.get('serviceTalisay')?.value).toBe(false);
    expect(component.step1Form.get('serviceExternal')?.value).toBe(false);
  });

  it('should disable CC2/CC3 when CC1=4 (not aware)', () => {
    component.step1Form.get('cc1Awareness')?.setValue('4');
    fixture.detectChanges();

    expect(component.step1Form.get('cc2Visibility')?.disabled).toBeTrue();
    expect(component.step1Form.get('cc3Helpfulness')?.disabled).toBeTrue();
  });

  it('should enable CC2/CC3 when CC1!=4', () => {
    component.step1Form.get('cc1Awareness')?.setValue('1');
    fixture.detectChanges();

    expect(component.step1Form.get('cc2Visibility')?.disabled).toBeFalse();
    expect(component.step1Form.get('cc3Helpfulness')?.disabled).toBeFalse();
  });

  it('should start survey from landing page', () => {
    expect(component.showLanding).toBeTrue();
    component.startSurvey();
    expect(component.showLanding).toBeFalse();
  });

  it('should call surveyService.submitSurvey on submit', () => {
    component.step1Form.patchValue({
      clientType: 'CITIZEN',
      date: '2024-01-01',
      sex: 'MALE',
      age: '30',
      regionOfResidence: 'Region VI',
      serviceTalisay: true,
      serviceExternal: false,
      cc1Awareness: '1',
      cc2Visibility: '1',
      cc3Helpfulness: '1',
    });
    component.step2Form.patchValue({
      sqd0: '4',
    });

    surveyService.submitSurvey.and.returnValue(of({}));

    component.submit();

    expect(surveyService.submitSurvey).toHaveBeenCalledWith(
      jasmine.objectContaining({
        clientType: 'CITIZEN',
        sex: 'MALE',
        age: 30,
      })
    );
  });
});

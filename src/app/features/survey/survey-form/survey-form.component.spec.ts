import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SurveyFormComponent } from './survey-form';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { SurveyService } from '../../../core/services/survey.service';
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
        MatChipsModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatStepperModule,
        MatIconModule,
        MatSnackBarModule,
        SurveyFormComponent,
      ],
      providers: [
        { provide: SurveyService, useValue: surveyServiceSpy },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
      ],
    }).compileComponents();

    surveyService = TestBed.inject(SurveyService) as jasmine.SpyObj<SurveyService>;
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

  it('should initialize form with default values', () => {
    expect(component.step1Form.get('date')?.value).toBeTruthy();
    expect(component.step1Form.get('age')?.value).toBe('');
    expect(component.step1Form.get('office')?.value).toBe('');
    expect(component.step1Form.get('service')?.value).toBe('');
  });

  it('should keep CC2/CC3 available and required even when CC1=4 (not aware)', () => {
    component.step1Form.get('cc1Awareness')?.setValue('4');
    fixture.detectChanges();

    expect(component.step1Form.get('cc2Visibility')?.disabled).toBeFalse();
    expect(component.step1Form.get('cc3Helpfulness')?.disabled).toBeFalse();
    expect(component.step1Form.get('cc2Visibility')?.hasError('required')).toBeTrue();
    expect(component.step1Form.get('cc3Helpfulness')?.hasError('required')).toBeTrue();
  });

  it('should keep CC2/CC3 enabled and required when CC1!=4', () => {
    component.step1Form.get('cc1Awareness')?.setValue('1');
    fixture.detectChanges();

    expect(component.step1Form.get('cc2Visibility')?.disabled).toBeFalse();
    expect(component.step1Form.get('cc3Helpfulness')?.disabled).toBeFalse();
    expect(component.step1Form.get('cc2Visibility')?.hasError('required')).toBeTrue();
    expect(component.step1Form.get('cc3Helpfulness')?.hasError('required')).toBeTrue();
  });

  it('should start survey from landing page', () => {
    expect(component.showLanding).toBeTrue();
    component.startSurvey();
    expect(component.showLanding).toBeFalse();
  });

  it('should expose only the selected office services', () => {
    component.step1Form.get('office')?.setValue('business-affairs');
    fixture.detectChanges();
    expect(component.selectedOfficeServices.map(s => s.id)).toEqual([
      'rental-of-facilities',
      'bookstore-services',
      'printing-services',
      'shop-services',
    ]);

    component.step1Form.get('office')?.setValue('alumni-relations');
    fixture.detectChanges();
    expect(component.selectedOfficeServices.length).toBe(1);
    expect(component.selectedOfficeServices[0].id).toBe('release-of-yearbook-graduation-pictures');
  });

  it('should reset the service and clear its touched state when the office changes', () => {
    component.step1Form.get('office')?.setValue('business-affairs');
    component.step1Form.get('service')?.setValue('printing-services');
    component.step1Form.get('service')?.markAsTouched();
    expect(component.step1Form.get('service')?.touched).toBeTrue();

    component.step1Form.get('office')?.setValue('alumni-relations');
    fixture.detectChanges();

    expect(component.step1Form.get('service')?.value).toBe('');
    expect(component.step1Form.get('service')?.touched).toBeFalse();
    expect(component.step1Form.get('service')?.valid).toBeFalse();
    expect(component.step1Form.get('service')?.hasError('required')).toBeTrue();
    expect(component.serviceSearchControl.value).toBe('');
  });

  it('should filter services by search term', () => {
    component.step1Form.get('office')?.setValue('business-affairs');
    fixture.detectChanges();
    component.serviceSearchControl.setValue('shop');

    expect(component.availableServices.map(s => s.id)).toEqual(['shop-services']);
  });

  it('should show all services when search is empty', () => {
    component.step1Form.get('office')?.setValue('business-affairs');
    fixture.detectChanges();

    expect(component.availableServices.map(s => s.id)).toEqual([
      'rental-of-facilities',
      'bookstore-services',
      'printing-services',
      'shop-services',
    ]);
  });

  it('should refresh the dropdown services when the office changes', () => {
    component.step1Form.get('office')?.setValue('business-affairs');
    fixture.detectChanges();
    expect(component.availableServices.map(s => s.id)).toEqual([
      'rental-of-facilities',
      'bookstore-services',
      'printing-services',
      'shop-services',
    ]);

    component.step1Form.get('office')?.setValue('registrar');
    fixture.detectChanges();
    expect(component.availableServices.map(s => s.id)).toEqual([
      'enrollment-of-continuing-students',
      'certification-authentication-verification-cav',
      'official-transcript-of-record',
      'various-certification-and-documents',
    ]);
  });

  it('should add a service via autocomplete selection and show label in field', () => {
    component.step1Form.get('office')?.setValue('business-affairs');
    fixture.detectChanges();
    const printing = component.selectedOfficeServices.find(s => s.id === 'printing-services')!;

    component.onServiceSelected({ option: { value: printing } } as any);

    expect(component.step1Form.get('service')?.value).toBe('printing-services');
    expect(component.serviceSearchControl.value).toBe('Request for Printing Services');
  });

  it('should clear the selected service', () => {
    component.step1Form.get('office')?.setValue('business-affairs');
    component.step1Form.get('service')?.setValue('printing-services');
    component.serviceSearchControl.setValue('Request for Printing Services');
    fixture.detectChanges();

    component.clearService();

    expect(component.step1Form.get('service')?.value).toBe('');
    expect(component.serviceSearchControl.value).toBe('');
  });

  it('should require office and require service only after an office is selected', () => {
    expect(component.step1Form.get('office')?.hasError('required')).toBeTrue();
    expect(component.step1Form.get('service')?.hasError('required')).toBeFalse();

    component.step1Form.get('office')?.setValue('business-affairs');
    fixture.detectChanges();

    expect(component.step1Form.get('office')?.valid).toBeTrue();
    expect(component.step1Form.get('service')?.hasError('required')).toBeTrue();

    component.step1Form.get('service')?.setValue('printing-services');
    fixture.detectChanges();

    expect(component.step1Form.get('service')?.valid).toBeTrue();
  });

  it('should map the selected service for review display', () => {
    component.step1Form.get('office')?.setValue('business-affairs');
    component.step1Form.get('service')?.setValue('printing-services');
    fixture.detectChanges();

    expect(component.selectedOffice?.label).toBe('Business Affairs Office');
    expect(component.selectedServiceLabel).toBe('Request for Printing Services');
    expect(component.serviceClassification).toBe('INTERNAL');
  });

  it('should submit the selected office, service, and internal/external tag', () => {
    component.step1Form.patchValue({
      clientType: 'CITIZEN',
      date: '2024-01-01',
      sex: 'MALE',
      age: '30',
      office: 'business-affairs',
      service: 'printing-services',
      cc1Awareness: '1',
      cc2Visibility: '1',
      cc3Helpfulness: '1',
    });
    component.step2Form.patchValue({
      sqd0: '4',
      sqd1: '4',
      sqd2: '4',
      sqd3: '4',
      sqd4: '4',
      sqd5: '4',
      sqd6: '4',
      sqd7: '4',
      sqd8: '4',
    });

    surveyService.submitSurvey.and.returnValue(of({} as any));

    component.submit();

    expect(surveyService.submitSurvey).toHaveBeenCalledWith(
      jasmine.objectContaining({
        clientType: 'CITIZEN',
        sex: 'MALE',
        age: 30,
        office: 'Business Affairs Office',
        service: 'Request for Printing Services',
        internalExternal: 'INTERNAL',
      })
    );
    const payload = surveyService.submitSurvey.calls.mostRecent().args[0] as unknown as Record<string, unknown>;
    expect(payload['serviceTalisay']).toBeUndefined();
    expect(payload['serviceExternal']).toBeUndefined();
  });
});
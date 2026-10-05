import { Component, inject, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { SurveyService } from '../../../core/services/survey.service';
import { CreateSurveyDto } from '../../../core/models/survey.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-survey-form',
  standalone: true,
  imports: [
    CommonModule,
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
    MatProgressSpinnerModule,
  ],
  templateUrl: './survey-form.html',
  styleUrl: './survey-form.scss',
})
export class SurveyFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private surveyService = inject(SurveyService);
  private snackBar = inject(MatSnackBar);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  @ViewChild('stepper') stepper!: MatStepper;

  isSubmitting = false;
  isSubmitted = false;
  showLanding = true;
  currentUrl = window.location.href;
  surveyUrl = window.location.origin + '/survey?start=1';
  qrCodeDataUrl: string = '';

  clientTypeOptions = [
    { value: 'CITIZEN', label: 'Citizen' },
    { value: 'BUSINESS', label: 'Business' },
    { value: 'GOVERNMENT', label: 'Government' },
  ];

  regions: string[] = [];
  regionsLoading = false;

  private static readonly PHILIPPINE_REGIONS = [
    'Region I (Ilocos Region)',
    'Region II (Cagayan Valley)',
    'Region III (Central Luzon)',
    'Region IV-A (CALABARZON)',
    'MIMAROPA Region',
    'Region V (Bicol Region)',
    'Region VI (Western Visayas)',
    'Region VII (Central Visayas)',
    'Region VIII (Eastern Visayas)',
    'Region IX (Zamboanga Peninsula)',
    'Region X (Northern Mindanao)',
    'Region XI (Davao Region)',
    'Region XII (SOCCSKSARGEN)',
    'National Capital Region (NCR)',
    'Cordillera Administrative Region (CAR)',
    'Region XIII (Caraga)',
    'Bangsamoro Autonomous Region In Muslim Mindanao (BARMM)',
  ];

  sqdQuestions = [
    { key: 'sqd0', label: 'SQD 0', en: 'Overall, how will you rate the service you received?', tl: 'Sa kabuuan, paano mo rarating ang serbisyong natanggap mo?' },
    { key: 'sqd1', label: 'SQD 1', en: 'The personnel greeted you promptly and courteously.', tl: 'Ang bata ay nakaraptas at mabait.' },
    { key: 'sqd2', label: 'SQD 2', en: 'The personnel were knowledgeable about the service.', tl: 'Ang mga tao ay mayroong kaalaman tungkol sa serbisyo.' },
    { key: 'sqd3', label: 'SQD 3', en: 'The service was provided within reasonable time.', tl: 'Ang serbisyo ay ibinigay sa sapat na oras.' },
    { key: 'sqd4', label: 'SQD 4', en: 'The office was clean and well-maintained.', tl: 'Ang opisina ay malinis at mabuti.' },
    { key: 'sqd5', label: 'SQD 5', en: 'The fees (if any) were clearly posted.', tl: 'Ang mga bayad (kung mayroon) ay malinaw na ipinakita.' },
    { key: 'sqd6', label: 'SQD 6', en: 'You were given complete information about the requirements.', tl: 'Binigyan ka ng buong impormasyon tungkol sa mga kinakailangan.' },
    { key: 'sqd7', label: 'SQD 7', en: 'The service counter was easily accessible.', tl: 'Ang lakad ng serbisyo ay madaling maa-access.' },
    { key: 'sqd8', label: 'SQD 8', en: 'The overall appearance of the office was satisfactory.', tl: 'Ang kabuuang hitsura ng opisina ay pekeng-pekeng.' },
  ];

  ratingOptions = [
    { value: 5, label: 'Strongly Agree' },
    { value: 4, label: 'Agree' },
    { value: 3, label: 'Neutral' },
    { value: 2, label: 'Disagree' },
    { value: 1, label: 'Strongly Disagree' },
    { value: 0, label: 'N/A' },
  ];

  step1Form = this.fb.group({
    clientType: ['', Validators.required],
    date: [new Date().toISOString().split('T')[0], Validators.required],
    sex: ['', Validators.required],
    age: ['', [Validators.required, Validators.min(1), Validators.max(150)]],
    regionOfResidence: ['', Validators.required],
    serviceTalisay: [false],
    serviceExternal: [false],
    cc1Awareness: ['', Validators.required],
    cc2Visibility: [''],
    cc3Helpfulness: [''],
  });

  step2Form = this.fb.group({
    sqd0: ['', Validators.required],
    sqd1: ['', Validators.required],
    sqd2: ['', Validators.required],
    sqd3: ['', Validators.required],
    sqd4: ['', Validators.required],
    sqd5: ['', Validators.required],
    sqd6: ['', Validators.required],
    sqd7: ['', Validators.required],
    sqd8: ['', Validators.required],
    suggestions: [''],
    emailAddress: ['', Validators.email],
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['start'] === '1') {
        this.showLanding = false;
      }
    });
    this.generateQrCode();
    this.loadRegions();
  }

  loadRegions(): void {
    this.regionsLoading = true;
    this.http
      .get<{ name: string; code: string }[]>('https://psgc.cloud/api/regions')
      .subscribe({
        next: data => {
          this.regions = (data || []).map(region => region.name);
          this.regionsLoading = false;
        },
        error: () => {
          this.regions = SurveyFormComponent.PHILIPPINE_REGIONS;
          this.regionsLoading = false;
        },
      });
  }

  generateQrCode(): void {
    QRCode.toDataURL(this.surveyUrl, { width: 220, margin: 2 })
      .then((url: string) => {
        this.qrCodeDataUrl = url;
      })
      .catch((err: unknown) => {
        console.error('Failed to generate QR code', err);
      });
  }

  constructor() {
    this.step1Form.get('cc1Awareness')?.valueChanges.subscribe((value: string | null) => {
      const cc2 = this.step1Form.get('cc2Visibility');
      const cc3 = this.step1Form.get('cc3Helpfulness');
      if (+(value ?? '') === 4) {
        cc2?.disable();
        cc3?.disable();
        cc2?.setValue('');
        cc3?.setValue('');
      } else {
        cc2?.enable();
        cc3?.enable();
        cc2?.setValidators([Validators.required, Validators.min(1), Validators.max(5)]);
        cc3?.setValidators([Validators.required, Validators.min(1), Validators.max(4)]);
      }
      cc2?.updateValueAndValidity();
      cc3?.updateValueAndValidity();
    });
  }

  get hasServiceChecked(): boolean {
    return !!(this.step1Form.get('serviceTalisay')?.value || this.step1Form.get('serviceExternal')?.value);
  }

  startSurvey(): void {
    this.showLanding = false;
  }

  goNext(): void {
    if (this.stepper.selectedIndex === 0) {
      if (this.step1Form.invalid) {
        this.step1Form.markAllAsTouched();
        this.snackBar.open('Please complete all required fields in Step 1.', 'Close', { duration: 5000 });
        return;
      }
    }
    if (this.stepper.selectedIndex === 1) {
      if (this.step2Form.invalid) {
        this.step2Form.markAllAsTouched();
        this.snackBar.open('Please complete the required fields in Step 2.', 'Close', { duration: 5000 });
        return;
      }
    }
    this.stepper.next();
  }

  goBack(): void {
    this.stepper.previous();
  }

  submit(): void {
    if (this.step1Form.invalid || this.step2Form.invalid) {
      this.step1Form.markAllAsTouched();
      this.step2Form.markAllAsTouched();
      this.snackBar.open('Please fill in all required fields.', 'Close', { duration: 5000 });
      return;
    }

    this.isSubmitting = true;
    const s1 = this.step1Form.getRawValue();
    const s2 = this.step2Form.getRawValue();

    const surveyData = {
      clientType: s1.clientType ?? 'CITIZEN',
      date: s1.date ?? '',
      sex: s1.sex ?? 'MALE',
      age: +(s1.age ?? 0),
      regionOfResidence: s1.regionOfResidence ?? '',
      serviceTalisay: s1.serviceTalisay ?? false,
      serviceExternal: s1.serviceExternal ?? false,
      cc1Awareness: +(s1.cc1Awareness ?? '') === 4 ? undefined : +(s1.cc1Awareness ?? 0) || undefined,
      cc2Visibility: +(s1.cc1Awareness ?? '') === 4 ? undefined : +(s1.cc2Visibility ?? 0) || undefined,
      cc3Helpfulness: +(s1.cc1Awareness ?? '') === 4 ? undefined : +(s1.cc3Helpfulness ?? 0) || undefined,
      sqd0: +(s2.sqd0 ?? '') === 0 ? undefined : +(s2.sqd0 ?? 0) || undefined,
      sqd1: +(s2.sqd1 ?? '') === 0 ? undefined : +(s2.sqd1 ?? 0) || undefined,
      sqd2: +(s2.sqd2 ?? '') === 0 ? undefined : +(s2.sqd2 ?? 0) || undefined,
      sqd3: +(s2.sqd3 ?? '') === 0 ? undefined : +(s2.sqd3 ?? 0) || undefined,
      sqd4: +(s2.sqd4 ?? '') === 0 ? undefined : +(s2.sqd4 ?? 0) || undefined,
      sqd5: +(s2.sqd5 ?? '') === 0 ? undefined : +(s2.sqd5 ?? 0) || undefined,
      sqd6: +(s2.sqd6 ?? '') === 0 ? undefined : +(s2.sqd6 ?? 0) || undefined,
      sqd7: +(s2.sqd7 ?? '') === 0 ? undefined : +(s2.sqd7 ?? 0) || undefined,
      sqd8: +(s2.sqd8 ?? '') === 0 ? undefined : +(s2.sqd8 ?? 0) || undefined,
      suggestions: s2.suggestions || undefined,
      emailAddress: s2.emailAddress || undefined,
    } as CreateSurveyDto;

    this.surveyService.submitSurvey(surveyData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.isSubmitted = true;
        this.snackBar.open('Survey submitted successfully!', 'Close', { duration: 5000 });
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting = false;
        if (err.status === 409) {
          this.snackBar.open('A survey with this information already exists.', 'Close', { duration: 5000 });
        } else {
          this.snackBar.open('Failed to submit survey. Please try again.', 'Close', { duration: 5000 });
        }
      },
    });
  }

  retry(): void {
    this.isSubmitted = false;
    this.step1Form.reset();
    this.step2Form.reset();
    this.step1Form.get('date')?.setValue(new Date().toISOString().split('T')[0]);
  }
}

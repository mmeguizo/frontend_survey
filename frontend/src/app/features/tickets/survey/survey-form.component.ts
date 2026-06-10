import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';

export interface ClientSurveyInput {
  clientType?: string;
  date?: string;
  sex?: string;
  age?: number;
  regionOfResidence?: string;
  serviceTalisay: boolean;
  serviceExternal: boolean;
  cc1Awareness?: number;
  cc2Visibility?: number;
  cc3Helpfulness?: number;
  sqd0?: number;
  sqd1?: number;
  sqd2?: number;
  sqd3?: number;
  sqd4?: number;
  sqd5?: number;
  sqd6?: number;
  sqd7?: number;
  sqd8?: number;
  suggestions?: string;
  emailAddress?: string;
}

@Component({
  selector: 'app-survey-form',
  imports: [CommonModule, FormsModule, NzButtonModule, NzIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './survey-form.component.html',
  styleUrls: ['./survey-form.component.scss'],
})
export class SurveyFormComponent {
  private readonly message = inject(NzMessageService);

  /** Ticket ID for which this survey is being submitted */
  readonly ticketId = input.required<number>();

  /** Emitted when survey is successfully submitted */
  readonly submitted = output<ClientSurveyInput>();

  // Page navigation
  readonly showPage2 = signal(false);

  // Page 1 — Demographics
  readonly clientType = signal<string | undefined>(undefined);
  readonly surveyDate = signal<string>(new Date().toISOString().split('T')[0]);
  readonly sex = signal<string | undefined>(undefined);
  readonly age = signal<number | undefined>(undefined);
  readonly regionOfResidence = signal('');
  readonly serviceTalisay = signal(false);
  readonly serviceExternal = signal(false);

  // CC Questions
  readonly cc1Awareness = signal<number | undefined>(undefined);
  readonly cc2Visibility = signal<number | undefined>(undefined);
  readonly cc3Helpfulness = signal<number | undefined>(undefined);

  // SQD values
  readonly sqd0 = signal<number | undefined>(undefined);
  readonly sqd1 = signal<number | undefined>(undefined);
  readonly sqd2 = signal<number | undefined>(undefined);
  readonly sqd3 = signal<number | undefined>(undefined);
  readonly sqd4 = signal<number | undefined>(undefined);
  readonly sqd5 = signal<number | undefined>(undefined);
  readonly sqd6 = signal<number | undefined>(undefined);
  readonly sqd7 = signal<number | undefined>(undefined);
  readonly sqd8 = signal<number | undefined>(undefined);

  // Footer
  readonly suggestions = signal('');
  readonly emailAddress = signal('');

  // Submission state
  readonly submitting = signal(false);

  readonly cc1Options = [
    {
      value: 1,
      label: "I know what a CC is and I saw this office's CC.",
    },
    {
      value: 2,
      label: "I know what a CC is but I did NOT see this office's CC.",
    },
    {
      value: 3,
      label: "I learned of the CC only when I saw this office's CC.",
    },
    {
      value: 4,
      label: 'I do not know what a CC is and I did not see one in this office.',
    },
  ];

  readonly cc2Options = [
    { value: 1, label: 'Easy to see' },
    { value: 2, label: 'Somewhat easy to see' },
    { value: 3, label: 'Difficult to see' },
    { value: 4, label: 'Not visible at all' },
    { value: 5, label: 'N/A' },
  ];

  readonly cc3Options = [
    { value: 1, label: 'Helped very much' },
    { value: 2, label: 'Somewhat helped' },
    { value: 3, label: 'Did not help' },
    { value: 4, label: 'N/A' },
  ];

  readonly sqdQuestions = [
    {
      key: 'sqd0',
      english: 'I am satisfied with the service that I availed.',
      tagalog: 'Nasiyahan ako sa serbisyo na aking natanggap sa napuntahan na tanggapan.',
    },
    {
      key: 'sqd1',
      english: 'I spent a reasonable amount of time for my transaction.',
      tagalog: 'Makatwiran ang oras na aking ginugol para sa pagproseso ng aking transaksyon.',
    },
    {
      key: 'sqd2',
      english:
        "The office followed the transaction's requirements and steps based on the information provided.",
      tagalog:
        'Ang opisina ay sumusunod sa mga kinakailangang dokumento at mga hakbang batay sa impormasyong ibinigay.',
    },
    {
      key: 'sqd3',
      english:
        'The steps (including payment) I needed to do for my transaction were easy and simple.',
      tagalog: 'Ang mga hakbang sa pagproseso, kasama na ang pagbayad ay madali at simple lamang.',
    },
    {
      key: 'sqd4',
      english: 'I easily found information about my transaction from the office or its website.',
      tagalog:
        'Mabilis at madali akong nakahanap ng impormasyon tungkol sa aking transaksyon mula sa opisina o sa website nito.',
    },
    {
      key: 'sqd5',
      english: 'I paid a reasonable amount of fees for my transaction.',
      tagalog:
        'Nagbayad ako ng makatwirang halaga para sa aking transaksyon. (Kung ang sebisyo ay ibinigay ng libre, maglagay ng tsek sa hanay ng N/A.)',
    },
    {
      key: 'sqd6',
      english:
        'I feel the office was fair to everyone, or "walang palakasan", during my transaction.',
      tagalog:
        'Pakiramdam ko ay patas ang opisina sa lahat, o "walang palakasan", sa aking transaksyon.',
    },
    {
      key: 'sqd7',
      english:
        'I was treated courteously by the staff, and (if asked for help) the staff was helpful.',
      tagalog:
        'Magalang akong trinato ng mga tauhan, at (kung sakali ako ay humingi ng tulong) alam ko na sila ay handang tumulong sa akin.',
    },
    {
      key: 'sqd8',
      english:
        'I got what I needed from the government office, or (if denied) denial of request was sufficiently explained to me.',
      tagalog:
        'Nakuha ko ang kinakailangan ko mula sa tanggapan ng gobyerno, kung tinanggihan man, ito ay sapat na ipinaliwanag sa akin.',
    },
  ];

  readonly canAnswerCC2 = computed(() => {
    const cc1 = this.cc1Awareness();
    return cc1 === 1 || cc1 === 2 || cc1 === 3;
  });

  getSqdValue(key: string): number | undefined {
    const map: Record<string, () => number | undefined> = {
      sqd0: () => this.sqd0(),
      sqd1: () => this.sqd1(),
      sqd2: () => this.sqd2(),
      sqd3: () => this.sqd3(),
      sqd4: () => this.sqd4(),
      sqd5: () => this.sqd5(),
      sqd6: () => this.sqd6(),
      sqd7: () => this.sqd7(),
      sqd8: () => this.sqd8(),
    };
    const getter = map[key];
    return getter ? getter() : undefined;
  }

  setSqdValue(key: string, value: number | null): void {
    const map: Record<string, (v: number | undefined) => void> = {
      sqd0: (v) => this.sqd0.set(v),
      sqd1: (v) => this.sqd1.set(v),
      sqd2: (v) => this.sqd2.set(v),
      sqd3: (v) => this.sqd3.set(v),
      sqd4: (v) => this.sqd4.set(v),
      sqd5: (v) => this.sqd5.set(v),
      sqd6: (v) => this.sqd6.set(v),
      sqd7: (v) => this.sqd7.set(v),
      sqd8: (v) => this.sqd8.set(v),
    };
    const setter = map[key];
    if (setter) {
      setter(value ?? undefined);
    }
  }

  isPage1Valid(): boolean {
    return this.serviceTalisay() || this.serviceExternal();
  }

  isPage2Valid(): boolean {
    const sqdVals = [
      this.sqd0(),
      this.sqd1(),
      this.sqd2(),
      this.sqd3(),
      this.sqd4(),
      this.sqd5(),
      this.sqd6(),
      this.sqd7(),
      this.sqd8(),
    ];
    return sqdVals.some((v) => v !== undefined);
  }

  goToPage2(): void {
    if (!this.isPage1Valid()) {
      this.message.warning('Please select at least one service availed.');
      return;
    }
    this.showPage2.set(true);
  }

  submitSurvey(): void {
    if (!this.isPage2Valid()) {
      this.message.warning('Please answer at least one SQD question.');
      return;
    }

    const input: ClientSurveyInput = {
      clientType: this.clientType() || undefined,
      date: this.surveyDate() || undefined,
      sex: this.sex() || undefined,
      age: this.age() || undefined,
      regionOfResidence: this.regionOfResidence() || undefined,
      serviceTalisay: this.serviceTalisay(),
      serviceExternal: this.serviceExternal(),
      cc1Awareness: this.cc1Awareness() || undefined,
      cc2Visibility: this.cc2Visibility() || undefined,
      cc3Helpfulness: this.cc3Helpfulness() || undefined,
      sqd0: this.sqd0(),
      sqd1: this.sqd1(),
      sqd2: this.sqd2(),
      sqd3: this.sqd3(),
      sqd4: this.sqd4(),
      sqd5: this.sqd5(),
      sqd6: this.sqd6(),
      sqd7: this.sqd7(),
      sqd8: this.sqd8(),
      suggestions: this.suggestions() || undefined,
      emailAddress: this.emailAddress() || undefined,
    };

    this.submitted.emit(input);
  }
}

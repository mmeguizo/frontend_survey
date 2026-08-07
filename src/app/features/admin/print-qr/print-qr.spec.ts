import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { PrintQrComponent } from './print-qr.component';

describe('PrintQrComponent', () => {
  let component: PrintQrComponent;
  let fixture: ComponentFixture<PrintQrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrintQrComponent],
      providers: [provideRouter([])],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PrintQrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
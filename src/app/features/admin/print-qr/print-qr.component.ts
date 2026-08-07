import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import * as QRCode from 'qrcode';
import { AdminToolbarComponent } from '../admin-toolbar/admin-toolbar';

@Component({
  selector: 'app-print-qr',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, AdminToolbarComponent],
  templateUrl: './print-qr.component.html',
  styleUrls: ['./print-qr.component.scss'],
})
export class PrintQrComponent implements OnInit {
  surveyUrl = window.location.origin + '/survey?start=1';
  qrCodeDataUrl: string = '';

  ngOnInit(): void {
    this.generateQrCode();
  }

  generateQrCode(): void {
    QRCode.toDataURL(this.surveyUrl, { width: 300, margin: 2 })
      .then((url: string) => {
        this.qrCodeDataUrl = url;
      })
      .catch((err: unknown) => {
        console.error('Failed to generate QR code', err);
      });
  }

  print(): void {
    window.print();
  }

  copyUrl(): void {
    const url = this.surveyUrl;
    const fallbackCopy = () => {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        alert('URL copied to clipboard!');
      } catch {
        alert('Could not copy the URL. Copy it manually: ' + url);
      } finally {
        document.body.removeChild(textarea);
      }
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(
        () => alert('URL copied to clipboard!'),
        () => fallbackCopy(),
      );
    } else {
      fallbackCopy();
    }
  }
}

import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { BottomSheetConfig } from '../../../core/models/bottom-sheet.interface';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-bottom-sheet',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bottom-sheet-container">
      <h3 class="bottom-sheet-title">{{ config.title }}</h3>
      <div class="bottom-sheet-content">
        <div *ngFor="let field of config.fields" class="bottom-sheet-field">
          <p>
            <strong>{{ field.label }}:</strong> {{ getNestedValue(config.data, field.key) }}
          </p>
        </div>
      </div>
      <button mat-button class="close-button" (click)="closeSheet()">Cerrar</button>
    </div>
  `,
  styles:  [`
    .bottom-sheet-container {
      padding: 1.5rem;
      background-color: #ffffff;
      border-radius: 12px 12px 0 0;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
      max-width: 100%;
      margin: 0 auto;
    }

    .bottom-sheet-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #333333;
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .bottom-sheet-content {
      margin-bottom: 1.5rem;
    }

    .bottom-sheet-field {
      margin-bottom: 1rem;
      padding: 0.75rem;
      background-color: #f9f9f9;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .bottom-sheet-field p {
      margin: 0;
      font-size: 1rem;
      color: #555555;
    }

    .bottom-sheet-field strong {
      color: #333333;
      font-weight: 500;
    }

    .close-button {
      display: block;
      width: 100%;
      padding: 0.75rem;
      background-color: #3f51b5;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      text-align: center;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .close-button:hover {
      background-color: #303f9f;
    }
  `]
})
export class BottomSheetComponent {
  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public config: BottomSheetConfig<any>,
    private bottomSheetRef: MatBottomSheetRef<BottomSheetComponent>
  ) {}

  getNestedValue(object: any, key: string): any {
    return key.split('.').reduce((acc, part) => acc && acc[part], object);
  }

  closeSheet(): void {
    this.bottomSheetRef.dismiss();
  }
}

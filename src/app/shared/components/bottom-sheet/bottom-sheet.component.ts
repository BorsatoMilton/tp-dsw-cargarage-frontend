import { Component, Inject } from '@angular/core';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { BottomSheetConfig } from '../../../core/models/bottom-sheet.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bottom-sheet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bottom-sheet.component.html',
  styleUrl: './bottom-sheet.component.css',
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

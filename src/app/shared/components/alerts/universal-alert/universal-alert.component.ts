import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-universal-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './universal-alert.component.html',
  styleUrl: './universal-alert.component.css'
})
export class UniversalAlertComponent {

  @Input() message: string = '';
  @Input() type: 'success' | 'error' | 'info' = 'info';
  @Input() alertId: string = '';

  show: boolean = false;

  showAlert(message: string, type: 'success' | 'error' | 'info'): void {
    this.message = message;
    this.type = type;
    this.show = true;
    setTimeout(() => (this.show = false), 3000); 
  }

  closeAlert() {
    this.show = false;
  }

}

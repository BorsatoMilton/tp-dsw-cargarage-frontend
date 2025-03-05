import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { alertMethod } from '../../../shared/components/alerts/alert-function/alerts.functions';

@Component({
  selector: 'app-payment-status',
  standalone: true,
  imports: [],
  templateUrl: './payment-status.component.html',
  styleUrl: './payment-status.component.css',
})
export class PaymentStatusComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const status = params['payment_status'] || 'unknown';
      switch (status) {
        case 'approved':
          this.router.navigate(['/']);
          alertMethod(
            'Alquiler de vehiculo',
            '¡Pago realizado con éxito!',
            'success'
          );
          break;
        case 'failure':
          this.router.navigate(['/']);
          alertMethod(
            'Alquiler de vehiculo',
            'Hubo un problema con tu pago. Redirigiéndote...',
            'error'
          );
          break;
        case 'pending':
          this.router.navigate(['/']);
          alertMethod(
            'Alquiler de vehiculo',
            'Tu pago está pendiente. Espera confirmación.',
            'info'
          );
          break;
        default:
          this.router.navigate(['/']);
          alertMethod(
            'Alquiler de vehiculo',
            'Estado desconocido. Contacta con soporte.',
            'warning'
          );
      }
    });
  }
}

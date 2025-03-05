import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Vehicle } from '../../../core/models/vehicles.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { Rent } from '../../../core/models/rent.interface';
import { RentsService } from '../../../core/services/rents.service';
import { CommonModule } from '@angular/common';
import { VehiclesService } from '../../../core/services/vehicles.service';
import { alertMethod } from '../../../shared/components/alerts/alert-function/alerts.functions';
import { UniversalAlertComponent } from '../../../shared/components/alerts/universal-alert/universal-alert.component';
import { environment } from '../../../environments/environments';


declare const MercadoPago: any;

@Component({
  selector: 'app-confirm-rent',
  standalone: true,
  imports: [CommonModule, UniversalAlertComponent],
  templateUrl: './confirm-rent.component.html',
  styleUrl: './confirm-rent.component.css',
})
export class ConfirmRentComponent implements OnInit, OnDestroy {
  rent: Rent | null = null;
  vehiculo: Vehicle | null = null;
  private mercadoPago: any;
  totalAlquiler: number = 0;
  diasAlquiler: number = 0;

  @ViewChild(UniversalAlertComponent) alertComponent! : UniversalAlertComponent;

  constructor(
    private route: ActivatedRoute,
    private rentService: RentsService,
    private vehicleService: VehiclesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const idAlquiler = params['id'];
      if (idAlquiler !== null) {
        this.rentService.getOneRent(idAlquiler).subscribe({
          next: (data) => {
            if (!data) {
              alertMethod('Confirmar Alquiler','Oops! Algo salio mal!', 'error');
              this.router.navigate(['/']);
            } else {
              if (data.estadoAlquiler !== 'RESERVADO') {
                this.router.navigate(['/']);
                alertMethod(
                  'Confirmar Alquiler',
                  `Oops! Este alquiler se encuentra en estado ${data.estadoAlquiler}`,
                  'error'
                );
              }
              this.rent = data;
              if (this.rent) {
                this.vehicleService.getOneVehicle(this.rent.vehiculo.id).subscribe({
                  next: (data) => {
                    this.vehiculo = data;
                    if (this.vehiculo?.precioAlquilerDiario) {
                      this.calculateTotal()
                    }
                  },
                  error: (err) => {
                    if (err.status === 404) {
                      alertMethod('Confirmar Alquiler','Oops! Algo salio mal!', 'error');
                      this.router.navigate(['/']);
                    }
                  },
                });
              }
            }
          },
          error: (err) => {
            if (err.status === 404) {
              alertMethod('Confirmar Alquiler','Oops! Algo salio mal!', 'error');
              this.router.navigate(['/']);
            }
          },
        });
      }
    });
    this.loadMercadoPago();
  }

  ngOnDestroy(): void {
    this.cleanupMercadoPago();
  }

  private async loadMercadoPago(): Promise<void> {
    await this.loadScript('https://sdk.mercadopago.com/js/v2');
    this.mercadoPago = new MercadoPago(
      environment.mercadoPagoKey,
      {
        locale: 'es-AR',
      }
    );
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();

      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = (error) => reject(error);
      document.head.appendChild(script);
    });
  }

  private cleanupMercadoPago(): void {
    const container = document.querySelector('.mercadopago-button');
    if (container) container.innerHTML = '';
  }

  openModal(modalId: string): void {
    const modalDiv = document.getElementById(modalId);
    if (modalDiv != null) {
      modalDiv.style.display = 'block';
    }
  }

  closeModal(modalId: string) {
    const modalDiv = document.getElementById(modalId);
    if (modalDiv != null) {
      modalDiv.style.display = 'none';
    }
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop != null) {
      backdrop.parentNode?.removeChild(backdrop);
    }
  }

  private calculateTotal(): void {
    const inicio = this.rent?.fechaHoraInicioAlquiler
    const fin = this.rent?.fechaHoraDevolucion

    if (inicio && fin && this.vehiculo) {
      const diffTime = Math.abs(
        new Date(fin).getTime() - new Date(inicio).getTime()
      );
      this.diasAlquiler = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      this.diasAlquiler = this.diasAlquiler === 0 ? 1 : this.diasAlquiler;
      this.totalAlquiler = this.diasAlquiler * this.vehiculo.precioAlquilerDiario;
    }
  }


  async confirmRent(): Promise<void> {
    if (this.rent !== null) {
      const rentalData = {
        idAlquiler: this.rent.id!,
      };
      const paymentData = {
          items: [
              {
                  title: `Alquiler de ${this.vehiculo?.marca.nombreMarca} ${this.vehiculo?.modelo}`,
                  unit_price: this.vehiculo?.precioAlquilerDiario,
                  quantity: this.diasAlquiler,
                  currency_id: 'ARS',
              },
          ],
          external_reference: Date.now().toString(),
          rentalData,
      };
      this.rentService.createPaymentPreference(paymentData).subscribe({
          next: (preference) => {
              this.mercadoPago.checkout({
                  preference: { id: preference.id },
                  autoOpen: true, 
              });
          },
          error: (error: any) => {
              console.error('Error en la preferencia de pago:', error);
              alertMethod('Error en pago', 'No se pudo generar la preferencia de pago', 'error');
          }
      });
    }
  }

}
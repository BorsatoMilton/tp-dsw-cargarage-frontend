import { Component, OnInit, OnDestroy } from '@angular/core';
import { RentsService } from '../../../core/services/rents.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Vehicle } from '../../../core/models/vehicles.interface';
import { VehiclesService } from '../../../core/services/vehicles.service';
import { User } from '../../../core/models/user.interface';
import { AuthService } from '../../../core/services/auth.service';
import { FormGroup } from '@angular/forms';
import { Rent } from '../../../core/models/rent.interface';
import { CommonModule } from '@angular/common';
import { SimilarVehiclesCarouselComponent } from '../similar-vehicles-carousel/similar-vehicles-carousel.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { alertMethod } from '../../../shared/components/alerts/alert-function/alerts.functions';
import { QualificationCalculator } from '../../../shared/components/qualification-calculator/qualification-calculator';
import { environment } from '../../../environments/environments';

declare const MercadoPago: any;

@Component({
  selector: 'app-rent',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule,
    SimilarVehiclesCarouselComponent
  ],
  templateUrl: './rent.component.html',
  styleUrls: ['./rent.component.css'],
})
export class RentComponent implements OnInit, OnDestroy {
  total: number = 0;
  diasAlquiler: number = 0;
  private mercadoPago: any;
  rentForm: FormGroup;
  vehiculo: Vehicle | undefined;
  fechasReservadas: { fechaInicio: string; fechaFin: string }[] = [];
  idVehiculo: string | null = null;
  usuario: User | null = null;
  todayDate: Date = new Date(new Date().setDate(new Date().getDate() + 1));
  fechaInvalida: boolean = false;
  currentSlideIndex = 0;
  promedioCalificaciones: number = 0;
  cantidadCalificaciones: number = 0;
  lightboxActive: boolean = false;
  selectedImage: string = '';
  selectedImageIndex: number = 0;
  isRentButtonDisabled : boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private vehiculoService: VehiclesService,
    private qualificationCalculator: QualificationCalculator,
    private rentService: RentsService,
    private authService: AuthService,
    private router: Router
  ) {
    this.rentForm = this.fb.group(
      {
        fechaHoraInicioAlquiler: ['', Validators.required],
        fechaHoraDevolucion: ['', Validators.required],
      },
      { validators: this.dateRangeValidatorFactory() }
    );
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.idVehiculo = params.get('id');
      if (this.idVehiculo) {
        this.vehiculoService.getOneVehicle(this.idVehiculo).subscribe({
          next: (data: Vehicle) => {
            if(data.propietario.id === this.authService.getCurrentUser()?.id){
              this.router.navigate(['/']);
              alertMethod('Alquilar vehiculo', 'No puedes alquilar tu propio vehículo', 'error');
              return;
            }
            this.vehiculo = data;
            this.cargarCalificacionesPropietario();
          },
          error: (error) => {
            console.error('Error para obtener el vehiculo:', error);
          }
        });
  
        this.rentService.getRentsByVehicle(this.idVehiculo).subscribe((reservas) => {
          if (!reservas) return;
          this.fechasReservadas = reservas
            .filter(
              (reserva: any) =>
                reserva.estadoAlquiler !== 'CANCELADO' &&
                reserva.estadoAlquiler !== 'NO CONFIRMADO'
            )
            .map((reserva: any) => ({
              fechaInicio: reserva.fechaHoraInicioAlquiler,
              fechaFin: reserva.fechaHoraDevolucion,
            }));
        });
      }
    });
  
    this.usuario = this.authService.getCurrentUser();
    this.loadMercadoPago();
    this.setupDateListeners();
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

  private setupDateListeners(): void {
    this.rentForm.valueChanges.subscribe(() => {
      this.calculateTotal();
    });
  }

  private calculateTotal(): void {
    const inicio = this.rentForm.get('fechaHoraInicioAlquiler')?.value;
    const fin = this.rentForm.get('fechaHoraDevolucion')?.value;

    if (inicio && fin && this.vehiculo) {
      const diffTime = Math.abs(
        new Date(fin).getTime() - new Date(inicio).getTime()
      );
      this.diasAlquiler = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      this.diasAlquiler = this.diasAlquiler === 0 ? 1 : this.diasAlquiler;
      this.total = this.diasAlquiler * this.vehiculo.precioAlquilerDiario;
    }
  }

  dateFilter = (d: Date | null): boolean => {
    if (!d) return false;

    const dayString = this.formatDate(d);

    const today = new Date();
    const todayString = this.formatDate(today);
    if (dayString < todayString) return false;

    for (const reserva of this.fechasReservadas) {
      const reservaInicio = new Date(reserva.fechaInicio);
      const reservaFin = new Date(reserva.fechaFin);
      if (d >= reservaInicio && d <= reservaFin) {
        return false;
      }
    }

    return true;
  };


  dateRangeValidatorFactory() {
    return (group: AbstractControl): ValidationErrors | null => {
      const startValue = group.get('fechaHoraInicioAlquiler')?.value;
      const endValue = group.get('fechaHoraDevolucion')?.value;
      if (!startValue || !endValue) {
        return null;
      }
      const startDate = new Date(startValue);
      const endDate = new Date(endValue);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (startDate < today) {
        return { startDateInPast: true };
      }
      if (startDate > endDate) {
        return { dateRangeInvalid: true };
      }
      const isOverlapping = this.fechasReservadas.some((reserva) => {
        const reservaInicio = new Date(reserva.fechaInicio);
        const reservaFin = new Date(reserva.fechaFin);
        return (
          (startDate >= reservaInicio && startDate <= reservaFin) ||
          (endDate >= reservaInicio && endDate <= reservaFin) ||
          (startDate <= reservaInicio && endDate >= reservaFin)
        );
      });
      if (isOverlapping) {
        return { dateRangeOverlapping: true };
      }
      return null;
    };
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  isDateDisabled(date: string): boolean {
    return this.fechasReservadas.some((reserva) => {
      const inicio = this.formatDate(new Date(reserva.fechaInicio));
      const fin = this.formatDate(new Date(reserva.fechaFin));
      return date >= inicio && date <= fin;
    });
  }

  getDisabledDates(): { year: number; month: number; day: number }[] {
    return this.fechasReservadas
      .map((reserva) => {
        const inicio = new Date(reserva.fechaInicio);
        const fin = new Date(reserva.fechaFin);
        const fechasBloqueadas = [];

        for (let d = inicio; d <= fin; d.setDate(d.getDate() + 1)) {
          fechasBloqueadas.push({
            year: d.getFullYear(),
            month: d.getMonth() + 1,
            day: d.getDate(),
          });
        }

        return fechasBloqueadas;
      })
      .flat();
  }

  validarFecha(): void {
    const fechaSeleccionada = this.rentForm.get(
      'fechaHoraInicioAlquiler'
    )?.value;
    this.fechaInvalida = this.isDateDisabled(fechaSeleccionada);
  }

  async confirmarPago(): Promise<void> {
    if (!this.vehiculo || !this.diasAlquiler) return;

    if (this.authService.isAuthenticated()) {

        const rentalData = {
          fechaHoraInicioAlquiler: this.rentForm.get('fechaHoraInicioAlquiler')?.value,
          fechaHoraDevolucion: this.rentForm.get('fechaHoraDevolucion')?.value,
          locatario: this.usuario?.id,
          vehiculo: this.idVehiculo,
          fechaPago: new Date().toISOString(),
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

  private cargarCalificacionesPropietario(): void {
    if (!this.vehiculo?.propietario?.id) return;

    this.qualificationCalculator
      .getPromedio(this.vehiculo.propietario.id)
      .subscribe({
        next: (promedio) => {
          this.promedioCalificaciones = promedio;
          this.obtenerCantidadCalificaciones(this.vehiculo!.propietario!.id);
        },
        error: (err) => {
          console.error('Error obteniendo calificaciones:', err);
          this.promedioCalificaciones = 0;
        },
      });
  }

  private obtenerCantidadCalificaciones(idPropietario: string) {
    this.qualificationCalculator
      .getCalificacionesTotal(idPropietario)
      .subscribe({
        next: (cantidad) => {
          this.cantidadCalificaciones = cantidad;
        },
        error: (err) => {
          console.error('Error obteniendo cantidad de calificaciones:', err);
          this.cantidadCalificaciones = 0;
        },
      });
  }


  rent(): void {
    this.isRentButtonDisabled = true;
    if (this.authService.isAuthenticated()) {
      const rentData: Rent = {
        ...this.rentForm.value,
        estadoAlquiler: 'RESERVADO',
        locatario: this.usuario!.id,
        vehiculo: this.idVehiculo!,
      };
      this.rentService.addRent(rentData).subscribe({
        next: (response) => {
          if (this.usuario && this.idVehiculo) {
            const idAlquiler = response.id;
            this.rentService
              .confirmRentMail(this.usuario, idAlquiler)
              .subscribe({
                next: () => {
                  this.router.navigate(['/']);
                  alertMethod(
                    'Alquilar vehiculo',
                    'Se ha enviado un mail a su casilla de correo para confirmar el alquiler',
                    'success'
                  );
                },
                error: (error) => {
                  console.error(error);
                  alertMethod(
                    'Alquilar vehiculo',
                    'Oops! Algo salió mal al confirmar el alquiler',
                    'error'
                  );
                },
              });
          }
        },
        error: (error) => {
          console.error(error);
          alertMethod(
            'Alquilar vehiculo',
            'Oops! Algo salió mal al crear el alquiler',
            'error'
          );
        },
      });
    }
  }



  nextSlide(): void {
    if (this.vehiculo && this.vehiculo.imagenes) {
      this.currentSlideIndex =
        (this.currentSlideIndex + 1) % this.vehiculo.imagenes.length;
    }
  }

  previousSlide(): void {
    if (this.vehiculo && this.vehiculo.imagenes) {
      this.currentSlideIndex =
        (this.currentSlideIndex - 1 + this.vehiculo.imagenes.length) %
        this.vehiculo.imagenes.length;
    }
  }

  goToSlide(index: number): void {
    this.currentSlideIndex = index;
  }

  openLightbox(index: number): void {
    this.selectedImageIndex = index;
    this.selectedImage = this.vehiculo?.imagenes[index] || '';
    this.lightboxActive = true;
  }
  
  closeLightbox(): void {
    this.lightboxActive = false;
  }
  
  changeLightboxImage(direction: number): void {
    if (!this.vehiculo?.imagenes) return;
    
    const length = this.vehiculo.imagenes.length;
    this.selectedImageIndex = (this.selectedImageIndex + direction + length) % length;
    this.selectedImage = this.vehiculo.imagenes[this.selectedImageIndex];
  }
  
  closeLightboxOnBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeLightbox();
    }
  }
}

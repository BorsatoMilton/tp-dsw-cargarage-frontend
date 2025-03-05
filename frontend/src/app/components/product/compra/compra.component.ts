import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { VehiclesService } from '../../../core/services/vehicles.service';
import { Vehicle } from '../../../core/models/vehicles.interface';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.interface';
import { Compra } from '../../../core/models/compra.interfaces';
import { CompraService } from '../../../core/services/compra.service';
import { SimilarVehiclesCarouselComponent } from '../similar-vehicles-carousel/similar-vehicles-carousel.component';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from '../../../core/models/categories.interface';
import { alertMethod } from '../../../shared/components/alerts/alert-function/alerts.functions';
import { UniversalAlertComponent } from '../../../shared/components/alerts/universal-alert/universal-alert.component';
import { QualificationCalculator } from '../../../shared/components/qualification-calculator/qualification-calculator';

@Component({
  selector: 'app-compra',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, UniversalAlertComponent, SimilarVehiclesCarouselComponent],
  templateUrl: 'compra.component.html',
  styleUrl: './compra.component.css',
})
export class CompraComponent implements OnInit {
  compraForm: FormGroup = new FormGroup({});
  compras: Compra[] = [];
  selectedCompra: Compra | null = null;
  vehiculo: Vehicle | null = null;
  selectedFiles: File[] = [];
  usuario: User | null = null;
  promedioCalificaciones: number = 0;
  cantidadCalificaciones: number = 0;
  idVehiculo: string | null = null;
  categoria: Category | null = null;
  compra: Compra | null = null;
  currentSlideIndex = 0;
  lightboxActive: boolean = false;
  selectedImage: string = '';
  selectedImageIndex: number = 0;

@ViewChild(UniversalAlertComponent) alertComponent!: UniversalAlertComponent;

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehiclesService,
    private authService: AuthService,
    private compraService: CompraService,
    private qualificationCalculator: QualificationCalculator,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.compraForm = this.fb.group({
      fecha_compra: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.idVehiculo = params.get('id');
      if (this.idVehiculo === null) {
        alertMethod('Realizar Compra', 'Oops, algo fue mal!', 'error');
        this.router.navigate(['/']);
      } else {
        this.vehicleService.getOneVehicle(this.idVehiculo).subscribe((data) => {
          if (data === null) {
            alertMethod('Realizar Compra', 'Oops, algo fue mal!', 'error');
            this.router.navigate(['/']);
          
          } else if(data.propietario.id === this.authService.getCurrentUser()?.id){
            this.router.navigate(['/']);
            alertMethod('Comprar vehiculo', 'No puedes comprar tu propio vehículo', 'error');
            return;
          } else {
            this.vehiculo = data;
            this.obtenerCompra(this.vehiculo.id);
            this.cargarCalificacionesPropietario();
          }
        });
      }
    });
    this.usuario = this.authService.getCurrentUser();

  }


  private cargarCalificacionesPropietario(): void {
    if (!this.vehiculo?.propietario?.id) return;
  
    this.qualificationCalculator.getPromedio(this.vehiculo.propietario.id).subscribe({
      next: (promedio) => {
        this.promedioCalificaciones = promedio;
        this.obtenerCantidadCalificaciones(this.vehiculo!.propietario!.id)
      },
      error: (err) => {
        console.error('Error obteniendo calificaciones:', err);
        this.promedioCalificaciones = 0;
      }
    });
  }
  
  private obtenerCantidadCalificaciones(idPropietario:string){
    this.qualificationCalculator.getCalificacionesTotal(idPropietario).subscribe({
      next: (cantidad) => {
        this.cantidadCalificaciones = cantidad;
      },
      error: (err) => {
        console.error('Error obteniendo cantidad de calificaciones:', err);
        this.cantidadCalificaciones = 0;
      }
    });

  }

  obtenerCompra(idVehiculo: string): void {
    this.compraService.getOneCompraByVehiculo(idVehiculo).subscribe((data) => {
      if (data === null) {
        this.compra = null
        if (this.vehiculo) {
          this.vehiculo.compra = {} as Compra;
          return;
        }
      }
      if(this.vehiculo) this.vehiculo.compra = data
    })
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
    this.selectedCompra = null;
    this.compraForm.reset();
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
  

  comprar(): void {
    this.closeModal('comprar');
    if (this.vehiculo !== null && this.usuario !== null) {
      this.compraService
        .addCompra(this.usuario.id, this.vehiculo.id)
        .subscribe((dataCompra) => {
          if (dataCompra === null) {
            this.alertComponent.showAlert(
              'No se ha podido realizar la compra',
              'error'
            );
          } else {
            alertMethod(
              'Compra Exitosa',
              'Se ha enviado un mail a su casilla de correo para confirmar la compra',
              'success'
            );
            this.router.navigate(['/']);
            this.compraService.confirmarCompraAviso(dataCompra.id).subscribe((data) => {
              if (data === null) {
                alertMethod(
                  'Confirmar Compra',
                  'Oops! El servidor no reconoce su usuario.',
                  'error'
                );
              }
            });
          }
        });
      }
  }

}


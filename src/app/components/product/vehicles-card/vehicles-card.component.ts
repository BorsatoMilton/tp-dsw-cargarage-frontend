import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Vehicle } from '../../../core/models/vehicles.interface';
import { VehiclesService } from '../../../core/services/vehicles.service';
import { RouterLink } from '@angular/router';
import { User } from '../../../core/models/user.interface';
import { AuthService } from '../../../core/services/auth.service';
import { FilterComponent } from '../../../shared/components/filter/filter.component';
import { HostListener } from '@angular/core';
import { MatBottomSheet} from '@angular/material/bottom-sheet'; 
import { BottomSheetComponent } from '../../../shared/components/bottom-sheet/bottom-sheet.component'; 
import { BottomSheetConfig } from '../../../core/models/bottom-sheet.interface';
import { environment } from '../../../../environments/environment.js';


@Component({
  selector: 'app-vehicles-card',
  standalone: true,
  imports: [CommonModule, RouterLink, FilterComponent],
  templateUrl: './vehicles-card.component.html',
  styleUrl: './vehicles-card.component.css',
})
export class VehiclesCardComponent {
  public environment = environment;
  vehicles: Vehicle[] = [];
  filteredVehicles: Vehicle[] = [];
  usuarioActual: User | null = null;
  showFilter = false;
  isMobile = false;
  vehiculoSeleccionado: string | null = null;
  currentSlideIndex = 0;
  lightboxActive: boolean = false;
  selectedImage: string = '';
  selectedImageIndex: number = 0;
  selectedVehicle: Vehicle | null = null

  constructor(
    private vehicleService: VehiclesService,
    private authService: AuthService,
    private bottomSheet: MatBottomSheet
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.authService.getCurrentUser();
    this.loadVehicles();
    this.checkScreenSize();
  }

  loadVehicles() {
    this.vehicleService.getAllVehicle().subscribe({
      next: (data: Vehicle[]) => {
        this.vehicles = data.filter((vehicle) => vehicle?.compra?.estadoCompra !== 'CONFIRMADA' && vehicle?.compra?.estadoCompra !== 'FINALIZADA'); 
        this.filteredVehicles = this.vehicles.sort((a, b) => new Date(b.fechaAlta).getTime() - new Date(a.fechaAlta).getTime());
      },
      error: (err) => {
        console.error('Error al obtener vehiculos:', err);
      },
    });
  }

  toggleFilter() {
    this.showFilter = !this.showFilter;
  }

  onFilterChanged(filters: any): void {
    this.filteredVehicles = this.vehicles.filter((vehicle) => {
      if (
        filters.category &&
        vehicle.categoria.nombreCategoria !== filters.category
      ) {
        return false;
      }

      if (filters.brand && vehicle.marca.nombreMarca !== filters.brand) {
        return false;
      }

      if (filters.priceDesde && vehicle.precioVenta < filters.priceDesde) {
        return false;
      }

      if (filters.priceHasta && vehicle.precioVenta > filters.priceHasta) {
        return false;
      }

      if (
        filters.kilometersDesde &&
        vehicle.kilometros < filters.kilometersDesde
      ) {
        return false;
      }

      if (
        filters.kilometersHasta &&
        vehicle.kilometros > filters.kilometersHasta
      ) {
        return false;
      }

      if (filters.isRentable && vehicle.precioAlquilerDiario <= 0) {
        return false;
      }

      if (filters.isBuyable && vehicle.precioVenta <= 0) {
        return false;
      }
      return true;
    });
  }

  private checkScreenSize(): void {
    this.isMobile = window.innerWidth < 992;
    this.showFilter = !this.isMobile;
  }

  openVehicleDetails(vehicle: Vehicle): void {
    const config: BottomSheetConfig<Vehicle> = {
      title: 'Detalles del Vehículo',
      fields: [
        { key: 'modelo', label: 'Modelo' },
        { key: 'anio', label: 'Año' },
        { key: 'marca.nombreMarca', label: 'Marca' },
        { key: 'kilometros', label: 'Kilómetros' },
        { key: 'propietario.telefono', label: 'Contacto' },
      ],
      data: vehicle,
    };
  
    this.bottomSheet.open(BottomSheetComponent, { data: config });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkScreenSize();
  }

  openLightbox(vehiculo: Vehicle): void {
    this.selectedImage = vehiculo.imagenes[0] || '';
    this.lightboxActive = true;
    this.selectedVehicle = vehiculo
    console.log('Lightbox abierto', vehiculo);
  }
  
  closeLightbox(): void {
    this.lightboxActive = false;
    this.selectedVehicle = null
  }
  
  changeLightboxImage(direction: number): void {
    if (!this.selectedVehicle?.imagenes) return;
    
    const length = this.selectedVehicle?.imagenes.length;
    this.selectedImageIndex = (this.selectedImageIndex + direction + length) % length;
    this.selectedImage = this.selectedVehicle?.imagenes[this.selectedImageIndex];
  }
  
  closeLightboxOnBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeLightbox();
    }
  }
    
  
}

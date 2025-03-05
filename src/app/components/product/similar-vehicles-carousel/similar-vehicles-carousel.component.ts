import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Vehicle } from '../../../core/models/vehicles.interface';
import { VehiclesService } from '../../../core/services/vehicles.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-similar-vehicles-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './similar-vehicles-carousel.component.html',
  styleUrl: './similar-vehicles-carousel.component.css'
})
export class SimilarVehiclesCarouselComponent implements OnChanges {
  @Input() categoryId: string | null = null;
  @Input() excludeVehicleId: string | null = null;
  @Input() isRent: boolean = false;

  similarVehicles: Vehicle[] = [];

  constructor(
    private vehicleService: VehiclesService,
    private router: Router
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoryId'] || changes['excludeVehicleId']) {
      this.cargarVehiculos();
    }
  }

  private cargarVehiculos(): void {
    if (!this.categoryId) {
      this.similarVehicles = [];
      return;
    }
    this.vehicleService.getVehiclesByCategory(this.categoryId).subscribe({
      next: (vehicles) => {
        if (this.isRent) {
          this.similarVehicles = vehicles.filter(
            (v) => v.id !== this.excludeVehicleId && v.precioAlquilerDiario !== null
          );
        } else {
          this.similarVehicles = vehicles.filter(
            (v) => v.id !== this.excludeVehicleId && v.precioVenta !== null
          );
        }
      },
      error: (err: any) => {
        console.error('Error al cargar vehículos similares:', err);
        this.similarVehicles = [];
      }
    });
  }

  verVehiculo(id: string): void {
    if (this.isRent) {
      this.router.navigate(['/rent', id]);
    } else {
      this.router.navigate(['/compra', id]);
    }
  }
}

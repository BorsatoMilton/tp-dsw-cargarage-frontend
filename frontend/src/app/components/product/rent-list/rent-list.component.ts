import { Component } from '@angular/core';
import { Rent } from '../../../core/models/rent.interface';
import { RentsService } from '../../../core/services/rents.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { alertMethod } from '../../../shared/components/alerts/alert-function/alerts.functions';
import { MatIconModule } from '@angular/material/icon';
import { BottomSheetConfig } from '../../../core/models/bottom-sheet.interface';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { BottomSheetComponent } from '../../../shared/components/bottom-sheet/bottom-sheet.component';

@Component({
  selector: 'app-rent-list',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './rent-list.component.html',
  styleUrl: './rent-list.component.css'
})
export class RentListComponent {
    alquileres: Rent[] = [];
    selectedRent: Rent | null = null;
  
    constructor(private rentService: RentsService,
      private authService: AuthService,
      private bottomSheet: MatBottomSheet
    ) { }
  
    ngOnInit(): void {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser !== null) {
        this.loadRents(currentUser.id);
    
        setInterval(() => {
          this.loadRents(currentUser.id);
        }, 120000);
      }
    }
    
    loadRents(userId: string): void {
      this.rentService.getRentsByUser(userId).subscribe((data) => {
        this.alquileres = data;
      });
    }

     openRentDetails(rent: Rent): void {
       const config: BottomSheetConfig<Rent> = {
         title: 'Detalles del Alquiler',
         fields: [
           { key: 'vehiculo.modelo', label: 'Auto' },
           { key: 'vehiculo.anio', label: 'Año' },
           { key: 'fechaAlquiler', label: 'Fecha Alquiler' },
           { key: 'precioAlquilerDiario', label: 'Precio Diario' },
           { key: 'fechaHoraInicioAlquiler', label: 'Fecha Inicio Alquiler' },
           { key: 'fechaHoraDevolucion', label: 'Fecha Devolucion' },
           { key: 'vehiculo.propietario.nombre', label: 'Nombre Propietario' },
           { key: 'vehiculo.propietario.apellido', label: 'Apellido Propietario' },
           { key: 'vehiculo.propietario.telefono', label: 'Contacto' },
           { key: 'estadoAlquiler', label: 'Estado' },
         ],
         data: rent,
       };
       this.bottomSheet.open(BottomSheetComponent, { data: config });
     }
    
    openModal(modalId: string, rent: Rent): void{
      this.selectedRent = rent;
      const modalDiv = document.getElementById(modalId);
      if(modalDiv != null){
        modalDiv.style.display='block';
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
      this.selectedRent = null;
    }

    diasRestantes(alquiler: Rent): number {
      const fechaBaja = new Date(alquiler.vehiculo.fechaBaja);
      const treintaDiasEnMs = 30 * 24 * 60 * 60 * 1000;
      const tiempoFinal = fechaBaja.getTime() + treintaDiasEnMs;
      const tiempoRestante = tiempoFinal - Date.now();
      
      const dias = Math.ceil(tiempoRestante / (1000 * 60 * 60 * 24));
      return Math.max(dias, 0); 
  }
    
    cancelRent(rent: Rent | null, modalId: string): void {
      if(rent){
        this.rentService.cancelRent(rent).subscribe(() => {
          alertMethod('Cancelar Alquiler', 'Alquiler cancelado exitosamente!', 'success');
          this.ngOnInit();
          this.closeModal(modalId);
        });
      }
    }

    removeRent(rent: Rent | null, modalId: string): void {
      if(rent){
        this.rentService.deleteRent(rent).subscribe(() => {
          alertMethod('Borrar Alquiler', 'Alquiler borrado exitosamente!', 'success');
          this.ngOnInit();
          this.closeModal(modalId);
        });
      }
    }

}

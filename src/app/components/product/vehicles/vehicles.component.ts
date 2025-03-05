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
import { BrandsService } from '../../../core/services/brands.service';
import { Brand } from '../../../core/models/brands.interfaces';
import { CategoriesService } from '../../../core/services/categories.service';
import { Category } from '../../../core/models/categories.interface';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.interface';
import { UniversalAlertComponent } from '../../../shared/components/alerts/universal-alert/universal-alert.component';
import { alertMethod } from '../../../shared/components/alerts/alert-function/alerts.functions';
import {MatIconModule} from '@angular/material/icon';
import { BottomSheetConfig } from '../../../core/models/bottom-sheet.interface';
import { BottomSheetComponent } from '../../../shared/components/bottom-sheet/bottom-sheet.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-vehicle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, UniversalAlertComponent, MatIconModule],
  templateUrl: 'vehicles.component.html',
  styleUrl: './vehicles.component.css',
})
export class VehicleComponent implements OnInit {
  vehicleForm: FormGroup = new FormGroup({});
  vehicles: Vehicle[] = [];
  selectedVehicle: Vehicle | null = null;
  brands: Brand[] = [];
  categories: Category[] = [];
  selectedFiles: File[] = [];
  usuario: User | null = null;

  @ViewChild(UniversalAlertComponent) alertComponent! : UniversalAlertComponent;

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehiclesService,
    private brandService: BrandsService,
    private categoriesService: CategoriesService,
    private authService: AuthService,
    private bottomSheet: MatBottomSheet
  ) {
    this.vehicleForm = this.fb.group({
      modelo: ['', Validators.required],
      descripcion: ['', Validators.required],
      precioVenta: [null],
      precioAlquilerDiario: [null],
      anio: ['', Validators.required],
      marca: [null, Validators.required],
      categoria: [null, Validators.required],
      transmision: ['', Validators.required],
      kilometros: [0, Validators.required],
    });
  }

  ngOnInit(): void {
    this.brandService.getAllBrand().subscribe((data) => {
      this.brands = data;
    });
    this.categoriesService.getAllCategories().subscribe((data) => {
      this.categories = data;
    });
    this.usuario = this.authService.getCurrentUser();
  
    if (this.usuario !== null) {
      this.loadVehicle();
    }   

  }

  openVehicleDetails(vehicle: Vehicle): void {
       const config: BottomSheetConfig<Vehicle> = {
          title: 'Detalles del Vehículo',
          fields: [
            { key: 'modelo', label: 'Modelo' },
            { key: 'anio', label: 'Año' },
            { key: 'descripcion', label: 'Descripción' },
            { key: 'kilometros', label: 'Kilometros' },
            { key: 'transmision', label: 'Transmisión' },
            { key: 'precioAlquilerDiario', label: 'Precio Alquiler Diario' },
            { key: 'precioVenta', label: 'Precio Venta' },
          ],
          data: vehicle,
        };
        this.bottomSheet.open(BottomSheetComponent, { data: config });
  }

  openModal(modalId: string, vehicle: Vehicle): void {
    this.selectedVehicle = vehicle;

    if (vehicle) {
      this.vehicleForm.patchValue({
        modelo: vehicle.modelo,
        descripcion: vehicle.descripcion,
        fechaAlta: vehicle.fechaAlta,
        fechaBaja: vehicle.fechaBaja,
        precioVenta: vehicle.precioVenta,
        precioAlquilerDiario: vehicle.precioAlquilerDiario,
        kilometros: vehicle.kilometros,
        anio: vehicle.anio,
        marca: vehicle.marca?.id,
        categoria: vehicle.categoria?.id,
        transmision: vehicle.transmision,
      });
    }
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
    this.selectedVehicle = null;
    this.vehicleForm.reset();
  }

  addVehicle(): void {
    if (this.vehicleForm.valid) {
      const formValue = this.vehicleForm.value;
  
      const vehicleData = {
        ...formValue,
        precioVenta: formValue.precioVenta ? Number(formValue.precioVenta) : null,
        precioAlquilerDiario: formValue.precioAlquilerDiario ? Number(formValue.precioAlquilerDiario) : null,
        kilometros: Number(formValue.kilometros),
        anio: Number(formValue.anio),
        marca: formValue.marca,
        categoria: formValue.categoria,
        propietario: this.usuario?.id
      };

      const formData = new FormData();
      Object.entries(vehicleData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        } else {
          formData.append(key, ''); 
        }
      });
  
      this.selectedFiles.forEach(file => {
        formData.append('imagenes', file, file.name);
      });
  
      this.vehicleService.addVehicle(formData).subscribe({
        next: () => {
          alertMethod('Alta de vehiculos','Vehículo agregado exitosamente', 'success');
          this.loadVehicle();
          this.closeModal('addVehicle');
        },
        error: (err) => {
          this.handleVehicleError(err);
        }
      });
    } else {
      this.alertComponent.showAlert('Complete todos los campos', 'error');
    }
  }
  
  private handleVehicleError(err: any): void {
    let errorMessage = 'Error al guardar el vehículo';
    
    if (err.error?.message?.includes('invalid input syntax')) {
      errorMessage = 'Error en los datos numéricos (ej: precio, año)';
    } else if (err.status === 400) {
      errorMessage = 'Datos del vehículo inválidos';
    }
    
    this.alertComponent.showAlert(errorMessage, 'error');
  }

  loadVehicle(): void {
    if (this.usuario !== null) {
      this.vehicleService.getAllVehicleByUser(this.usuario.id).subscribe((vehicles: Vehicle[]) => {
        this.vehicles = vehicles;
      });
    }
  }

  editVehicle(): void {

    if (!this.selectedVehicle) {
      alertMethod('Edición de vehículo', 'No se ha seleccionado ningún vehículo para editar', 'error');
      return;
    }

    const precioVenta = this.vehicleForm.get('precioVenta')?.value;
    const precioAlquilerDiario = this.vehicleForm.get('precioAlquilerDiario')?.value;
  
    if (precioVenta === null && precioAlquilerDiario === null) {
      alertMethod('Edición de vehículo', 'Por favor, ingrese un precio de venta o alquiler', 'error');
      return;
    }

    const formValue = this.vehicleForm.value;
    const updatedVehicle: Vehicle = {
      ...this.selectedVehicle, 
      ...formValue, 
      propietario: this.selectedVehicle.propietario, 
    };
  
    this.vehicleService.editVehicle(updatedVehicle).subscribe({
      next: () => {
        alertMethod('Edición de vehículo', 'Vehículo editado exitosamente', 'success');
        this.closeModal('editVehicle'); 
        this.loadVehicle(); 
      },
      error: (err) => {
        console.error('Error al editar el vehículo:', err);
        alertMethod('Edición de vehículo', 'Hubo un error al editar el vehículo', 'error');
      },
    });
  }
  
  removeVehicle(vehicle: Vehicle | null, modalId: string) {
    if (vehicle) {
      this.vehicleService.deleteVehicle(vehicle).subscribe(() => {
        alertMethod('Eliminación de vehiculo','Vehículo eliminado exitosamente', 'success');
        this.ngOnInit();
        this.closeModal(modalId);
        this.vehicleForm.reset();
      });
    }
  }

  onFilesSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files) {
      this.selectedFiles = Array.from(fileInput.files);
    }
  }
}
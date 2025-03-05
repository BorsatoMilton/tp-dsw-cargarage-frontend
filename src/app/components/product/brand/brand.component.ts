import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrandsService } from '../../../core/services/brands.service';
import { Brand } from '../../../core/models/brands.interfaces';
import { Observable, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { SearcherComponent } from '../../../shared/components/searcher/searcher.component';
import { UniversalAlertComponent } from '../../../shared/components/alerts/universal-alert/universal-alert.component';
import { alertMethod } from '../../../shared/components/alerts/alert-function/alerts.functions';
@Component({
  selector: 'app-brand',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SearcherComponent, UniversalAlertComponent],
  templateUrl: './brand.component.html',
  styleUrl: './brand.component.css'
})

export class BrandComponent implements OnInit {
brandForm: FormGroup=new FormGroup({}); 
brands: Brand[] = [];
selectedBrand: Brand | null = null;
filteredBrands: Brand[] = [];

@ViewChild(UniversalAlertComponent) alertComponent!: UniversalAlertComponent

constructor(
private fb: FormBuilder, 
private brandService: BrandsService
)
 {this.brandForm = this.fb.group({
  nombreMarca: ['', Validators.required]
  });}

ngOnInit(): void {
    this.loadBrand()
}

openModal(modalId: string, brand: Brand): void{
  this.selectedBrand = brand;
  if (brand) {
    this.brandForm.patchValue({
      nombreMarca: brand.nombreMarca,
    });
  }
  const modalDiv = document.getElementById(modalId);
  if(modalDiv != null){
    modalDiv.style.display='block';
  }
}

closeModal(modalId: string){
  const modalDiv = document.getElementById(modalId);
  if(modalDiv != null){
    modalDiv.style.display='none';
  }
  const backdrop = document.querySelector('.modal-backdrop');
  if (backdrop != null) {
    backdrop.parentNode?.removeChild(backdrop);
  }
  this.selectedBrand= null;
  this.brandForm.reset();
}

loadBrand(): void {
  this.brandService.getAllBrand().subscribe((brands : Brand[]) => {
    this.brands = brands;
    this.filteredBrands = brands;
  });
}

onSearch(filteredBrands: Brand[]): void {
  this.filteredBrands = filteredBrands.length > 0 ? filteredBrands : [];
}

checkBrandExists(nombreMarca: string, excludeBrandId?: string): Observable<boolean> {
  return this.brandService.getOneBrandByName(nombreMarca, excludeBrandId).pipe(
    map((marca: Brand) => !!marca),
  );
}

addBrand() {
  if (this.brandForm.valid) {
    const brandData = this.brandForm.value;    
    this.checkBrandExists(brandData.nombreMarca).pipe(switchMap((exists: boolean) => {
      if (!exists) {
        return this.brandService.addBrand(brandData);
      }
      return throwError(() => new Error('La marca ya existe'));
    })).subscribe({
      next: () => {
      alertMethod('Alta de marcas', 'Marca creada exitosamente', 'success');
      this.loadBrand();
      this.closeModal('addBrand');
      this.brandForm.reset();
    },
    error: (err: any) => {
      if (err.message === 'La marca ya existe') {
        this.closeModal('addBrand');
        this.alertComponent.showAlert(err.message, 'error');
      } else if (err.status === 500) {
         this.alertComponent.showAlert('Error interno del servidor', 'error');
      } else {
         this.closeModal('addBrand');
         this.alertComponent.showAlert('Ocurrió un error al agregar la marca', 'error');
      }
      this.brandForm.reset();
    } 
  });
  }else{
    this.alertComponent.showAlert('Por favor, complete todos los campos requeridos.', 'error');
    return
  }
}

editBrand(): void {
  if (this.selectedBrand) {
    const updatedBrand: Brand = {
      ...this.selectedBrand,
      ...this.brandForm.value
    };
    this.checkBrandExists(updatedBrand.nombreMarca, this.selectedBrand.id).pipe(
      switchMap((exists: boolean) => {
        if (exists) {
          return throwError(() => new Error('La marca ya existe'));
        }
        return this.brandService.editBrand(updatedBrand);
      })
    ).subscribe({
      next: () => {
        alertMethod('Actualización de marcas', 'Marca actualizada exitosamente', 'success');
        this.loadBrand();
        this.closeModal('editBrand');
        this.brandForm.reset();
      },
      error: (err: any) => {
        this.closeModal('editBrand');
        if (err.message === 'La marca ya existe') {
          this.alertComponent.showAlert(err.message, 'error');
        } else if (err.status === 500) {
          this.alertComponent.showAlert('Error interno del servidor', 'error');
        } else {
          this.alertComponent.showAlert('Ocurrió un error al actualizar la marca', 'error');
        }
      }
    })
  }
}

deleteBrand(brand: Brand | null, modalId: string) {
  if(brand){
      this.brandService.deleteBrand(brand).subscribe(() => {
        alertMethod('Baja de marcas', 'Marca eliminada exitosamente', 'success');
        this.loadBrand();
        this.closeModal(modalId);
        this.brandForm.reset();
      });
  }
}
}


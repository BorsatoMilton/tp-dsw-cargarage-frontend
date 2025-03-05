import { CommonModule } from '@angular/common';
import { Component,  OnInit, ViewChild} from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoriesService } from '../../../core/services/categories.service';
import { Category } from '../../../core/models/categories.interface';
import { SearcherComponent } from '../../../shared/components/searcher/searcher.component';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { alertMethod } from '../../../shared/components/alerts/alert-function/alerts.functions';
import { UniversalAlertComponent } from '../../../shared/components/alerts/universal-alert/universal-alert.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SearcherComponent, UniversalAlertComponent],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent implements OnInit {
categoryForm: FormGroup=new FormGroup({});
categories: Category[] = [];
filteredCategories: Category[] = [];
selectedCategory: Category | null = null;

@ViewChild(UniversalAlertComponent) alertComponent!: UniversalAlertComponent;

constructor(
  private fb: FormBuilder, 
  private categoriesService: CategoriesService,

  ) {
    this.categoryForm = this.fb.group({
      nombreCategoria: [''],
      descripcionCategoria: ['']
    });
   }


ngOnInit(): void {
  this.loadCategories();
}

openModal(modalId: string, category: Category): void{
  this.selectedCategory = category;
  if (category) {
    this.categoryForm.patchValue({
      nombreCategoria: category.nombreCategoria,
      descripcionCategoria: category.descripcionCategoria
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
  this.selectedCategory= null;
  this.categoryForm.reset();
}

loadCategories(): void {
  this.categoriesService.getAllCategories().subscribe((categories : Category[]) => {
    this.categories = categories;
    this.filteredCategories = categories;
  });
}

onSearch(filteredCategories: Category[]): void {
  this.filteredCategories = filteredCategories.length > 0 ? filteredCategories: [];
}

checkCategoryExists(nombreCategoria: string, excludeCategoryId?: string): Observable<boolean> {
  return this.categoriesService.getOneCategoryByName(nombreCategoria, excludeCategoryId).pipe(
    map((categoria: Category) => !!categoria),
  );
}

addCategory() {
  if (this.categoryForm.valid) {
    const categoryData = this.categoryForm.value;

    this.checkCategoryExists(categoryData.nombreCategoria).pipe(
      switchMap((existe: boolean) => {
        if (!existe) {
          return this.categoriesService.addCategory(categoryData);
        } 
        return throwError(() => new Error('La categoría ya existe'));
      })
    ).subscribe({
      next: () => {
        alertMethod('Alta de categorías', 'Categoría agregada exitosamente', 'success');
        this.categoryForm.reset();
        this.closeModal('addCategoria');
        this.ngOnInit();
      },
      error: (err) => {
        if (err.message === 'La categoría ya existe') {
          this.closeModal('addCategoria');
          this.alertComponent.showAlert(err.message, 'error');
        } else if (err.status === 500) {
            this.alertComponent.showAlert('Error interno del servidor', 'error');
        } else {
          this.closeModal('addCategoria');
          this.alertComponent.showAlert('Ocurrió un error al agregar la categoría', 'error');
        }
        this.categoryForm.reset();
      }
    });
  }else{
    alertMethod('Alta de categorías', 'Debe completar los campos', 'error');
    return;
  }
}

editCategory(): void {
  if (this.selectedCategory) {
    const updatedCategory: Category = {
      ...this.selectedCategory,
      ...this.categoryForm.value
    };
    this.checkCategoryExists(updatedCategory.nombreCategoria, this.selectedCategory.id).pipe(
      switchMap((exists: boolean) => {
        if (exists) {
          return throwError(() => new Error('El nombre de la categoría ya existe'));
        } 
        return this.categoriesService.editCategory(updatedCategory);
      })
    ).subscribe({
      next: () => {
        alertMethod('Actualización de categorías', 'Categoría actualizada exitosamente', 'success');
        this.categoryForm.reset();
        this.closeModal('editCategoria');
        this.ngOnInit();
      },
      error: (err: any) => {
        if (err.message === 'El nombre de la categoría ya existe') {
          this.closeModal('editCategoria');
          this.alertComponent.showAlert(err.message, 'error');
        } else if (err.status === 500) {
          this.alertComponent.showAlert('Error interno del servidor', 'error');
        } else {
          this.closeModal('editCategoria');
          this.alertComponent.showAlert('Ocurrió un error al editar la categoría', 'error');
        }
        this.categoryForm.reset();
      }
    });
  }
}

deleteCategory(category: Category | null, modalId: string) {
  if(category){
      this.categoriesService.deleteCategory(category).subscribe(() => {
        alertMethod('Eliminación de categorias','Categoría eliminada exitosamente', 'success');
        this.ngOnInit();
        this.closeModal(modalId);
        this.categoryForm.reset();
      });
  }
}

}

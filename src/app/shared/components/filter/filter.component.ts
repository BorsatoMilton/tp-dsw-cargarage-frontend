import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { BrandsService } from '../../../core/services/brands.service';
import { CategoriesService } from '../../../core/services/categories.service';
import { Brand } from '../../../core/models/brands.interfaces';
import { Category } from '../../../core/models/categories.interface';
import { FormsModule } from '@angular/forms';
import { EventEmitter } from '@angular/core';
import { Output } from '@angular/core';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css'],
})
export class FilterComponent implements OnInit {
  @Output() filterChanged = new EventEmitter<any>();

  filterForm: FormGroup;
  brands: Brand[] = [];
  categories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private brandService: BrandsService,
    private categoriesService: CategoriesService
  ) {
    this.filterForm = this.fb.group({
      category: '',
      brand: '',
      priceDesde: 0,
      priceHasta: 0,
      kilometersDesde: 0,
      kilometersHasta: 0,
      isRentable: false,
      isBuyable: false,
    });
  }

  ngOnInit(): void {
    this.brandService.getAllBrand().subscribe({
      next: (brands: Brand[]) => {
        this.brands = brands;
      },
      error: (err) => {
        console.error('Error al obtener marcas:', err);
      },
    });

    this.categoriesService.getAllCategories().subscribe({
      next: (categories: Category[]) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Error al obtener categorías:', err);
      },
    });
  }

  applyFilter(): void {
    const filterValues = this.filterForm.value;
    this.filterChanged.emit(filterValues);
  }

  resetFilter(): void {
    this.filterForm.reset();
    this.filterChanged.emit({});
  }
}

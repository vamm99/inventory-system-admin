import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoryService } from './service/category.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category',
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './category.html',
  styleUrl: './category.css',
})
export class Category implements OnInit {
  private categoryService = inject(CategoryService);
  private fb: FormBuilder = inject(FormBuilder);

  categoryForm!: FormGroup;
  categories: any[] = [];
  submitted = false;
  isLoading = false;
  showAddModal = false;
  errorMessage = '';
  searchTerm = ''; // 🔹 Nuevo: término de búsqueda

  // 🔹 Paginación
  currentPage = 1;
  limit = 10;
  totalPages = 1;
  totalItems = 0;

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
  }

  private initForm(): void {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    });
  }

  loadCategories(page: number = this.currentPage): void {
    this.isLoading = true;
    this.categoryService.getAllCategories(page, this.limit).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.categories = response.data;
        if (response.pagination) {
          this.currentPage = response.pagination.page;
          this.limit = response.pagination.limit;
          this.totalItems = response.pagination.total;
          this.totalPages = response.pagination.lastPage;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Error al obtener categorías.';
      },
    });
  }

  // 🔸 Paginación
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadCategories(this.currentPage);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadCategories(this.currentPage);
    }
  }

  // 🔸 Crear categoría
  onSubmit(): void {
    this.submitted = true;
    if (this.categoryForm.invalid) return;

    this.isLoading = true;
    const { name } = this.categoryForm.value;

    this.categoryService.createCategory(name).subscribe({
      next: () => {
        this.isLoading = false;
        this.closeModal();
        this.loadCategories(); // recargar lista
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message;
      },
    });
  }

  // 🔸 buscar categoría (modificado para manejar búsqueda vacía)
  searchCategories(name: string): void {
    this.searchTerm = name;
    
    // Si el término está vacío, cargar todas las categorías
    if (!name || name.trim() === '') {
      this.loadCategories(1);
      return;
    }

    this.isLoading = true;
    this.categoryService.shareCategoryByName(name).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.categories = response.data;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Error al buscar categorías.';
      },
    });
  }

  // 🔹 Nuevo: método para manejar el input de búsqueda
  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchCategories(input.value);
  }

  // 🔸 Modal control
  openModal(): void {
    this.showAddModal = true;
  }

  closeModal(): void {
    this.showAddModal = false;
    this.resetForm();
  }

  resetForm(): void {
    this.categoryForm.reset();
    this.submitted = false;
    this.errorMessage = '';
  }
}
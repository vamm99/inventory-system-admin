import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService, ProductShare } from './service/product.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProviderService, ProviderShare } from '../provider/service/provider.service';
import { CategoryService } from '../category/service/category.service';

@Component({
  selector: 'app-product',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './product.html',
  styleUrl: './product.css',
})
export class Product implements OnInit {
  private productService = inject(ProductService);
  private providerService = inject(ProviderService);
  private categoryService = inject(CategoryService);
  private fb: FormBuilder = inject(FormBuilder);

  productForm!: FormGroup;
  products: any[] = [];
  providers: any[] = [];
  categories: any[] = [];
  
  // 🔹 Listas filtradas para el dropdown
  filteredProviders: any[] = [];
  filteredCategories: any[] = [];
  
  // 🔹 Control de visibilidad de dropdowns
  showProviderDropdown = false;
  showCategoryDropdown = false;
  
  submitted = false;
  isLoading = false;
  showAddModal = false;
  errorMessage = '';
  searchTerm = '';
  searchType: 'name' | 'barcode' = 'name';

  // 🔹 Búsquedas separadas para el modal
  providerSearchTerm = '';
  categorySearchTerm = '';

  // 🔹 Paginación
  currentPage = 1;
  limit = 10;
  totalPages = 1;
  totalItems = 0;

  ngOnInit(): void {
    this.initForm();
    this.loadProducts();
  }

  initForm(): void {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      barcode: ['', Validators.required],
      categoryId: ['', Validators.required],
      providerId: ['', Validators.required],
      description: ['', Validators.required],
      coste: ['', Validators.required],
      price: ['', Validators.required],
      stock: ['', Validators.required],
      unit: ['', Validators.required],
      expiredAt: ['', Validators.required],
    });
  }

  loadProducts(page: number = this.currentPage): void {
    this.isLoading = true;
    this.productService.getAllProducts(page, this.limit).subscribe({
      next: (data) => {
        this.products = data.data;
        if (data.pagination) {
          this.currentPage = data.pagination.page;
          this.limit = data.pagination.limit;
          this.totalItems = data.pagination.total;
          this.totalPages = data.pagination.lastPage;
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
      },
    });
  }

  // 🔹 Cargar proveedores al abrir el modal
  loadProviders(): void {
    this.providerService.getAllProviders().subscribe({
      next: (response) => {
        this.providers = response.data;
        this.filteredProviders = response.data;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar proveedores.';
      },
    });
  }

  // 🔹 Cargar categorías al abrir el modal
  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (response) => {
        this.categories = response.data;
        this.filteredCategories = response.data;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar categorías.';
      },
    });
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadProducts(this.currentPage);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadProducts(this.currentPage);
    }
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.productForm.invalid) return;

    this.isLoading = true;
    const productData = this.productForm.value;

    this.productService.createProduct(productData).subscribe({
      next: () => {
        this.showAddModal = false;
        this.loadProducts();
        this.productForm.reset();
        this.submitted = false;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
      },
    });
  }

  searchProducts(): void {
    const term = this.searchTerm.trim();

    if (!term) {
      this.loadProducts(1);
      return;
    }

    this.isLoading = true;

    const productShare: ProductShare = {
      name: term,
      barcode: term,
    };

    this.productService.shareProductByName(productShare).subscribe({
      next: (response) => {
        this.products = response.data;
        this.totalItems = response.pagination?.total || 0;
        this.totalPages = response.pagination?.lastPage || 1;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
      },
    });
  }

  searchProviders(): void {
    const term = this.providerSearchTerm.trim();

    if (!term) {
      this.filteredProviders = this.providers;
      this.showProviderDropdown = false;
      return;
    }

    this.showProviderDropdown = true;

    const providerShare: ProviderShare = {
      name: term,
      email: term,
      phone: term
    };

    this.providerService.shareProviderByName(providerShare).subscribe({
      next: (response) => {
        this.filteredProviders = response.data;
      },
      error: (error) => {
        this.errorMessage = 'Error al buscar proveedores.';
        this.filteredProviders = [];
      },
    });
  }

  searchCategories(): void {
    const term = this.categorySearchTerm.trim();

    if (!term) {
      this.filteredCategories = this.categories;
      this.showCategoryDropdown = false;
      return;
    }

    this.showCategoryDropdown = true;

    this.categoryService.shareCategoryByName(term).subscribe({
      next: (response) => {
        this.filteredCategories = response.data;
      },
      error: (error) => {
        this.errorMessage = 'Error al buscar categorías.';
        this.filteredCategories = [];
      },
    });
  }

  // 🔹 Seleccionar proveedor del dropdown
  selectProvider(provider: any): void {
    this.productForm.patchValue({ providerId: provider.id });
    this.providerSearchTerm = provider.name;
    this.showProviderDropdown = false;
  }

  // 🔹 Seleccionar categoría del dropdown
  selectCategory(category: any): void {
    this.productForm.patchValue({ categoryId: category.id });
    this.categorySearchTerm = category.name;
    this.showCategoryDropdown = false;
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.searchProducts();
  }

  onProviderSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.providerSearchTerm = input.value;
    this.searchProviders();
  }

  onCategorySearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.categorySearchTerm = input.value;
    this.searchCategories();
  }

  onSearchTypeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.searchType = select.value as 'name' | 'barcode';
    if (this.searchTerm) {
      this.searchProducts();
    }
  }

  openModal(): void {
    this.showAddModal = true;
    this.loadProviders();
    this.loadCategories();
  }

  closeModal(): void {
    this.showAddModal = false;
    this.resetForm();
  }

  resetForm(): void {
    this.productForm.reset();
    this.submitted = false;
    this.errorMessage = '';
    this.providerSearchTerm = '';
    this.categorySearchTerm = '';
    this.showProviderDropdown = false;
    this.showCategoryDropdown = false;
  }

  // 🔹 Obtener clase de estilo para stock
  getStockClass(stock: number): string {
    if (stock === 0) return 'bg-red-100 text-red-700 font-semibold';
    if (stock <= 5) return 'bg-orange-100 text-orange-700 font-semibold';
    if (stock <= 10) return 'bg-yellow-100 text-yellow-700 font-semibold';
    return 'bg-green-100 text-green-700 font-semibold';
  }

  // 🔹 Obtener ícono para stock
  getStockIcon(stock: number): string {
    if (stock === 0) return '⛔';
    if (stock <= 5) return '⚠️';
    if (stock <= 10) return '⚡';
    return '✅';
  }

  // 🔹 Obtener clase de estilo para fecha de vencimiento
  getExpiryClass(expiredAt: string): string {
    const today = new Date();
    const expiryDate = new Date(expiredAt);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'bg-red-100 text-red-700 font-semibold';
    if (diffDays <= 7) return 'bg-orange-100 text-orange-700 font-semibold';
    if (diffDays <= 30) return 'bg-yellow-100 text-yellow-700 font-semibold';
    return 'bg-blue-100 text-blue-700';
  }

  // 🔹 Obtener ícono para fecha de vencimiento
  getExpiryIcon(expiredAt: string): string {
    const today = new Date();
    const expiryDate = new Date(expiredAt);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return '❌';
    if (diffDays <= 7) return '🔴';
    if (diffDays <= 30) return '🟡';
    return '🟢';
  }

  // 🔹 Obtener texto del estado de vencimiento
  getExpiryStatus(expiredAt: string): string {
    const today = new Date();
    const expiryDate = new Date(expiredAt);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Vencido';
    if (diffDays === 0) return 'Vence hoy';
    if (diffDays === 1) return 'Vence mañana';
    if (diffDays <= 7) return `Vence en ${diffDays} días`;
    if (diffDays <= 30) return `Vence en ${diffDays} días`;
    return `${diffDays} días`;
  }
}
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../service/product.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProviderService, ProviderShare } from '../../provider/service/provider.service';
import { CategoryService } from '../../category/service/category.service';

@Component({
  selector: 'app-product-detail',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private providerService = inject(ProviderService);
  private categoryService = inject(CategoryService);
  private fb: FormBuilder = inject(FormBuilder);
  private router = inject(Router);

  productForm!: FormGroup;
  providers: any[] = [];
  categories: any[] = [];
  product: any = null;
  id!: number;
  submitted = false;
  isLoading = false;
  errorMessage = '';

  // 🔹 Listas filtradas para el dropdown
  filteredProviders: any[] = [];
  filteredCategories: any[] = [];

  // 🔹 Control de visibilidad de dropdowns
  showProviderDropdown = false;
  showCategoryDropdown = false;

  // 🔹 Búsquedas separadas para el modal
  providerSearchTerm = '';
  categorySearchTerm = '';

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.initForm();
    this.loadProduct();
    this.loadProviders();
    this.loadCategories();
  }

  initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      barcode: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(3)]],
      categoryId: ['', [Validators.required]],
      providerId: ['', [Validators.required]],
      coste: ['', [Validators.required]],
      price: ['', [Validators.required]],
      stock: ['', [Validators.required]],
      unit: ['', [Validators.required]],
      expiredAt: ['', [Validators.required]],
      createdAt: [{ value: '', disabled: true }],
      updatedAt: [{ value: '', disabled: true }]
    });
  }

  loadProduct(): void {
    this.isLoading = true;
    this.productService.getProductById(this.id).subscribe({
      next: (data) => {
        this.product = data.data;
        
        // Formatear fechas para input type="date"
        const expiredDate = data.data.expiredAt ? data.data.expiredAt.split('T')[0] : '';
        const createdDate = data.data.createdAt ? new Date(data.data.createdAt).toLocaleString('es-ES') : '';
        const updatedDate = data.data.updatedAt ? new Date(data.data.updatedAt).toLocaleString('es-ES') : '';
        
        this.productForm.patchValue({
          name: data.data.name,
          barcode: data.data.barcode,
          description: data.data.description,
          categoryId: data.data.category?.id || '',
          providerId: data.data.provider?.id || '',
          coste: data.data.coste,
          price: data.data.price,
          stock: data.data.stock,
          unit: data.data.unit,
          expiredAt: expiredDate,
          createdAt: createdDate,
          updatedAt: updatedDate
        });

        // Inicializar términos de búsqueda con nombres actuales
        this.providerSearchTerm = data.data.provider?.name || '';
        this.categorySearchTerm = data.data.category?.name || '';

        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Error al cargar el producto';
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.productForm.invalid) return;
    
    this.isLoading = true;
    const formData = this.productForm.getRawValue();
    
    // Preparar datos para enviar
    const updateData: any = {
      name: formData.name,
      barcode: formData.barcode,
      description: formData.description,
      categoryId: formData.categoryId,
      providerId: formData.providerId,
      coste: formData.coste,
      price: formData.price,
      stock: formData.stock,
      unit: formData.unit,
      expiredAt: formData.expiredAt
    };

    this.productService.updateProduct(this.id, updateData).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/admin/product']);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error al actualizar el producto';
        this.isLoading = false;
      }
    });
  }

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

  selectProvider(provider: any): void {
    this.productForm.patchValue({ providerId: provider.id });
    this.providerSearchTerm = provider.name;
    this.showProviderDropdown = false;
  }

  selectCategory(category: any): void {
    this.productForm.patchValue({ categoryId: category.id });
    this.categorySearchTerm = category.name;
    this.showCategoryDropdown = false;
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

  deleteProduct(): void {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.isLoading = true;
      this.productService.deleteProduct(this.id).subscribe({
        next: () => {
          this.router.navigate(['/admin/product']);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Error al eliminar el producto';
          this.isLoading = false;
        }
      });
    }
  }

  // 🔹 Obtener clase de estilo para stock
  getStockClass(stock: number): string {
    if (stock === 0) return 'bg-red-100 text-red-700 font-semibold';
    if (stock <= 5) return 'bg-orange-100 text-orange-700 font-semibold';
    if (stock <= 10) return 'bg-yellow-100 text-yellow-700 font-semibold';
    return 'bg-green-100 text-green-700 font-semibold';
  }

  getStockIcon(stock: number): string {
    if (stock === 0) return '⛔';
    if (stock <= 5) return '⚠️';
    if (stock <= 10) return '⚡';
    return '✅';
  }

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
    return `${diffDays} días restantes`;
  }
}
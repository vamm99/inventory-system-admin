import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProviderService } from '../../service/provider.service';
import { ProductService, ProductShare } from '../../../product/service/product.service';

@Component({
  selector: 'app-providerdetail',
  imports: [CommonModule],
  templateUrl: './provider-products.html',
  styleUrl: './provider-products.css',
})
export class ProviderProducts implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private providerService = inject(ProviderService);

  products: any[] = [];
  id!: number;
  isLoading = false;
  errorMessage = '';
  searchTerm = '';
  searchType: 'name' | 'barcode' = 'name';

  // 🔹 Paginación
  currentPage = 1;
  limit = 10;
  totalPages = 1;
  totalItems = 0;

  ngOnInit(): void {
    this.id = this.route.parent?.snapshot.params['id'];
    this.getProviderProducts();
  }

  getProviderProducts(page: number = this.currentPage, limit: number = this.limit) {
    this.isLoading = true;
    this.providerService.getProviderProducts(this.id, page, limit).subscribe({
      next: (response) => {
        this.products = response.data;
        if (response.pagination) {
          this.currentPage = response.pagination.page;
          this.limit = response.pagination.limit;
          this.totalItems = response.pagination.total;
          this.totalPages = response.pagination.lastPage;
        }
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
      this.getProviderProducts(1);
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

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getProviderProducts(this.currentPage, this.limit);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getProviderProducts(this.currentPage, this.limit);
    }
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.searchProducts();
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

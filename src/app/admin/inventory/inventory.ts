import { Component, inject, OnInit } from '@angular/core';
import { InventoryService, Product } from './service/inventory.service';

@Component({
  selector: 'app-inventory',
  imports: [],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css',
})
export class Inventory implements OnInit {
  private inventoryService = inject(InventoryService);

  products: Product[] = [];
  errorMessage = '';
  isLoading = false;
  isGeneratingExcel = false;

  // 🔹 Paginación
  currentPage = 1;
  limit = 10;
  totalPages = 1;
  totalItems = 0;

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(page: number = this.currentPage): void {
    this.isLoading = true;
    this.inventoryService.inventoryOfProducts(page, this.limit).subscribe({
      next: (response: any) => {
        this.products = response.data;
        if (response.pagination) {
          this.currentPage = response.pagination.page;
          this.limit = response.pagination.limit;
          this.totalItems = response.pagination.total;
          this.totalPages = response.pagination.lastPage;
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = error.error.message;
        this.isLoading = false;
      },
    });
  }

  exportToExcel(): void {
    this.isGeneratingExcel = true;
    this.inventoryService.generateExcelReportForProducts().subscribe({
      next: (response: any) => {
        const blob = new Blob([response], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte_inventario_productos.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        this.isGeneratingExcel = false;
      },
      error: (error: any) => {
        this.errorMessage = error.error.message;
        this.isGeneratingExcel = false;
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
}

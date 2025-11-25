import { Component, inject, OnInit } from '@angular/core';
import { InventoryService, Product, KardexFilters } from './service/inventory.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css',
})
export class Inventory implements OnInit {
  private inventoryService = inject(InventoryService);
  
  products: Product[] = [];
  errorMessage = '';
  isLoading = false;
  isGeneratingExcel = false;
  isGeneratingKardexExcel = false;

  // 🔹 Paginación
  currentPage = 1;
  limit = 10;
  totalPages = 1;
  totalItems = 0;

  // 🆕 Filtros de Kardex
  kardexStartDate: string = '';
  kardexEndDate: string = '';
  showKardexFilters = false;

  ngOnInit(): void {
    this.loadProducts();
    // Establecer fecha de hoy por defecto
    const today = new Date().toISOString().split('T')[0];
    this.kardexStartDate = today;
    this.kardexEndDate = today;
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

  // 🆕 Exportar Kardex con filtros
  exportKardexToExcel(): void {
    this.isGeneratingKardexExcel = true;
    
    const filters: KardexFilters = {};
    
    if (this.kardexStartDate) {
      filters.startDate = this.kardexStartDate;
    }
    
    if (this.kardexEndDate) {
      filters.endDate = this.kardexEndDate;
    }
    
    this.inventoryService.generateExcelReportForKardex(filters).subscribe({
      next: (response: Blob) => {
        const blob = new Blob([response], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Nombre dinámico del archivo
        const fileName = this.getKardexFileName();
        a.download = fileName;
        
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        this.isGeneratingKardexExcel = false;
      },
      error: (error: any) => {
        this.errorMessage = error?.error?.message || 'Error al generar el reporte';
        this.isGeneratingKardexExcel = false;
      },
    });
  }

  // 🆕 Exportar Kardex del día actual (rápido)
  exportTodayKardexToExcel(): void {
    const today = new Date().toISOString().split('T')[0];
    this.kardexStartDate = today;
    this.kardexEndDate = today;
    this.exportKardexToExcel();
  }

  // 🆕 Generar nombre de archivo dinámico
  private getKardexFileName(): string {
    if (this.kardexStartDate && this.kardexEndDate) {
      if (this.kardexStartDate === this.kardexEndDate) {
        return `kardex_${this.kardexStartDate}.xlsx`;
      }
      return `kardex_${this.kardexStartDate}_to_${this.kardexEndDate}.xlsx`;
    }
    return `kardex_${new Date().toISOString().split('T')[0]}.xlsx`;
  }

  // 🆕 Toggle para mostrar/ocultar filtros
  toggleKardexFilters(): void {
    this.showKardexFilters = !this.showKardexFilters;
  }

  // 🆕 Resetear filtros a hoy
  resetKardexFilters(): void {
    const today = new Date().toISOString().split('T')[0];
    this.kardexStartDate = today;
    this.kardexEndDate = today;
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
}
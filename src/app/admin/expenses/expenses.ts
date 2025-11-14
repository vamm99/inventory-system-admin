import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../product/service/product.service';

@Component({
  selector: 'app-expenses',
  imports: [CommonModule, FormsModule],
  templateUrl: './expenses.html',
  styleUrl: './expenses.css',
})
export class Expenses implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private readonly STORAGE_KEY = 'expenses_items';

  barcode: string = '';
  items: any[] = [];
  errorMessage = '';
  successMessage = '';

  private typingTimer: any;
  private typingDelay = 150;

  ngOnInit(): void {
    // Cargar items del localStorage al inicializar
    this.loadItemsFromStorage();
  }

  private loadItemsFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.items = JSON.parse(stored);
      }
    } catch (error) {
      console.error('❌ Error al cargar del localStorage:', error);
      this.items = [];
    }
  }

  private saveItemsToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items));
    } catch (error) {
      console.error('❌ Error al guardar en localStorage:', error);
    }
  }

  private clearItemsFromStorage(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('❌ Error al limpiar localStorage:', error);
    }
  }

  onBarcodeInput() {
    clearTimeout(this.typingTimer);

    this.typingTimer = setTimeout(() => {
      if (this.barcode.trim().length >= 3) {
        this.addProduct();
      }
    }, this.typingDelay);
  }

  addProduct() {
    const code = this.barcode.trim();

    if (!code) {
      return;
    }

    // Buscar el producto por código de barras
    this.productService.getProductByBarcode(code).subscribe({
      next: (response) => {
        if (!response.data) {
          this.errorMessage = response.message || 'Producto no encontrado';
          this.barcode = '';
          return;
        }

        // El servidor devuelve un objeto único, no un array
        const product = response.data;

        // Verificar si ya existe en la lista
        const existing = this.items.find((i) => i.id === product.id);

        if (existing) {
          existing.quantity++;
        } else {
          this.items.push({
            id: product.id,
            name: product.name,
            quantity: 1,
          });
        }

        // Guardar en localStorage después de cada cambio
        this.saveItemsToStorage();
        this.barcode = '';
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error al buscar el producto';
        this.barcode = '';
      }
    });
  }

  removeProduct(item: any) {
    this.items = this.items.filter((i) => i.id !== item.id);
    // Guardar cambios en localStorage
    this.saveItemsToStorage();
  }

  incrementQuantity(item: any) {
    item.quantity++;
    // Guardar cambios en localStorage
    this.saveItemsToStorage();
  }

  decrementQuantity(item: any) {
    if (item.quantity > 1) {
      item.quantity--;
    } else {
      this.removeProduct(item);
      return; // removeProduct ya guarda en localStorage
    }
    // Guardar cambios en localStorage
    this.saveItemsToStorage();
  }

  getTotalUnits() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  discountInventory() {
    if (this.items.length === 0) {
      this.errorMessage = 'No hay productos para descontar del inventario';
      return;
    }

    this.productService.createKardex(this.items).subscribe({
      next: (response) => {
        this.successMessage = response.message || 'Inventario descontado exitosamente';
        this.items = [];
        // Limpiar SOLO los items del localStorage, manteniendo el token
        this.clearItemsFromStorage();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error al descontar el inventario';
      }
    });
  }

  ngOnDestroy() {
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }
  }

  closeError() {
    this.errorMessage = '';
  }

  closeSuccess() {
    this.successMessage = '';
  }
}
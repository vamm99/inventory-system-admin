import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-expenses',
  imports: [CommonModule, FormsModule],
  templateUrl: './expenses.html',
  styleUrl: './expenses.css',
})
export class Expenses {
  barcode: string = '';
  items: any[] = [];

  private typingTimer: any;
  private typingDelay = 150;

  productsDB = [
    { id: 1, barcode: '111', name: 'Coca Cola 400ml' },
    { id: 2, barcode: '222', name: 'Jabón Rey' },
    { id: 3, barcode: '333', name: 'Papel Higiénico' },
  ];

  findProduct(code: string) {
    return this.productsDB.find((p) => p.barcode === code);
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
    const product = this.findProduct(this.barcode.trim());

    if (!product) {
      console.warn('Producto no encontrado');
      this.barcode = '';
      return;
    }

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

    this.barcode = '';
  }

  removeProduct(item: any) {
    this.items = this.items.filter((i) => i.id !== item.id);
  }

  getTotalUnits() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  // ⭐ Nueva función
  printTableData() {
    console.log('📦 Datos de la tabla:', this.items);
    console.log('🔢 Total de unidades:', this.getTotalUnits());
  }
}

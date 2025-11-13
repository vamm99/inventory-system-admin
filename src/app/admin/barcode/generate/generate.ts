import { Component, OnInit } from '@angular/core';
import { BarcodeService, BarcodeShare } from '../service/barcode.service';
import { inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Barcode {
  id: number;
  barcode: string;
  imageUrl: string;
  isUsed: boolean;
  product: {
    id: number;
    name: string;
    barcode: string;
    description?: string;
    price: number;
    coste?: number;
    stock: number;
    unit?: string;
    expiredAt?: string;
    category: {
      id: number;
      name: string;
    };
    provider: {
      id: number;
      name: string;
    };
  } | null;
  createdAt: string;
  updatedAt: string | null;
}

@Component({
  selector: 'app-generate',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './generate.html',
  styleUrl: './generate.css',
})
export class Generate implements OnInit {
  private barcodeService = inject(BarcodeService);
  private fb: FormBuilder = inject(FormBuilder);

  codeForm!: FormGroup;
  codes: Barcode[] = [];
  submitted = false;

  // 🔹 Estados de carga separados
  isGenerating = false;  // Para el botón de generar
  isLoadingTable = false;  // Para la tabla
  isInitialLoad = true;
  isGeneratingPDF = false;  // 🆕 Para el botón de PDF

  errorMessage = '';
  searchTerm = '';

  filterStatus: 'all' | 'used' | 'available' = 'all';

  currentPage = 1;
  limit = 10;
  totalPages = 1;
  totalItems = 0;

  private searchTimeout: any;

  ngOnInit(): void {
    this.initForm();
    this.loadBarcodes();
  }

  initForm(): void {
    this.codeForm = this.fb.group({
      count: ['', [Validators.required, Validators.min(1), Validators.max(100)]],
    });
  }

  loadBarcodes(page: number = this.currentPage): void {
    this.isLoadingTable = true;
    this.errorMessage = '';

    let observable;

    switch (this.filterStatus) {
      case 'used':
        observable = this.barcodeService.getUsedBarcodes(page, this.limit);
        break;
      case 'available':
        observable = this.barcodeService.getAvailableBarcodes(page, this.limit);
        break;
      default:
        observable = this.barcodeService.getAllBarcodes(page, this.limit);
    }

    observable.subscribe({
      next: (response) => {
        this.codes = response.data;
        if (response.pagination) {
          this.currentPage = response.pagination.page;
          this.limit = response.pagination.limit;
          this.totalItems = response.pagination.total;
          this.totalPages = response.pagination.lastPage;
        }
        this.isLoadingTable = false;
        this.isInitialLoad = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error al cargar los códigos';
        this.isLoadingTable = false;
        this.isInitialLoad = false;
        console.error('Error loading barcodes:', error);
      },
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.codeForm.invalid) return;

    this.isGenerating = true;
    this.errorMessage = '';
    const codeData = this.codeForm.value;

    this.barcodeService.generateBarcode(codeData.count).subscribe({
      next: () => {
        this.loadBarcodes(1);
        this.codeForm.reset();
        this.submitted = false;
        this.isGenerating = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error al generar códigos';
        this.isGenerating = false;
        console.error('Error generating barcodes:', error);
      },
    });
  }

  searchBarcodes(): void {
    const term = this.searchTerm.trim();

    if (!term) {
      this.loadBarcodes(1);
      return;
    }

    this.isLoadingTable = true;
    this.errorMessage = '';

    const barcodeShare: BarcodeShare = {
      code: term,
    };

    this.barcodeService.shareBarcodeByName(barcodeShare).subscribe({
      next: (response) => {
        this.codes = response.data ? [response.data] : [];
        this.totalItems = this.codes.length;
        this.totalPages = 1;
        this.currentPage = 1;
        this.isLoadingTable = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Código no encontrado';
        this.codes = [];
        this.isLoadingTable = false;
        console.error('Error searching barcode:', error);
      },
    });
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.searchBarcodes();
    }, 500);
  }

  filterByStatus(status: 'all' | 'used' | 'available'): void {
    this.filterStatus = status;
    this.currentPage = 1;
    this.searchTerm = '';
    this.loadBarcodes(1);
  }

  // 🆕 Función para exportar PDF
  exportToPDF(): void {
    this.isGeneratingPDF = true;
    this.errorMessage = '';

    this.barcodeService.generateBarcodePDF(this.filterStatus).subscribe({
      next: (blob) => {
        // Crear un nombre de archivo descriptivo
        const fileName = this.getFileName();
        
        // Crear un enlace temporal para descargar el archivo
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        
        // Limpiar
        window.URL.revokeObjectURL(url);
        this.isGeneratingPDF = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error al generar el PDF';
        this.isGeneratingPDF = false;
        console.error('Error generating PDF:', error);
      },
    });
  }

  // 🆕 Obtener nombre del archivo según el filtro
  private getFileName(): string {
    const date = new Date().toISOString().split('T')[0];
    
    switch (this.filterStatus) {
      case 'used':
        return `codigos-usados-${date}.pdf`;
      case 'available':
        return `codigos-disponibles-${date}.pdf`;
      default:
        return `todos-los-codigos-${date}.pdf`;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadBarcodes(this.currentPage);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadBarcodes(this.currentPage);
    }
  }

  resetForm(): void {
    this.codeForm.reset();
    this.submitted = false;
    this.errorMessage = '';
    this.searchTerm = '';
    this.filterStatus = 'all';
    this.loadBarcodes(1);
  }

  getBarcodeStatus(barcode: Barcode): string {
    return barcode.isUsed ? 'Usado' : 'Disponible';
  }

  getStatusClass(barcode: Barcode): string {
    return barcode.isUsed
      ? 'bg-red-100 text-red-800'
      : 'bg-green-100 text-green-800';
  }
}
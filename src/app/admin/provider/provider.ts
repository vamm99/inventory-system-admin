import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProviderService, ProviderShare } from './service/provider.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-provider',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './provider.html',
  styleUrl: './provider.css',
})
export class Provider implements OnInit {
  private providerService = inject(ProviderService);
  private fb: FormBuilder = inject(FormBuilder);

  providerForm!: FormGroup;
  providers: any[] = [];
  submitted = false;
  isLoading = false;
  showAddModal = false;
  errorMessage = '';
  searchTerm = ''; // 🔹 término de búsqueda
  searchType: 'name' | 'email' | 'phone' = 'name'; // 🔹 tipo de búsqueda

  // 🔹 Paginación
  currentPage = 1;
  limit = 10;
  totalPages = 1;
  totalItems = 0;

  ngOnInit(): void {
    this.initForm();
    this.loadProviders();
  }

  initForm(): void {
    this.providerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
    });
  }

  loadProviders(page: number = this.currentPage): void {
    this.isLoading = true;
    this.providerService.getAllProviders(page, this.limit).subscribe({
      next: (data) => {
        this.providers = data.data;
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

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadProviders(this.currentPage);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadProviders(this.currentPage);
    }
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.providerForm.invalid) return;

    this.isLoading = true;
    const providerData = this.providerForm.value;

    this.providerService.createProvider(providerData).subscribe({
      next: () => {
        this.isLoading = false;
        this.closeModal();
        this.loadProviders();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message;
      },
    });
  }

  // 🔸 Buscar proveedor
  searchProviders(): void {
    const term = this.searchTerm.trim();

    if (!term) {
      this.loadProviders(1);
      return;
    }

    this.isLoading = true;

    // Enviar el término en los 3 campos, el backend buscará con OR
    const providerShare: ProviderShare = {
      name: term,
      email: term,
      phone: term
    };

    this.providerService.shareProviderByName(providerShare).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.providers = response.data;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Error al buscar proveedores.';
      },
    });
  }

  // 🔹 Manejar el input de búsqueda
  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.searchProviders();
  }

  // 🔹 Cambiar tipo de búsqueda
  onSearchTypeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.searchType = select.value as 'name' | 'email' | 'phone';
    // Realizar búsqueda si ya hay un término
    if (this.searchTerm) {
      this.searchProviders();
    }
  }

  openModal(): void {
    this.showAddModal = true;
  }

  closeModal(): void {
    this.showAddModal = false;
    this.resetForm();
  }

  resetForm(): void {
    this.providerForm.reset();
    this.submitted = false;
    this.errorMessage = '';
  }
}

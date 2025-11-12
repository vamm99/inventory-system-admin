import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ProviderService } from '../service/provider.service';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-providerdetail',
  imports: [ReactiveFormsModule, CommonModule, RouterLink, RouterOutlet, RouterLinkActive],
  templateUrl: './providerdetail.html',
  styleUrl: './providerdetail.css',
})
export class Providerdetail implements OnInit {
  private route = inject(ActivatedRoute);
  private providerService = inject(ProviderService);

  providerForm!: FormGroup;
  provider: any = null;
  id!: number;
  submitted = false;
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.loadProvider();
  }

  loadProvider(): void {
    this.isLoading = true;
    this.providerService.getProviderById(this.id).subscribe({
      next: (data) => {
        this.provider = data.data;
        
        // Formatear fechas
        const createdDate = data.data.createdAt ? new Date(data.data.createdAt).toLocaleString('es-ES') : '';
        const updatedDate = data.data.updatedAt ? new Date(data.data.updatedAt).toLocaleString('es-ES') : '';
        
        this.providerForm.patchValue({
          name: data.data.name,
          email: data.data.email,
          phone: data.data.phone,
          address: data.data.address,
          createdAt: createdDate,
          updatedAt: updatedDate
        });
        
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error al cargar el proveedor';
        this.isLoading = false;
      }
    });
  }

  // 🔹 Validar formato de email
  isValidEmail(): boolean {
    const emailControl = this.providerForm.get('email');
    return emailControl?.valid || false;
  }

  // 🔹 Validar formato de teléfono
  isValidPhone(): boolean {
    const phoneControl = this.providerForm.get('phone');
    return phoneControl?.valid || false;
  }
}
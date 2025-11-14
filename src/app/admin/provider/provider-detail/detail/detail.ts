import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ProviderService } from '../../service/provider.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detail',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './detail.html',
  styleUrl: './detail.css',
})
export class Detail implements OnInit {
  private route = inject(ActivatedRoute);
  private providerService = inject(ProviderService);
  private fb: FormBuilder = inject(FormBuilder);
  private router = inject(Router);

  providerForm!: FormGroup;
  provider: any = null;
  id!: number;
  submitted = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.id = this.route.parent?.snapshot.params['id'];
    this.initForm();
    this.loadProvider();
  }

  initForm(): void {
    this.providerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      address: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      createdAt: [{ value: '', disabled: true }],
      updatedAt: [{ value: '', disabled: true }]
    });
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

  onSubmit(): void {
    this.submitted = true;
    if (this.providerForm.invalid) return;
    
    this.isLoading = true;
    const formData = this.providerForm.getRawValue();
    
    const updateData: any = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address
    };

    this.providerService.updateProvider(this.id, updateData).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/admin/provider']);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error al actualizar el proveedor';
        this.isLoading = false;
      }
    });
  }

  deleteProvider(): void {
    if (confirm('¿Estás seguro de eliminar este proveedor? Esta acción no se puede deshacer.')) {
      this.isLoading = true;
      this.providerService.deleteProvider(this.id).subscribe({
        next: () => {
          this.router.navigate(['/admin/provider']);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Error al eliminar el proveedor';
          this.isLoading = false;
        }
      });
    }
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

  closeError(): void {
    this.errorMessage = '';
  }

  closeSuccess(): void {
    this.successMessage = '';
  }
}
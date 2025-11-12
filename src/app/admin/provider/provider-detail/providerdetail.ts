import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ProviderService } from '../service/provider.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-providerdetail',
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './providerdetail.html',
  styleUrl: './providerdetail.css',
})
export class Providerdetail implements OnInit {
  private route = inject(ActivatedRoute);
  private providerService = inject(ProviderService);
  private fb: FormBuilder = inject(FormBuilder);
  private router = inject(Router);

  providerForm!: FormGroup;
  id!: number;
  submitted = false;
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
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
        this.providerForm.patchValue(data.data);
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.providerForm.invalid) return;
    this.isLoading = true;
    this.providerService.updateProvider(this.id, this.providerForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/admin/provider']);
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
      }
    });
  }

}

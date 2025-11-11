import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CategoryService } from '../service/category.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-detail',
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './category-detail.html',
  styleUrl: './category-detail.css',
})
export class CategoryDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private categoryService = inject(CategoryService);
  private fb: FormBuilder = inject(FormBuilder);
  private router = inject(Router);

  categoryForm!: FormGroup;
  id!: number;
  submitted = false;
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.initForm();
    this.loadCategory();
  }

  private initForm(): void {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      createdAt: [{ value: '', disabled: true }],
      updatedAt: [{ value: '', disabled: true }]
    });
  }

  loadCategory(): void {
    this.categoryService.getCategoryById(this.id).subscribe({
      next: (response) => {
        this.categoryForm.patchValue({
          name: response.data.name,
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt
        });
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar la categoría.';
      },
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.categoryForm.invalid) return;
    this.isLoading = true;
    this.categoryService.updateCategory(this.id, this.categoryForm.value.name).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/admin/category']);
      },
      error: (error) => {
        this.errorMessage = 'Error al actualizar la categoría.';
      },
    });
  }
}

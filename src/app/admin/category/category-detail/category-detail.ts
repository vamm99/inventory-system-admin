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
  category: any = null;
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
    this.isLoading = true;
    this.categoryService.getCategoryById(this.id).subscribe({
      next: (response) => {
        this.category = response.data;
        
        // Formatear fechas
        const createdDate = response.data.createdAt ? new Date(response.data.createdAt).toLocaleString('es-ES') : '';
        const updatedDate = response.data.updatedAt ? new Date(response.data.updatedAt).toLocaleString('es-ES') : '';
        
        this.categoryForm.patchValue({
          name: response.data.name,
          createdAt: createdDate,
          updatedAt: updatedDate
        });
        
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error al cargar la categoría.';
        this.isLoading = false;
      },
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.categoryForm.invalid) return;
    
    this.isLoading = true;
    const categoryName = this.categoryForm.value.name;
    
    this.categoryService.updateCategory(this.id, categoryName).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/admin/category']);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error al actualizar la categoría.';
        this.isLoading = false;
      },
    });
  }

  // 🔹 Obtener ícono sugerido según el nombre de la categoría
  getCategoryIcon(): string {
    const name = this.category?.name?.toLowerCase() || '';
    
    if (name.includes('electr')) return '⚡';
    if (name.includes('aliment') || name.includes('comida')) return '🍽️';
    if (name.includes('ropa') || name.includes('vestuario')) return '👕';
    if (name.includes('hogar') || name.includes('casa')) return '🏠';
    if (name.includes('tecnolog') || name.includes('tech')) return '💻';
    if (name.includes('deport')) return '⚽';
    if (name.includes('juguete')) return '🧸';
    if (name.includes('libro') || name.includes('lectura')) return '📚';
    if (name.includes('mascota')) return '🐾';
    if (name.includes('jardin')) return '🌱';
    if (name.includes('salud') || name.includes('medicina')) return '💊';
    if (name.includes('belleza') || name.includes('cosm')) return '💄';
    if (name.includes('ferret')) return '🔧';
    if (name.includes('juego')) return '🎮';
    if (name.includes('música')) return '🎵';
    
    return '📦'; // Default
  }

  // 🔹 Obtener color sugerido según el nombre
  getCategoryColor(): string {
    const name = this.category?.name?.toLowerCase() || '';
    
    if (name.includes('electr')) return 'bg-yellow-100 text-yellow-700';
    if (name.includes('aliment')) return 'bg-green-100 text-green-700';
    if (name.includes('ropa')) return 'bg-purple-100 text-purple-700';
    if (name.includes('hogar')) return 'bg-orange-100 text-orange-700';
    if (name.includes('tecnolog')) return 'bg-blue-100 text-blue-700';
    if (name.includes('deport')) return 'bg-red-100 text-red-700';
    if (name.includes('juguete')) return 'bg-pink-100 text-pink-700';
    if (name.includes('libro')) return 'bg-indigo-100 text-indigo-700';
    
    return 'bg-gray-100 text-gray-700';
  }
}
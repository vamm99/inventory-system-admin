import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/service/auth.service';
import { LoginResponse } from '../auth/service/auth.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  private authService: AuthService = inject(AuthService);
  private fb: FormBuilder = inject(FormBuilder);

  loginForm!: FormGroup;
  submitted = false;
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.minLength(5)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(50)]],
    });
  }

  // Getter para acceder a los controles del formulario
  get email() {
    return this.loginForm.get('email')!;
  }

  get password() {
    return this.loginForm.get('password')!;
  }

  // Método para obtener mensajes de error específicos
  getEmailError(): string {
    if (this.email.hasError('required')) {
      return 'El correo electrónico es requerido';
    }
    if (this.email.hasError('email')) {
      return 'Ingresa un correo electrónico válido';
    }
    if (this.email.hasError('minlength')) {
      return 'El correo debe tener al menos 5 caracteres';
    }
    return '';
  }

  getPasswordError(): string {
    if (this.password.hasError('required')) {
      return 'La contraseña es requerida';
    }
    if (this.password.hasError('minlength')) {
      const requiredLength = this.password.getError('minlength').requiredLength;
      return `La contraseña debe tener al menos ${requiredLength} caracteres`;
    }
    if (this.password.hasError('maxlength')) {
      const requiredLength = this.password.getError('maxlength').requiredLength;
      return `La contraseña no puede exceder ${requiredLength} caracteres`;
    }
    return '';
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    // Validar el formulario
    if (this.loginForm.invalid) {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (response: LoginResponse) => {
        this.isLoading = false;
        this.resetForm();
      },
      error: (error: any) => {
        this.errorMessage = error.error.message;
        this.isLoading = false;
      },
    });
  }

  // Método para resetear el formulario
  resetForm(): void {
    this.loginForm.reset();
    this.submitted = false;
    this.errorMessage = '';
  }
}

import { Component, inject, OnInit } from '@angular/core';
import { AuthService, User } from '../../auth/service/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private authService: AuthService = inject(AuthService);
  private fb: FormBuilder = inject(FormBuilder);
  user: User | null = null;

  profileForm!: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  submitted = false;
  isLoading = false;

  ngOnInit(): void {
    this.initForm();
    this.loadUser();
  }

  initForm(): void {
    this.profileForm = this.fb.group({
      password: ['', Validators.required]
    });
  }

  loadUser() {
    this.authService.getUser().subscribe({
      next: (data) => {
        this.user = data.data;
      },
      error: (error) => {
        this.errorMessage = error.message;
      },
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.profileForm.invalid) return;
    this.isLoading = true;
    this.authService.updatePassword(this.user?.email!, this.profileForm.value.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.loadUser();
        this.resetForm();
        this.successMessage = response.message;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message;
      },
    });
  }

  resetForm(): void {
    this.profileForm.reset();
    this.submitted = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeError(): void {
    this.errorMessage = '';
  }

  closeSuccess(): void {
    this.successMessage = '';
  }
}

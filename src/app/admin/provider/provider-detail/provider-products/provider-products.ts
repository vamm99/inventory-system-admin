import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProviderService } from '../../service/provider.service';

@Component({
  selector: 'app-providerdetail',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './provider-products.html',
  styleUrl: './provider-products.css',
})
export class ProviderProducts implements OnInit {
  private route = inject(ActivatedRoute);
  private providerService = inject(ProviderService);
  private fb: FormBuilder = inject(FormBuilder);
  private router = inject(Router);

  providerProducts: any = null;
  id!: number;
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.id = this.route.parent?.snapshot.params['id'];
  }

  


}
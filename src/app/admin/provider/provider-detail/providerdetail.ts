import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ProviderService } from '../service/provider.service';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-providerdetail',
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive],
  templateUrl: './providerdetail.html',
  styleUrl: './providerdetail.css',
})
export class Providerdetail implements OnInit {
  private route = inject(ActivatedRoute);
  private providerService = inject(ProviderService);

  provider: any = null;
  id!: number;
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
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error al cargar el proveedor';
        this.isLoading = false;
      }
    });
  }
}
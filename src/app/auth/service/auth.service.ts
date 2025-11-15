import { inject, Injectable } from '@angular/core';
import { API_URL } from '../../api/api';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

type UserResponse<T> = {
  status: number;
  message: string;
  data: T
}

export interface LoginResponse {
  status: number;
  message: string;
  data: {
    user: any;
    token: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = API_URL;
  private http = inject(HttpClient);
  private router = inject(Router);

  login(email: string, password: string): Observable<LoginResponse> {
    const response = this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, {
      email,
      password,
    });
    return response.pipe(
      tap((response) => {
        if (response.status === 200) {
          this.setToken(response.data.token);
          this.router.navigate(['/admin']);
        }
      })
    );
  }

  getUser(): Observable<UserResponse<User>> {
    const response = this.http.get<UserResponse<User>>(`${this.apiUrl}/auth/profile`);
    return response;
  }

  updatePassword(email: string, password: string): Observable<UserResponse<User>> {
    const response = this.http.post<UserResponse<User>>(`${this.apiUrl}/auth/update-password`, {
      email,
      password,
    });
    return response;
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  removeToken() {
    localStorage.removeItem('token');
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  logout() {
    this.removeToken();
    this.router.navigate(['/']);
  }
}

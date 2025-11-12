import { Injectable } from "@angular/core";
import { API_URL } from "../../../api/api";
import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { Observable } from "rxjs";

interface Pagination {
    limit: number;
    page: number;
    total: number;
    lastPage: number;
}

interface Provider {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProviderShare {
    name?: string;
    email?: string;
    phone?: string;
}

export type ProviderResponse<T> = {
    status: number;
    message: string;
    data: T;
    pagination?: Pagination;
}

@Injectable({
    providedIn: 'root'
})
export class ProviderService {
    private apiUrl = API_URL;
    private http = inject(HttpClient);

    createProvider(provider: Provider): Observable<ProviderResponse<Provider>> {
        const response = this.http.post<ProviderResponse<Provider>>(`${this.apiUrl}/provider`, provider);
        return response;
    }

    getAllProviders(page: number = 1, limit: number = 10): Observable<ProviderResponse<Provider[]>> {
        const response = this.http.get<ProviderResponse<Provider[]>>(`${this.apiUrl}/provider?page=${page}&limit=${limit}`);
        return response;
    }

    getProviderById(id: number): Observable<ProviderResponse<Provider>> {
        const response = this.http.get<ProviderResponse<Provider>>(`${this.apiUrl}/provider/${id}`);
        return response;
    }

    getProviderProducts(id: number, page: number = 1, limit: number = 10): Observable<ProviderResponse<Provider[]>> {
        const response = this.http.get<ProviderResponse<Provider[]>>(`${this.apiUrl}/provider/products/${id}?page=${page}&limit=${limit}`);
        return response;
    }

    updateProvider(id: number, provider: Provider): Observable<ProviderResponse<Provider>> {
        const response = this.http.put<ProviderResponse<Provider>>(`${this.apiUrl}/provider/${id}`, provider);
        return response;
    }

    deleteProvider(id: number): Observable<ProviderResponse<Provider>> {
        const response = this.http.delete<ProviderResponse<Provider>>(`${this.apiUrl}/provider/${id}`);
        return response;
    }

    shareProviderByName(providerShare: ProviderShare): Observable<ProviderResponse<Provider[]>> {
        const { name, email, phone } = providerShare;
        let url = `${this.apiUrl}/provider/share`;

        const params: string[] = [];
        if (name) params.push(`name=${encodeURIComponent(name)}`);
        if (email) params.push(`email=${encodeURIComponent(email)}`);
        if (phone) params.push(`phone=${encodeURIComponent(phone)}`);

        if (params.length > 0) {
            url += `?${params.join('&')}`;
        }

        return this.http.get<ProviderResponse<Provider[]>>(url);
    }
}

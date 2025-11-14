import { Injectable } from "@angular/core";
import { API_URL } from "../../../api/api";
import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { Observable } from "rxjs";

interface Kardex {
    id?: number;
    name?: string;
    productId?: number;
    quantity?: number;
    stock?: number;
    comment?: string;
    createdAt?: string;
    updatedAt?: string;
    product?: {
        id: number;
        name: string;
    }
}

interface Pagination {
    limit: number;
    page: number;
    total: number;
    lastPage: number;
}

interface Product {
    id: number;
    barcode: string;
    categoryId: number;
    providerId: number;
    name: string;
    description: string;
    coste: number;
    price: number;
    stock: number;
    unit: string;
    expiredAt: string;
    createdAt: string;
    updatedAt: string;
    category: {
        id: number;
        name: string;
    };
    provider: {
        id: number;
        name: string;
    };
}

export interface ProductShare {
    name?: string;
    barcode?: string;
}

interface ProductResponse<T> {
    status: number;
    message: string;
    data: T;
    pagination?: Pagination;
}

interface KardexResponse<T> {
    status: number;
    message: string;
    data?: T;
    pagination?: Pagination;
}

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private apiUrl = API_URL;
    private http = inject(HttpClient);

    createProduct(product: Product): Observable<ProductResponse<Product>> {
        const response = this.http.post<ProductResponse<Product>>(`${this.apiUrl}/product`, product);
        return response;
    }

    createKardex(product: Kardex[]): Observable<KardexResponse<void>> {
        const response = this.http.post<KardexResponse<void>>(`${this.apiUrl}/product/kardex`, product);
        return response;
    }

    getAllProducts(page: number = 1, limit: number = 10): Observable<ProductResponse<Product[]>> {
        const response = this.http.get<ProductResponse<Product[]>>(`${this.apiUrl}/product?page=${page}&limit=${limit}`);
        return response;
    }

    getProductById(id: number): Observable<ProductResponse<Product>> {
        const response = this.http.get<ProductResponse<Product>>(`${this.apiUrl}/product/${id}`);
        return response;
    }

    getProductByBarcode(barcode: string): Observable<ProductResponse<Product>> {
        const response = this.http.get<ProductResponse<Product>>(`${this.apiUrl}/product/barcode/${barcode}`);
        return response;
    }

    updateProduct(id: number, product: Product): Observable<ProductResponse<Product>> {
        const response = this.http.put<ProductResponse<Product>>(`${this.apiUrl}/product/${id}`, product);
        return response;
    }

    deleteProduct(id: number): Observable<ProductResponse<Product>> {
        const response = this.http.delete<ProductResponse<Product>>(`${this.apiUrl}/product/${id}`);
        return response;
    }

    shareProductByName(productShare: ProductShare): Observable<ProductResponse<Product[]>> {
        const { name, barcode } = productShare;
        let url = `${this.apiUrl}/product/share`;

        const params: string[] = [];
        if (name) params.push(`name=${encodeURIComponent(name)}`);
        if (barcode) params.push(`barcode=${encodeURIComponent(barcode)}`);

        if (params.length > 0) {
            url += `?${params.join('&')}`;
        }

        return this.http.get<ProductResponse<Product[]>>(url);
    }
}

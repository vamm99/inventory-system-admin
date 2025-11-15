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

export interface Product {
    id: number;
    name: string;
    barcode: string;
    stock: number;
    unit: string;
    coste: number;
    price: number;
    category: {
        name: string;
    };
    provider: {
        name: string;
    };
    totalCost: number;
    totalPrice: number;
}

interface InventoryResponse<T> {
    status: number;
    message: string;
    data: T;
    pagination?: Pagination;
}

@Injectable({
    providedIn: 'root'
})
export class InventoryService {
    private apiUrl = API_URL;
    private http = inject(HttpClient);

    inventoryOfProducts(page: number = 1, limit: number = 10): Observable<InventoryResponse<Product[]>> {
        const response = this.http.get<InventoryResponse<Product[]>>(`${this.apiUrl}/inventory?page=${page}&limit=${limit}`);
        return response;
    }

    generateExcelReportForProducts(): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/inventory/excel`, { responseType: 'blob' });
    }
}

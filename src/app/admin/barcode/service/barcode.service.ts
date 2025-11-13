import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { API_URL } from "../../../api/api";
import { inject } from "@angular/core";
import { Observable } from "rxjs";

interface Pagination {
    limit: number;
    page: number;
    total: number;
    lastPage: number;
}

interface Category {
    id: number;
    name: string;
}

interface Provider {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    barcode: string;
    description?: string;
    price: number;
    coste?: number;
    stock: number;
    unit?: string;
    expiredAt?: string;
    category: Category;
    provider: Provider;
}

interface Barcode {
    id: number;
    barcode: string;
    imageUrl: string;
    isUsed: boolean;
    product: Product | null;
    createdAt: string;
    updatedAt: string | null;
}

export interface BarcodeShare {
    code: string;
}

interface BarcodeResponse<T> {
    status: number;
    message: string;
    data: T;
    pagination?: Pagination;
}

@Injectable({
    providedIn: 'root'
})
export class BarcodeService {
    private apiUrl = API_URL;
    private http = inject(HttpClient);

    /**
     * Genera múltiples códigos de barras
     * @param count - Cantidad de códigos a generar
     */
    generateBarcode(count: number): Observable<BarcodeResponse<Barcode[]>> {
        return this.http.get<BarcodeResponse<Barcode[]>>(
            `${this.apiUrl}/barcode/generate/many?count=${count}`
        );
    }

    /**
     * Obtiene todos los códigos de barras con paginación
     * @param page - Número de página (default: 1)
     * @param limit - Cantidad de registros por página (default: 10)
     */
    getAllBarcodes(page: number = 1, limit: number = 10): Observable<BarcodeResponse<Barcode[]>> {
        return this.http.get<BarcodeResponse<Barcode[]>>(
            `${this.apiUrl}/barcode?page=${page}&limit=${limit}`
        );
    }

    /**
     * Busca un código de barras específico por su código
     * @param barcodeShare - Objeto con el código a buscar
     */
    shareBarcodeByName(barcodeShare: BarcodeShare): Observable<BarcodeResponse<Barcode>> {
        return this.http.get<BarcodeResponse<Barcode>>(
            `${this.apiUrl}/barcode/share?code=${barcodeShare.code}`
        );
    }

    /**
     * Obtiene un código de barras por su código
     * @param code - Código de barras a buscar
     */
    getBarcodeByCode(code: string): Observable<BarcodeResponse<Barcode>> {
        return this.http.get<BarcodeResponse<Barcode>>(
            `${this.apiUrl}/barcode/${code}`
        );
    }

    /**
     * Filtra códigos de barras por estado de uso (usados o disponibles)
     * @param isUsed - true para usados, false para disponibles
     * @param page - Número de página (default: 1)
     * @param limit - Cantidad de registros por página (default: 10)
     */
    getBarcodesByUsageStatus(
        isUsed: boolean,
        page: number = 1,
        limit: number = 10
    ): Observable<BarcodeResponse<Barcode[]>> {
        return this.http.get<BarcodeResponse<Barcode[]>>(
            `${this.apiUrl}/barcode/filter?isUsed=${isUsed}&page=${page}&limit=${limit}`
        );
    }

    /**
     * Obtiene solo los códigos de barras disponibles (no usados)
     * @param page - Número de página (default: 1)
     * @param limit - Cantidad de registros por página (default: 10)
     */
    getAvailableBarcodes(page: number = 1, limit: number = 10): Observable<BarcodeResponse<Barcode[]>> {
        return this.getBarcodesByUsageStatus(false, page, limit);
    }

    /**
     * Obtiene solo los códigos de barras usados
     * @param page - Número de página (default: 1)
     * @param limit - Cantidad de registros por página (default: 10)
     */
    getUsedBarcodes(page: number = 1, limit: number = 10): Observable<BarcodeResponse<Barcode[]>> {
        return this.getBarcodesByUsageStatus(true, page, limit);
    }

    /**
     * Generar PDF de códigos de barras
     * @param filterStatus - 'all' para todos, 'used' para usados, 'available' para disponibles
     * @returns Observable con el archivo PDF como Blob
     */
    generateBarcodePDF(filterStatus: 'all' | 'used' | 'available'): Observable<Blob> {
        let url = `${this.apiUrl}/barcode/pdf`;
        
        // Agregar query param según el filtro
        if (filterStatus === 'used') {
            url += '?isUsed=true';
        } else if (filterStatus === 'available') {
            url += '?isUsed=false';
        }
        // Si es 'all', no se agrega query param

        return this.http.get(url, { 
            responseType: 'blob' 
        });
    }
}
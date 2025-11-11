import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { API_URL } from "../../../api/api";
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
    createdAt: string;
    updatedAt: string;
}

export type CategoryResponse<T> = {
    status: number;
    message: string;
    data: T;
    pagination?: Pagination;
}

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    private apiUrl = API_URL;
    private http = inject(HttpClient);

    createCategory(name: string): Observable<CategoryResponse<Category>> {
        const response = this.http.post<CategoryResponse<Category>>(`${this.apiUrl}/category`, { name });
        return response;
    }

    getAllCategories(page: number = 1, limit: number = 10): Observable<CategoryResponse<Category[]>> {
        const response = this.http.get<CategoryResponse<Category[]>>(`${this.apiUrl}/category?page=${page}&limit=${limit}`);
        return response;
    }

    getCategoryById(id: number): Observable<CategoryResponse<Category>> {
        const response = this.http.get<CategoryResponse<Category>>(`${this.apiUrl}/category/${id}`);
        return response;
    }

    updateCategory(id: number, name: string): Observable<CategoryResponse<Category>> {
        const response = this.http.put<CategoryResponse<Category>>(`${this.apiUrl}/category/${id}`, { name });
        return response;
    }

    shareCategoryByName(name: string): Observable<CategoryResponse<Category[]>> {
        const response = this.http.get<CategoryResponse<Category[]>>(`${this.apiUrl}/category/share?name=${name}`);
        return response;
    }
}


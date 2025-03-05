import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/categories.interface';
import { AuthToken } from '../../functions/authToken.function';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private apiUrl = 'http://localhost:3000/api/categorias';

  constructor(private http:HttpClient) { }
  addCategory(category: Category): Observable<Category> {
    const authToken = new AuthToken();
    return this.http.post<Category>(this.apiUrl, category, { headers: authToken.getAuthHeaders()});
  }

  getAllCategories(): Observable<Category[]> {
    const authToken = new AuthToken();
    return this.http.get<Category[]>(this.apiUrl, { headers: authToken.getAuthHeaders()});
  }

  deleteCategory(category: Category): Observable<Category> {
    const authToken = new AuthToken();
    return this.http.delete<Category>(`${this.apiUrl}/${category.id}`, { headers: authToken.getAuthHeaders()});
  }

  editCategory(category: Category): Observable<Category> {
    const authToken = new AuthToken();
    return this.http.put<Category>(`${this.apiUrl}/${category.id}`, category, { headers: authToken.getAuthHeaders()});
  }
  getOneCategory(id:string): Observable<Category> {
    const authToken = new AuthToken();
    return this.http.get<Category>(`${this.apiUrl}/${id}`, { headers: authToken.getAuthHeaders()});
  }

  getOneCategoryByName(name:string, excludeCategoryId?: string): Observable<Category> {
    const authToken = new AuthToken();
    const params = new HttpParams().set('excludeCategoryId', excludeCategoryId || '');
    return this.http.get<Category>(`${this.apiUrl}/byname/${name}`, {params, headers: authToken.getAuthHeaders()});
  }
}


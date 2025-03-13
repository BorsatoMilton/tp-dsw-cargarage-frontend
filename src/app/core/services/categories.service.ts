import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/categories.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private apiUrl = environment.SERVER_URL + '/api/categorias';

  constructor(private http: HttpClient) {}
  addCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category);
  }

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  deleteCategory(category: Category): Observable<Category> {
    return this.http.delete<Category>(`${this.apiUrl}/${category.id}`);
  }

  editCategory(category: Category): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${category.id}`, category);
  }
  getOneCategory(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  getOneCategoryByName(
    name: string,
    excludeCategoryId?: string
  ): Observable<Category> {
    const params = new HttpParams().set(
      'excludeCategoryId',
      excludeCategoryId || ''
    );
    return this.http.get<Category>(`${this.apiUrl}/byname/${name}`, { params });
  }
}

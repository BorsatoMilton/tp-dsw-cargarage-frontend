import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Brand } from '../models/brands.interfaces';
import { AuthToken } from '../../functions/authToken.function';

@Injectable({
  providedIn: 'root'
})
export class BrandsService {
  private apiUrl = 'http://localhost:3000/api/marcas';

  constructor(private http:HttpClient) { }
  addBrand(brand: Brand): Observable<Brand> {
    const authToken = new AuthToken(); 
    return this.http.post<Brand>(this.apiUrl, brand, { headers: authToken.getAuthHeaders()});
  }
  deleteBrand(brand: Brand): Observable<Brand> {
    const authToken = new AuthToken();
    return this.http.delete<Brand>(`${this.apiUrl}/${brand.id}`, { headers: authToken.getAuthHeaders()});
  }
  editBrand(brand: Brand): Observable<Brand> {
    const authToken = new AuthToken();
    return this.http.put<Brand>(`${this.apiUrl}/${brand.id}`, brand, { headers: authToken.getAuthHeaders()});
  }
  getAllBrand(): Observable<Brand[]> {
    const authToken = new AuthToken();
    return this.http.get<Brand[]>(this.apiUrl, { headers: authToken.getAuthHeaders()});
  }
  getOneBrand(id:string): Observable<Brand> {
    const authToken = new AuthToken();
    return this.http.get<Brand>(`${this.apiUrl}/${id}`, { headers: authToken.getAuthHeaders()});
  }
  getOneBrandByName(name: string, excludeBrandId?: string): Observable<Brand> {
    const authToken = new AuthToken();
    const params = new HttpParams().set('excludeBrandId', excludeBrandId || '');
    return this.http.get<Brand>(`${this.apiUrl}/byname/${name}`, { params, headers: authToken.getAuthHeaders() } );
  }
}

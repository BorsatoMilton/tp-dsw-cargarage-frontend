import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Rent } from '../models/rent.interface';
import { User } from '../models/user.interface';
import { AuthToken } from '../../functions/authToken.function';

@Injectable({
  providedIn: 'root'
})
export class RentsService {
  private url = 'http://localhost:3000/api/alquiler';

  constructor(private http: HttpClient) { }
  getAllRents(): Observable<Rent[]> {
    const authToken = new AuthToken();
    return this.http.get<Rent[]>(this.url, { headers: authToken.getAuthHeaders() });
  }

  getRentsByVehicle(id: string): Observable<Rent[]> {
    const authToken = new AuthToken();
    return this.http.get<Rent[]>(`${this.url}/vehiculo/${id}`, { headers: authToken.getAuthHeaders() });
  }

  getRentsByUser(id: string): Observable<Rent[]> {
    const authToken = new AuthToken();
    return this.http.get<Rent[]>(`${this.url}/usuario/${id}`, { headers: authToken.getAuthHeaders() });
  }

  getOneRent(id: string): Observable<Rent> {
    const authToken = new AuthToken();
    return this.http.get<Rent>(`${this.url}/${id}`, { headers: authToken.getAuthHeaders() });
  }

  addRent(rent:Rent): Observable<Rent> {
    const authToken = new AuthToken();
    return this.http.post<Rent>(this.url, rent, { headers: authToken.getAuthHeaders() });
  }

  confirmRent(idRent: string): Observable<Rent> {
    const authToken = new AuthToken();
    return this.http.patch<Rent>(`${this.url}/confirmarAlquiler/${idRent}`, {}, { headers: authToken.getAuthHeaders() });
  }

  deleteRent(rent: Rent): Observable<Rent> {
    const authToken = new AuthToken();
    return this.http.delete<Rent>(`${this.url}/${rent.id}`, { headers: authToken.getAuthHeaders() });
  }

  cancelRent(rent: Rent): Observable<Rent> {
    const authToken = new AuthToken();
    return this.http.put<Rent>(`${this.url}/cancelar/${rent.id}`, rent, { headers: authToken.getAuthHeaders() });
  }

  confirmRentMail(usuario: User,  idAlquiler: string): Observable<Rent> {
    const authToken = new AuthToken();
    return this.http.post<Rent>(`${this.url}/confirmarAlquilerMail/${idAlquiler}`,  usuario, { headers: authToken.getAuthHeaders() });
  }

  createPaymentPreference(items: any): Observable<any> {
    const authToken = new AuthToken();
    const authHeaders = authToken.getAuthHeaders();
    
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set(authHeaders.keys()[0], authHeaders.get(authHeaders.keys()[0]) || '');
  
    return this.http.post<any>(
      'http://localhost:3000/api/mercadopago/create-preference', 
      items, 
      { headers }
    );
  }
}

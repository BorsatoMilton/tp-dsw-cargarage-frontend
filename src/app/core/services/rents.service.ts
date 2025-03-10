import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rent } from '../models/rent.interface';
import { User } from '../models/user.interface';
import { AuthToken } from '../functions/authToken.function';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RentsService {
  private url = environment.SERVER_URL+'/api/alquiler';

  constructor(private http: HttpClient) { }
  getAllRents(): Observable<Rent[]> {
    return this.http.get<Rent[]>(this.url);
  }

  getRentsByVehicle(id: string): Observable<Rent[]> {
    return this.http.get<Rent[]>(`${this.url}/vehiculo/${id}`);
  }

  getRentsByUser(id: string): Observable<Rent[]> {
    return this.http.get<Rent[]>(`${this.url}/usuario/${id}`);
  }

  getOneRent(id: string): Observable<Rent> {
    return this.http.get<Rent>(`${this.url}/${id}`);
  }

  addRent(rent:Rent): Observable<Rent> {
    return this.http.post<Rent>(this.url, rent);
  }

  confirmRent(idRent: string): Observable<Rent> {
    return this.http.patch<Rent>(`${this.url}/confirmarAlquiler/${idRent}`, {});
  }

  deleteRent(rent: Rent): Observable<Rent> {
    return this.http.delete<Rent>(`${this.url}/${rent.id}`)
  }

  cancelRent(rent: Rent): Observable<Rent> {
    return this.http.put<Rent>(`${this.url}/cancelar/${rent.id}`, rent);
  }

  confirmRentMail(usuario: User,  idAlquiler: string): Observable<Rent> {
    return this.http.post<Rent>(`${this.url}/confirmarAlquilerMail/${idAlquiler}`,  usuario);
  }

  createPaymentPreference(items: any): Observable<any> {
    const authToken = new AuthToken();
    const authHeaders = authToken.getAuthHeaders();
    
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set(authHeaders.keys()[0], authHeaders.get(authHeaders.keys()[0]) || '');
  
    return this.http.post<any>(
      environment.SERVER_URL+'/api/mercadopago/create-preference', 
      items, 
      { headers }
    );
  }
}

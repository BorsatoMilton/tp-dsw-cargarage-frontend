import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Compra } from '../models/compra.interfaces';
import { AuthToken } from '../../functions/authToken.function';

@Injectable({
  providedIn: 'root'
})
export class CompraService {
  private apiUrl = 'http://localhost:3000/api/compras';
  
  
  
  constructor(private http:HttpClient) { }
  addCompra(idComprador: string, idVehiculo: string): Observable<Compra> {
    const authToken = new AuthToken();
    return this.http.post<Compra>(this.apiUrl, {vehiculo: idVehiculo, comprador: idComprador, fechaCancelacion: null}, { headers: authToken.getAuthHeaders()});
  }
  
  getAllCompra(): Observable<Compra[]> {
    const authToken = new AuthToken();
    return this.http.get<Compra[]>(this.apiUrl, { headers: authToken.getAuthHeaders()});
  }

  getAllCompraByUser(userId: string): Observable<Compra[]> {
    const authToken = new AuthToken();
    return this.http.get<Compra[]>(`${this.apiUrl}/byuser/${userId}`, { headers: authToken.getAuthHeaders()});
  }

  getOneCompra(id: string): Observable<Compra> {
    const authToken = new AuthToken();
    return this.http.get<Compra>(`${this.apiUrl}/${id}`, { headers: authToken.getAuthHeaders()});
  }

  getOneCompraByVehiculo(idVehiculo: string): Observable<Compra> {
    const authToken = new AuthToken();
    return this.http.get<Compra>(`${this.apiUrl}/byvehiculo/${idVehiculo}`, { headers: authToken.getAuthHeaders()});
  }

  confirmarCompra(idCompra: string): Observable<Compra> {
    const authToken = new AuthToken();
    return this.http.patch<Compra>(`${this.apiUrl}/confirmarCompra/${idCompra}`, {}, { headers: authToken.getAuthHeaders()});
  }

  cancelarCompra(idCompra: string): Observable<Compra> {
    const authToken = new AuthToken();
    return this.http.patch<Compra>(`${this.apiUrl}/cancelarCompra/${idCompra}`, {}, { headers: authToken.getAuthHeaders()});
  }

  confirmarCompraAviso(idCompra: string): Observable<Compra> {
    const authToken = new AuthToken();
    return this.http.post<Compra>(`${this.apiUrl}/confirmarCompraAviso/${idCompra}`, {}, { headers: authToken.getAuthHeaders()});
  }

  avisoCompraExitosa(mail:string, idVehiculo: string): Observable<Compra> {
    const authToken = new AuthToken();
    return this.http.post<Compra>(`${this.apiUrl}/avisoCompraExitosa/${mail}`, {idVehiculo: idVehiculo}, { headers: authToken.getAuthHeaders()});
  }

  borrarCompra(idCompra: string): Observable<Compra> {
    const authToken = new AuthToken();
    return this.http.delete<Compra>(`${this.apiUrl}/${idCompra}`, { headers: authToken.getAuthHeaders()});
  }

}
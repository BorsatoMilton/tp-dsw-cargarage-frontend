import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Compra } from '../models/compra.interfaces';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CompraService {
  private apiUrl = environment.SERVER_URL + '/api/compras';

  constructor(private http: HttpClient) {}
  addCompra(idComprador: string, idVehiculo: string): Observable<Compra> {
    return this.http.post<Compra>(this.apiUrl, {
      vehiculo: idVehiculo,
      comprador: idComprador,
      fechaCancelacion: null,
    });
  }

  getAllCompra(): Observable<Compra[]> {
    return this.http.get<Compra[]>(this.apiUrl);
  }

  getAllCompraByUser(userId: string): Observable<Compra[]> {
    return this.http.get<Compra[]>(`${this.apiUrl}/byuser/${userId}`);
  }

  getOneCompra(id: string): Observable<Compra> {
    return this.http.get<Compra>(`${this.apiUrl}/${id}`);
  }

  getOneCompraByVehiculo(idVehiculo: string): Observable<Compra> {
    return this.http.get<Compra>(`${this.apiUrl}/byvehiculo/${idVehiculo}`);
  }

  confirmarCompra(idCompra: string): Observable<Compra> {
    return this.http.patch<Compra>(
      `${this.apiUrl}/confirmarCompra/${idCompra}`,
      {}
    );
  }

  cancelarCompra(idCompra: string): Observable<Compra> {
    return this.http.patch<Compra>(
      `${this.apiUrl}/cancelarCompra/${idCompra}`,
      {}
    );
  }

  confirmarCompraAviso(idCompra: string): Observable<Compra> {
    return this.http.post<Compra>(
      `${this.apiUrl}/confirmarMailCompra/${idCompra}`,
      {}
    );
  }

  avisoCompraExitosa(mail: string, idVehiculo: string): Observable<Compra> {
    return this.http.post<Compra>(`${this.apiUrl}/avisoCompraExitosa/${mail}`, {
      idVehiculo: idVehiculo,
    });
  }

  borrarCompra(idCompra: string): Observable<Compra> {
    return this.http.delete<Compra>(`${this.apiUrl}/${idCompra}`);
  }
}

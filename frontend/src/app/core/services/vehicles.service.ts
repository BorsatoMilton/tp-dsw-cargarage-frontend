import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vehicle } from '../models/vehicles.interface';
import { map } from 'rxjs/operators';
import { AuthToken } from '../../functions/authToken.function';

@Injectable({
  providedIn: 'root'
})
export class VehiclesService {
  private apiUrl = 'http://localhost:3000/api/vehiculos';

  constructor(private http:HttpClient) { }
  addVehicle(formData: FormData): Observable<Vehicle> {
    const authToken = new AuthToken();
    return this.http.post<Vehicle>(this.apiUrl, formData, { headers: authToken.getAuthHeaders()});
  }
  deleteVehicle(vehicle: Vehicle): Observable<Vehicle> {
    const authToken = new AuthToken();
    return this.http.patch<Vehicle>(`${this.apiUrl}/${vehicle.id}`, {}, { headers: authToken.getAuthHeaders()});
  }
  editVehicle(vehicle: Vehicle): Observable<Vehicle> {
    const authToken = new AuthToken();
    return this.http.put<Vehicle>(`${this.apiUrl}/${vehicle.id}`, vehicle, { headers: authToken.getAuthHeaders()});
  }
  getAllVehicle(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(this.apiUrl);
  }

  getAllVehicleByUser(id: string): Observable<Vehicle[]> {
    const authToken = new AuthToken();
    return this.http.get<Vehicle[]>(`${this.apiUrl}/user/${id}`, { headers: authToken.getAuthHeaders() });
  }

  getOneVehicle(id: string): Observable<Vehicle> {
    const authToken = new AuthToken();
    return this.http.get<Vehicle>(`${this.apiUrl}/${id}`, { headers: authToken.getAuthHeaders() });
  }

  getVehiclesByCategory(categoryId: string): Observable<Vehicle[]> {
    const authToken = new AuthToken();
    return this.http.get<Vehicle[]>(`${this.apiUrl}/categoria/${categoryId}`, { headers: authToken.getAuthHeaders() });
  }
  
}

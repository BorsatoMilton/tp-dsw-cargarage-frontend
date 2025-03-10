import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vehicle } from '../models/vehicles.interface';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class VehiclesService {
  private apiUrl = environment.SERVER_URL+'/api/vehiculos';

  constructor(private http:HttpClient) { }
  addVehicle(formData: FormData): Observable<Vehicle> {
    return this.http.post<Vehicle>(this.apiUrl, formData);
  }
  deleteVehicle(vehicle: Vehicle): Observable<Vehicle> {
    return this.http.patch<Vehicle>(`${this.apiUrl}/${vehicle.id}`, {});
  }
  editVehicle(vehicle: Vehicle): Observable<Vehicle> {
    return this.http.put<Vehicle>(`${this.apiUrl}/${vehicle.id}`, vehicle);
  }
  getAllVehicle(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(this.apiUrl);
  }

  getAllVehicleByUser(id: string): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiUrl}/user/${id}`);
  }

  getOneVehicle(id: string): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.apiUrl}/${id}`);
  }

  getVehiclesByCategory(categoryId: string): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiUrl}/categoria/${categoryId}`);
  }
  
}

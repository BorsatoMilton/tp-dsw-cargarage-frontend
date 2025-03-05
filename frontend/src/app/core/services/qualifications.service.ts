import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Qualification } from '../models/qualification.inteface';
import { Observable } from 'rxjs';
import { AuthToken } from '../../functions/authToken.function';


@Injectable({
  providedIn: 'root'
})
export class QualificationsService {

  constructor(private http: HttpClient) { }

  private apiUrl = 'http://localhost:3000/api/calificaciones';

  getQualificationsByUserId(userId: string): Observable<Qualification[]> {
    const authToken = new AuthToken();
    return this.http.get<Qualification[]>(`${this.apiUrl}/${userId}`, { headers: authToken.getAuthHeaders() });
  }

  createQualification(qualification: Qualification) {
    const authToken = new AuthToken();
    return this.http.post<Qualification>(this.apiUrl, qualification, { headers: authToken.getAuthHeaders() });
  }

  checkQualificationExists(userId: string, objectId: string) {
    const authToken = new AuthToken();
    return this.http.get<Qualification>(`${this.apiUrl}/${userId}/${objectId}`, { headers: authToken.getAuthHeaders() });
  }
}

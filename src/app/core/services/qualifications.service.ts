import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Qualification } from '../models/qualification.inteface';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QualificationsService {

  constructor(private http: HttpClient) { }

  private apiUrl = environment.SERVER_URL+'/api/calificaciones';

  getQualificationsByUserId(userId: string): Observable<Qualification[]> {
    return this.http.get<Qualification[]>(`${this.apiUrl}/${userId}`);
  }

  createQualification(qualification: Qualification) {
    return this.http.post<Qualification>(this.apiUrl, qualification);
  }

  checkQualificationExists(userId: string, objectId: string) {
    return this.http.get<Qualification>(`${this.apiUrl}/${userId}/${objectId}`);
  }
}

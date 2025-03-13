import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecoveryPassword } from '../models/recovery-password';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PasswordRecoveryService {
  private apiUrl = environment.SERVER_URL + '/api/recuperacion';

  constructor(private http: HttpClient) {}

  sendRecoveryEmail(email: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { destinatario: email });
  }

  validateToken(token: string): Observable<RecoveryPassword> {
    return this.http.get<RecoveryPassword>(`${this.apiUrl}/validate/${token}`);
  }
}

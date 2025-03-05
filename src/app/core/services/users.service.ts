import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.interface';
import { AuthToken } from '../../functions/authToken.function';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private apiUrl = 'http://localhost:3000/api/usuarios';

  constructor(private http: HttpClient) {}

  addUser(data: FormData): Observable<User> {
    return this.http.post<User>(this.apiUrl, data);
  }
  deleteUser(user: User): Observable<User> {
    const authToken = new AuthToken();
    return this.http.delete<User>(`${this.apiUrl}/${user.id}`, { headers: authToken.getAuthHeaders() });
  }
  editUser(user: User): Observable<User> {
    const { clave, ...userWithoutPassword } = user;
    const authToken = new AuthToken();
    return this.http.put<User>(`${this.apiUrl}/${user.id}`, userWithoutPassword, { headers: authToken.getAuthHeaders() });
  }

  getAllUser(): Observable<User[]> {
    const authToken = new AuthToken();
    return this.http.get<User[]>(this.apiUrl, { headers: authToken.getAuthHeaders() });
  }

  getOneUserByEmailOrUsername(usuario: string, mail: string, excludeUserId?: string): Observable<User | null> {
    const params = new HttpParams().set('excludeUserId', excludeUserId || '');
    return this.http.get<User>(`${this.apiUrl}/${usuario}/${mail}`, { params });
  }

  getOneUserById(id: string): Observable<User> {
    const authToken = new AuthToken();
    return this.http.get<User>(`${this.apiUrl}/${id}`, { headers: authToken.getAuthHeaders() });
  }

  changePassword(id: string, data: any): Observable<User> {
    const authToken = new AuthToken();
    return this.http.patch<User>(`${this.apiUrl}/${id}`, data, { headers: authToken.getAuthHeaders() });
  }

  validatePassword(id: string, password: string): Observable<boolean> {
    const authToken = new AuthToken();
    return this.http.post<boolean>(`${this.apiUrl}/validate/${id}`, {
      password,
    }, { headers: authToken.getAuthHeaders()});
  }

  checkUsername(username: string): Observable<boolean> {
    const authToken = new AuthToken();
    return this.http.get<boolean>(`${this.apiUrl}/checkusername/${username}`, { headers: authToken.getAuthHeaders() });
  }

  checkEmail(email: string): Observable<boolean> {
    const authToken = new AuthToken();
    return this.http.get<boolean>(`${this.apiUrl}/checkemail/${email}`, { headers: authToken.getAuthHeaders() });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset`, { token, newPassword });
  }
}

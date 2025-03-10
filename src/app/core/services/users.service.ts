import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.interface';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private apiUrl = environment.SERVER_URL+'/api/usuarios';

  constructor(private http: HttpClient) {}

  addUser(data: FormData): Observable<User> {
    return this.http.post<User>(this.apiUrl, data);
  }
  deleteUser(user: User): Observable<User> {
    return this.http.delete<User>(`${this.apiUrl}/${user.id}`);
  }
  editUser(user: User): Observable<User> {
    const { clave, ...userWithoutPassword } = user;
    return this.http.put<User>(`${this.apiUrl}/${user.id}`, userWithoutPassword);
  }

  getAllUser(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getOneUserByEmailOrUsername(usuario: string, mail: string, excludeUserId?: string): Observable<User | null> {
    const params = new HttpParams().set('excludeUserId', excludeUserId || '');
    return this.http.get<User>(`${this.apiUrl}/${usuario}/${mail}`, { params });
  }

  getOneUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  changePassword(id: string, data: any): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}`, data);
  }

  validatePassword(id: string, password: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/validate/${id}`, {
      password,
    });
  }

  checkUsername(username: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/checkusername/${username}`);
  }

  checkEmail(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/checkemail/${email}`);
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset`, { token, newPassword });
  }
}

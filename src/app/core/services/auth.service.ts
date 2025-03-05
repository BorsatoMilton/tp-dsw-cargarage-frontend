import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User } from '../models/user.interface';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public apiUrl = 'http://localhost:3000/api/usuarios';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<any>(this.getCurrentUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
   }

   login(user: string, password: string): Observable<User> {
    return this.http.post<{ user: User, token: string }>(`${this.apiUrl}/login`, { user, password }).pipe(
      map((response) => {
        const { user, token } = response;
        this.setUserSession(user, token);
        return user;
      })
    );
  }
  
  setUserSession(usuario: User, token: string): void {
    localStorage.setItem('user', JSON.stringify(usuario));
    localStorage.setItem('token', token);
    this.isAuthenticatedSubject.next(true); 
    this.currentUserSubject.next(usuario); 
  }
  
  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null); 
    this.router.navigate(['/auth/login']); 
  }
  
  isAuthenticated(): boolean {
    return localStorage.getItem('user') !== null;
  }
  
  getCurrentUser(): User | null {
    const userString = localStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
  }
  
  getCurrentToken(): string  {
    const tokenString = localStorage.getItem('token');
    return tokenString!;
  }  
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Faq } from '../models/faq.interface';
import { AuthToken } from '../../functions/authToken.function';

@Injectable({
  providedIn: 'root'
})
export class FaqService {
  apiUrl = 'http://localhost:3000/api/faq';

  constructor(private http: HttpClient) { }

  findAllFaqs(): Observable<Faq[]> {
    return this.http.get<Faq[]>(this.apiUrl);
  }

  addFaq(faq: Faq): Observable<Faq> {
    const authToken = new AuthToken();
    return this.http.post<Faq>(this.apiUrl, faq, { headers: authToken.getAuthHeaders() });
  }

  updateFaq(faq: Faq): Observable<Faq> {
    const authToken = new AuthToken();
    return this.http.put<Faq>(`${this.apiUrl}/${faq.id}`, faq, { headers: authToken.getAuthHeaders() });
  }

  deleteFaq(id: number): Observable<Faq> {
    const authToken = new AuthToken();
    return this.http.delete<Faq>(`${this.apiUrl}/${id}`, { headers: authToken.getAuthHeaders() });
  }

}

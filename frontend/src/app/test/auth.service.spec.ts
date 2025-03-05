import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../core/services/auth.service';
import { provideHttpClient } from '@angular/common/http';

describe('AuthService', () => {
    let service: AuthService;
    let httpMock: HttpTestingController;
  
    beforeEach(() => {

        localStorage.clear();
        localStorage.setItem('user', JSON.stringify({
          id: '1',
          usuario: 'testuser',
          rol: 'ADMIN'
        }));
        

      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [AuthService]
      });
      service = TestBed.inject(AuthService);
      httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
        localStorage.clear()
      });

    it('debería hacer login y guardar el token', () => {
      const mockResponse = { token: 'fake-jwt-token' };

      service.login('user', 'pass').subscribe(() => {
        expect(localStorage.getItem('token')).toBe('fake-jwt-token');
      });
  
  
      const req = httpMock.expectOne(`${service['apiUrl']}/login`);
        expect(req.request.method).toBe('POST');
        req.flush(mockResponse);
    })

    it('debería eliminar el token en logout', () => {
      localStorage.setItem('token', 'fake-token');
      service.logout();
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });
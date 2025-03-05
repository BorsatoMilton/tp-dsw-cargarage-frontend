import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { LoginComponent } from '../components/auth/login/login.component';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../core/services/auth.service';
import { UniversalAlertComponent } from '../shared/components/alerts/universal-alert/universal-alert.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, RouterTestingModule, HttpClientTestingModule],
      providers: [
        AuthService,
        {
          provide: UniversalAlertComponent,
          useValue: {
            showAlert: () => {},
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('Se debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('El formulario debe ser inválido cuando está vacío o incompleto', () => {
    const username = 'testuser';
    component.loginForm.setValue({ user: username, password: '' });
    expect(component.loginForm.valid).toBeFalsy();
  });

  it('El formulario debe ser válido cuando está completo', () => {
    const username = 'testuser';
    const password = 'password';
    component.loginForm.setValue({ user: username, password: password });
    expect(component.loginForm.valid).toBeTruthy();
  });

  it('El formulario debe ser inválido cuando la contraseña tiene menos de 6 caracteres', () => {
    const username = 'testuser';
    const password = 'pass';
    component.loginForm.setValue({ user: username, password: password });
    expect(component.loginForm.valid).toBeFalsy();
  });

  it('El formulario debe actualizar su isLoggedIn a true cuando se loguea correctamente', fakeAsync(() => {
    const mockResponse = {
      user: { id: 1, usuario: 'admin', rol: 'ADMIN' },
      token: 'fake-jwt-token',
    };

    const username = 'admin';
    const password = '123456';

    component.loginForm.setValue({ user: username, password: password });

    component.loginForm.markAllAsTouched();
    component.loginForm.updateValueAndValidity();
    fixture.detectChanges();

    expect(component.loginForm.valid).toBeTrue();

    component.login();

    const req = httpTestingController.expectOne({
      method: 'POST',
      url: 'http://localhost:3000/api/usuarios/login',
    });

    req.flush(mockResponse);

    tick();

    expect(component.isLoggedIn).toBeTrue();
  }));

  it('Debería mostrar alerta si el usuario no existe', fakeAsync(() => {
    component.loginForm.setValue({ user: 'usuarioFalso', password: '123456' });
    component.loginForm.markAllAsTouched();
    fixture.detectChanges();

    spyOn(component.alertComponent, 'showAlert');

    component.login();

    const req = httpTestingController.expectOne(
      'http://localhost:3000/api/usuarios/login'
    );

    req.flush('Usuario no encontrado', {
      status: 404,
      statusText: 'Not Found',
    });

    tick();

    expect(component.alertComponent.showAlert).toHaveBeenCalledWith(
      'Usuario no encontrado',
      'error'
    );
    expect(component.loginForm.value).toEqual({ user: null, password: null });
  }));

  it('Debería mostrar alerta si la contraseña es incorrecta', fakeAsync(() => {
    component.loginForm.setValue({ user: 'admin', password: 'claveErronea' });
    component.loginForm.markAllAsTouched();
    fixture.detectChanges();

    spyOn(component.alertComponent, 'showAlert');

    component.login();

    const req = httpTestingController.expectOne(
      'http://localhost:3000/api/usuarios/login'
    );
    req.flush('Contraseña incorrecta', {
      status: 401,
      statusText: 'Unauthorized',
    });

    tick();

    expect(component.alertComponent.showAlert).toHaveBeenCalledWith(
      'Contraseña incorrecta',
      'error'
    );
  }));

});

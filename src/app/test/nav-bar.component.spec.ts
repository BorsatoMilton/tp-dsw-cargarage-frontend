import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NavBarComponent } from '../shared/components/nav-bar/nav-bar.component';
import { AuthService } from '../core/services/auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { User } from '../core/models/user.interface';

describe('NavBarComponent', () => {
  let component: NavBarComponent;
  let fixture: ComponentFixture<NavBarComponent>;
  let mockAuthService: {
    isAuthenticated$: BehaviorSubject<boolean>,
    currentUser$: BehaviorSubject<User | null>,
    logout: jasmine.Spy
  };

  const mockUserAdmin: User = {
    id: '1',
    usuario: 'testuser',
    rol: 'ADMIN',
    nombre: 'Test',
    apellido: 'User',
    mail: 'test@gmail.com',
    direccion: '123 Test St',
    telefono: '1234567890',
    compras: [],
    alquilerLocatario: [],
    vehiculos: [],
    clave: 'password'
  };

  const mockUserUsuario: User = {
    id: '1',
    usuario: 'testuser',
    rol: 'USUARIO',
    nombre: 'Test',
    apellido: 'User',
    mail: 'test@gmail.com',
    direccion: '123 Test St',
    telefono: '1234567890',
    compras: [],
    alquilerLocatario: [],
    vehiculos: [],
    clave: 'password'
  };

  beforeEach(async () => {
    mockAuthService = {
      isAuthenticated$: new BehaviorSubject<boolean>(false),
      currentUser$: new BehaviorSubject<User | null>(null),
      logout: jasmine.createSpy('logout')
    };

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, NavBarComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería mostrar links básicos cuando no está autenticado', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('[routerLink="/auth/login"]')).toBeTruthy();
    expect(compiled.querySelector('[routerLink="/auth/register"]')).toBeTruthy();
  });

  it('debería mostrar menú de usuario cuando está autenticado', fakeAsync(() => {
    mockAuthService.isAuthenticated$.next(true);
    mockAuthService.currentUser$.next(mockUserUsuario);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('[routerLink="/product/vehicles"]')).toBeTruthy();
    expect(compiled.querySelector('[routerLink="/product/purchases"]')).toBeTruthy();
    expect(compiled.querySelector('[routerLink="/product/rent-list"]')).toBeTruthy();
  }));

  it('debería mostrar el rol del usuario cuando está autenticado', fakeAsync(() => {
    mockAuthService.isAuthenticated$.next(true);
    mockAuthService.currentUser$.next(mockUserAdmin);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('[routerLink="/product/brands"]')).toBeTruthy();
    expect(compiled.querySelector('[routerLink="/product/categories"]')).toBeTruthy();
    expect(compiled.querySelector('[routerLink="/auth/users"]')).toBeTruthy();
    expect(compiled.querySelector('[routerLink="/auth/dashboard"]')).toBeTruthy();
    expect(compiled.querySelector('[routerLink="/faq-list"]')).toBeTruthy();
  }));

  it('debería alternar el dropdown al hacer clic', fakeAsync(() => {
    mockAuthService.isAuthenticated$.next(true);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('#dropdownDefaultButton');
    button.click();
    fixture.detectChanges();
    expect(component.isDropdownOpen).toBeTrue();

    button.click();
    fixture.detectChanges();
    expect(component.isDropdownOpen).toBeFalse();
  }));

  it('debería cerrar sesión correctamente', () => {
    component.isDropdownOpen = true;
    component.userRole = 'ADMIN';
    
    component.logout();
    
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(component.isDropdownOpen).toBeFalse();
    expect(component.userRole).toBeNull();
  });

  it('debería actualizar el estado al cambiar autenticación', fakeAsync(() => {
    mockAuthService.isAuthenticated$.next(true);
    mockAuthService.currentUser$.next(mockUserAdmin);
    tick();
    fixture.detectChanges();

    expect(component.isLoggedIn).toBeTrue();
    expect(component.currentUser).toEqual(mockUserAdmin);
    expect(component.userRole).toBe('ADMIN');
  }));
});
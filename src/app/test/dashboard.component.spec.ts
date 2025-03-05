import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from '../components/auth/dashboard/dashboard.component';
import { of, Observable } from 'rxjs';
import { VehiclesService } from '../core/services/vehicles.service';
import { RentsService } from '../core/services/rents.service';
import { CompraService } from '../core/services/compra.service';
import { UsuariosService } from '../core/services/users.service';
import { Vehicle } from '../core/models/vehicles.interface';
import { Rent } from '../core/models/rent.interface';
import { User } from '../core/models/user.interface';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let vehiclesServiceSpy: jasmine.SpyObj<VehiclesService>;
  let rentsServiceSpy: jasmine.SpyObj<RentsService>;
  let compraServiceSpy: jasmine.SpyObj<CompraService>;
  let usuariosServiceSpy: jasmine.SpyObj<UsuariosService>;

  beforeEach(async () => {
    vehiclesServiceSpy = jasmine.createSpyObj('VehiclesService', ['getAllVehicle']);
    rentsServiceSpy = jasmine.createSpyObj('RentsService', ['getAllRents']);
    compraServiceSpy = jasmine.createSpyObj('CompraService', ['getAllCompra']);
    usuariosServiceSpy = jasmine.createSpyObj('UsuariosService', ['getAllUser']);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: VehiclesService, useValue: vehiclesServiceSpy },
        { provide: RentsService, useValue: rentsServiceSpy },
        { provide: CompraService, useValue: compraServiceSpy },
        { provide: UsuariosService, useValue: usuariosServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('debe crear el componente', () => {

    vehiclesServiceSpy.getAllVehicle.and.returnValue(of([]));
    compraServiceSpy.getAllCompra.and.returnValue(of([]));
    usuariosServiceSpy.getAllUser.and.returnValue(of([]));
    rentsServiceSpy.getAllRents.and.returnValue(of([]));

    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('debe configurar totalVehículos desde vehículosService.getAllVehicle filtrando vehículos sin fechaBaja y sin compra', () => {

    const vehicles: Vehicle[] = [
      { id: '1', marca: 'Toyota', modelo: 'Corolla', fechaBaja: null, compra: null },
      { id: '2', marca: 'Honda', modelo: 'Civic', fechaBaja: new Date(), compra: null },
      { id: '3', marca: 'Ford', modelo: 'Focus', fechaBaja: null, compra: { id: 'c1' } }
    ] as any;

    vehiclesServiceSpy.getAllVehicle.and.returnValue(of(vehicles));
    compraServiceSpy.getAllCompra.and.returnValue(of([]));
    usuariosServiceSpy.getAllUser.and.returnValue(of([]));
    rentsServiceSpy.getAllRents.and.returnValue(of([]));

    fixture.detectChanges();

    expect(component.totalVehiculos).toBe(1);
    expect(component.vehiculos.length).toBe(1);
  });

  it('debe calcular totalCompras y totalIngresosPorCompras correctamente', () => {

    const compras = [
      { estadoCompra: 'CONFIRMADA', vehiculo: { precioVenta: 10000 } },
      { estadoCompra: 'PENDIENTE', vehiculo: { precioVenta: 20000 } },
      { estadoCompra: 'CONFIRMADA', vehiculo: { precioVenta: 15000 } }
    ];
    compraServiceSpy.getAllCompra.and.returnValue(of(compras) as Observable<any[]>);
    vehiclesServiceSpy.getAllVehicle.and.returnValue(of([]));
    usuariosServiceSpy.getAllUser.and.returnValue(of([]));
    rentsServiceSpy.getAllRents.and.returnValue(of([]));

    fixture.detectChanges();

    expect(component.totalCompras).toBe(2);
    expect(component.totalIngresosPorCompras).toBe(10000 + 15000);
  });

  it('debe procesar usuariosActivos correctamente desde usuariosService.getAllUser', () => {

    const users: User[] = [
      { 
        id: '1', usuario: 'user1', clave: 'x', nombre: 'User', apellido: 'One', 
        mail: '', direccion: '', telefono: '', 
        compras: [1, 2], alquilerLocatario: [1], vehiculos: [{ compra: {} }]
      },
      { 
        id: '2', usuario: 'user2', clave: 'x', nombre: 'User', apellido: 'Two', 
        mail: '', direccion: '', telefono: '', 
        compras: [1], alquilerLocatario: [1, 2, 3], vehiculos: []
      },
      { 
        id: '3', usuario: 'user3', clave: 'x', nombre: 'User', apellido: 'Three', 
        mail: '', direccion: '', telefono: '', 
        compras: [], alquilerLocatario: [], vehiculos: []
      }
    ] as any;

    usuariosServiceSpy.getAllUser.and.returnValue(of(users));
    vehiclesServiceSpy.getAllVehicle.and.returnValue(of([]));
    compraServiceSpy.getAllCompra.and.returnValue(of([]));
    rentsServiceSpy.getAllRents.and.returnValue(of([]));

    fixture.detectChanges();


    expect(component.usuariosActivos.length).toBeLessThanOrEqual(10);

    const userOne = component.usuariosActivos.find(u => u.nombre.includes('One'));
    const totalUserOne = (userOne?.cantCompras || 0) + (userOne?.cantAlquileres || 0) + (userOne?.cantVentas || 0);
    expect(totalUserOne).toBe(4);
  });

  it('debe calcular totalReservas y totalIngresosPorReserva correctamente', () => {

    const rents: Rent[] = [
      {
        id: 'r1',
        estadoAlquiler: 'CONFIRMADO',
        fechaHoraInicioAlquiler: '2025-03-01T00:00:00Z',
        fechaHoraDevolucion: '2025-03-04T00:00:00Z',
        vehiculo: { precioAlquilerDiario: 100 }
      },
      {
        id: 'r2',
        estadoAlquiler: 'CONFIRMADO',
        fechaHoraInicioAlquiler: '2025-03-05T00:00:00Z',
        fechaHoraDevolucion: '2025-03-07T00:00:00Z',
        vehiculo: { precioAlquilerDiario: 150 }
      },
      {
        id: 'r3',
        estadoAlquiler: 'PENDIENTE',
        fechaHoraInicioAlquiler: '2025-03-08T00:00:00Z',
        fechaHoraDevolucion: '2025-03-10T00:00:00Z',
        vehiculo: { precioAlquilerDiario: 200 }
      }
    ] as any;

    rentsServiceSpy.getAllRents.and.returnValue(of(rents));
    vehiclesServiceSpy.getAllVehicle.and.returnValue(of([]));
    compraServiceSpy.getAllCompra.and.returnValue(of([]));
    usuariosServiceSpy.getAllUser.and.returnValue(of([]));

    fixture.detectChanges();

    expect(component.totalReservas).toBe(2);
    expect(component.totalIngresosPorReserva).toBe(600);
  });
});

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RentsService } from '../../../core/services/rents.service';
import { VehiclesService } from '../../../core/services/vehicles.service';
import { Vehicle } from '../../../core/models/vehicles.interface';
import { Rent } from '../../../core/models/rent.interface';
import { User } from '../../../core/models/user.interface';
import { CompraService } from '../../../core/services/compra.service';
import { UsuariosService } from '../../../core/services/users.service';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  totalVehiculos: number = 0;
  totalReservas: number = 0;
  totalCompras: number = 0;
  totalIngresosPorReserva: number = 0;
  totalIngresosPorCompras: number = 0;
  vehiculos: Vehicle[] = [];
  usuariosActivos: { nombre: string; cantCompras: number, cantAlquileres: number, cantVentas: number }[] = [];

  constructor(private vehicleService: VehiclesService, private rentService: RentsService, private compraService: CompraService, private usersService: UsuariosService) {}

  ngOnInit(): void {
    this.vehicleService.getAllVehicle().subscribe((data) => {
      const vehiculosDisponibles = data.filter(vehiculo => !vehiculo.fechaBaja && !vehiculo.compra);
      this.vehiculos = vehiculosDisponibles;
      this.totalVehiculos = vehiculosDisponibles.length;
    });

    this.compraService.getAllCompra().subscribe((compras) => {
      const comprasConfirmadas = compras.filter(compra => compra.estadoCompra === 'CONFIRMADA');
      this.totalCompras = comprasConfirmadas.length;
      
      this.totalIngresosPorCompras = comprasConfirmadas.reduce((acc, compra) => {
        const precio = compra.vehiculo.precioVenta ?? 0;
        return acc + (typeof precio === 'number' ? precio : 0);
      }, 0);
    });

    this.usersService.getAllUser().subscribe((usuarios) => {
      this.usuariosActivos = usuarios
        .map((usuario) => {
          const cantCompras = usuario.compras.length;
          const cantAlquileres = usuario.alquilerLocatario.length;
          const cantVentas = usuario.vehiculos.reduce((acc, vehiculo) => vehiculo.compra ? acc + 1 : acc, 0);
          const total = cantCompras + cantAlquileres + cantVentas;
          return {
            nombre: usuario.nombre + ' ' + usuario.apellido,
            cantCompras,
            cantAlquileres,
            cantVentas,
            total
          };
        })
        .sort((a, b) => b.total - a.total)
        .slice(0, 10); 
    });

    this.rentService.getAllRents().subscribe((reservas) => {
      const reservasConfirmadas = reservas.filter(reserva => reserva.estadoAlquiler === 'CONFIRMADO');
      this.totalReservas = reservasConfirmadas.length;
      
      this.totalIngresosPorReserva = reservasConfirmadas.reduce((acc, reserva) => {
        const dias = this.calcularDias(reserva);
        const precioDiario = reserva.vehiculo?.precioAlquilerDiario ?? 0;
        return acc + (dias * (typeof precioDiario === 'number' ? precioDiario : 0));
      }, 0);
    });
  }

  calcularDias(reserva: Rent): number { 
    try {
      const fechaInicio = new Date(reserva.fechaHoraInicioAlquiler);
      const fechaFin = new Date(reserva.fechaHoraDevolucion);
      const diferencia = fechaFin.getTime() - fechaInicio.getTime();
      return Math.max(0, Math.ceil(diferencia / (1000 * 3600 * 24)));
    } catch (error) {
      console.error('Error calculando días:', error);
      return 0;
    }
  }
}

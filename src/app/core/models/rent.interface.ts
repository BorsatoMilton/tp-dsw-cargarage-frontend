import { User } from "./user.interface.js";
import { Vehicle } from "./vehicles.interface.js";

export interface Rent{
    id: string;
    fechaAlquiler: Date;
    fechaHoraInicioAlquiler: Date;
    fechaHoraDevolucion: Date;
    fechaPago: Date;
    estadoAlquiler: String;
    locatario: User;
    vehiculo: Vehicle;
    tiempoConfirmacion: Date;
}
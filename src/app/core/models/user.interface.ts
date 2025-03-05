import { Compra } from "./compra.interfaces.js";
import { Rent } from "./rent.interface.js";
import { Vehicle } from "./vehicles.interface.js";

export interface User {
    id: string;
    usuario: string;
    clave: string;
    nombre: string;
    apellido: string;
    mail: string;
    compras: Compra[];
    alquilerLocatario: Rent[];
    vehiculos: Vehicle[];
    direccion: string;
    telefono: string;
    tarjeta?: string;
    calificacion?: string;
    pedido?: string;
    rol: string
}
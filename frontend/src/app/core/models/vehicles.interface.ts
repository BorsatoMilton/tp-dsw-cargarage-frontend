import { Brand } from "./brands.interfaces.js";
import { Category } from "./categories.interface.js";
import { Compra } from "./compra.interfaces.js";
import { User } from "./user.interface.js";

export interface Vehicle {
    id: string;
    anio: number;
    descripcion: string;
    fechaAlta: Date;
    fechaBaja: Date;
    precioVenta: number;
    precioAlquilerDiario: number;
    kilometros:number;
    modelo: string;
    marca: Brand;
    categoria: Category;
    imagenes: string[];
    propietario: User;
    transmision: string;
    compra: Compra;
}
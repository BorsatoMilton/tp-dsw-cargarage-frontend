import { User } from "./user.interface.js";
import { Vehicle } from "./vehicles.interface.js";

export interface Compra {
    filter(arg0: (compra: any) => boolean): Compra[];
    id : string;
    vehiculo: Vehicle;
    usuario: User;
    fechaCompra: Date;
    fechaCancelacion: Date;
    estadoCompra: string;
    fechaLimiteConfirmacion: Date;
}
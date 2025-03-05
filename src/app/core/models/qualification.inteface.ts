import { User } from './user.interface';
import { Rent } from './rent.interface';
import { Compra } from './compra.interfaces';

export interface Qualification {
    idCalificacion: string;
    fechaCalificacion: Date;
    valoracion: number;
    usuario: User;
    alquiler: Rent;
    comentario: string;
    compra: Compra
}
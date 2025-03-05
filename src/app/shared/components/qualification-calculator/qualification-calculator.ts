import { Injectable } from '@angular/core';
import { Observable, map, catchError, of } from 'rxjs';
import { QualificationsService } from '../../../core/services/qualifications.service';

@Injectable({
  providedIn: 'root'
})
export class QualificationCalculator {
  
  constructor(private qualificationService: QualificationsService) { }

  public getPromedio(idUsuario: string): Observable<number> {
    return this.qualificationService.getQualificationsByUserId(idUsuario).pipe(
      map(qualifications => {
        if (!qualifications?.length) return 0;
        const sum = qualifications.reduce((acc, curr) => acc + Number(curr.valoracion), 0);
        return this.redondearPromedio(sum / qualifications.length);
      }),
      catchError(error => {
        console.error('Error calculando promedio:', error);
        return of(0);
      })
    );
  }

  public getCalificacionesTotal(idUsuario: string): Observable<number> {
    return this.qualificationService.getQualificationsByUserId(idUsuario).pipe(
      map(qualifications => qualifications?.length || 0),
      catchError(error => {
        console.error('Error obteniendo total de calificaciones:', error);
        return of(0);
      })
    );
  }

  private redondearPromedio(valor: number, decimales: number = 2): number {
    return Number(valor.toFixed(decimales));
  }
}
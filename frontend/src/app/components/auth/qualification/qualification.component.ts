import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OnInit } from '@angular/core';
import { QualificationsService } from '../../../core/services/qualifications.service';
import { UsuariosService } from '../../../core/services/users.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../../core/models/user.interface';
import { RentsService } from '../../../core/services/rents.service';
import { CompraService } from '../../../core/services/compra.service';
import { Rent } from '../../../core/models/rent.interface';
import { Compra } from '../../../core/models/compra.interfaces';
import { Qualification } from '../../../core/models/qualification.inteface';
import { alertMethod } from '../../../shared/components/alerts/alert-function/alerts.functions';
import {
  ReactiveFormsModule,
  Validators,
  FormGroup,
  FormBuilder,
} from '@angular/forms';
import { ViewChild } from '@angular/core';
import { UniversalAlertComponent } from '../../../shared/components/alerts/universal-alert/universal-alert.component';

@Component({
  selector: 'app-qualification',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UniversalAlertComponent,
  ],
  templateUrl: './qualification.component.html',
  styleUrl: './qualification.component.css',
})
export class QualificationComponent implements OnInit {
  qualificationForm: FormGroup;
  usuarioAcalificar: User | null = null;
  rent: Rent | null = null;
  compra: Compra | null = null;
  rating: number = 0;
  comment: string = '';
  esAlquiler: boolean = false;
  userRole: string = '';

  @ViewChild(UniversalAlertComponent) alertComponent!: UniversalAlertComponent;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private qualificationService: QualificationsService,
    private usuarioService: UsuariosService,
    private compraService: CompraService,
    private rentService: RentsService,
    private fb: FormBuilder
  ) {
    this.qualificationForm = this.fb.group({
      valoracion: [null, [Validators.required]],
      comentario: [''],
    });
  }

  async ngOnInit(): Promise<void> {
    const idUsuario = this.route.snapshot.paramMap.get('usuarioAcalificar');
    const idObjeto = this.route.snapshot.paramMap.get('id');
  
    if (!idUsuario || !idObjeto) {
      alertMethod('Error', 'Parámetros inválidos', 'error');
      this.router.navigate(['/']);
      return;
    }
  
    const existeCalificacion = await this.verificarCalificacion(idUsuario, idObjeto);
  
    if (existeCalificacion) {
      alertMethod('Calificar a usuario', 'Ya has calificado a este usuario', 'error');
      this.router.navigate(['/']);
      return;
    }
  
    this.buscarDatosParaCalificar(idUsuario, idObjeto);
  }

  private buscarDatosParaCalificar(idUsuario: string, idObjeto: string): void {

    if (idUsuario) {
      this.usuarioService.getOneUserById(idUsuario).subscribe((user) => {
        this.usuarioAcalificar = user;
        this.verificarObjeto(idObjeto);
      });
    }
  }


    private verificarObjeto(id: string): void {
      this.rentService.getOneRent(id).subscribe({
        next: (alquiler) => {
          if (alquiler) {
            this.esAlquiler = true;
            this.rent = alquiler;
            
            if (alquiler.locatario.id === this.usuarioAcalificar?.id) {
              this.userRole = 'Locatario';
              this.usuarioAcalificar = alquiler.locatario;
            } else {
              this.userRole = 'Locador';
              this.usuarioAcalificar = alquiler.vehiculo.propietario;
            }
          } else {
            this.compraService.getOneCompra(id).subscribe({
              next: (compra) => {
                this.compra = compra;
                this.esAlquiler = false;
                
                if (compra.usuario.id === this.usuarioAcalificar?.id) {
                  this.userRole = 'Comprador';
                  this.usuarioAcalificar = compra.usuario;
                } else {
                  this.userRole = 'Vendedor';
                  this.usuarioAcalificar = compra.vehiculo.propietario;
                }
              }
            });
          }
        }
      });
    }

  private async verificarCalificacion(usuarioId: string, idObjeto: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.qualificationService.checkQualificationExists(usuarioId, idObjeto).subscribe({
        next: (calificacion) => {

          resolve(!!calificacion); 
        },
        error: (error) => {
      
          if (error.status === 404) {
            resolve(false);
          } else {
            console.error('Error verificando calificación:', error);
            resolve(true); 
          }
        }
      });
    });
  }


  onSubmit(): void {
    if (!this.usuarioAcalificar) {
      console.error('No se encontró un usuario para calificar.');
      return;
    }

    let nuevaCalificacion: Qualification | null = null;

    if (this.esAlquiler) {
      if (this.rent) {
        nuevaCalificacion = {
          ...this.qualificationForm.value,
          fechaCalificacion: new Date(),
          usuario: this.usuarioAcalificar.id,
          alquiler: this.rent.id,
        };
      } else {
        console.error('No se encontró un alquiler para calificar.');
        return;
      }
    } else {
      if (this.compra) {
        nuevaCalificacion = {
          ...this.qualificationForm.value,
          fechaCalificacion: new Date(),
          usuario: this.usuarioAcalificar.id,
          compra: this.compra.id,
        };
      } else {
        console.error('No se encontró una compra para calificar.');
        return;
      }
    }

    if (!nuevaCalificacion) {
      this.router.navigate(['/']);
      alertMethod(
        'Califica al usuario',
        'Error al enviar la calificación. No se encontro que calificar!',
        'error'
      );
      return;
    }

    this.qualificationService.createQualification(nuevaCalificacion).subscribe({
      next: (respuesta) => {
        alertMethod(
          'Califica al usuario',
          'Usuario calificado correctamente',
          'success'
        );
        this.router.navigate(['/']);
      },
      error: (error) => {
        alertMethod(
          'Califica al usuario',
          'Error al enviar la calificación',
          'error'
        );
        console.error('Error al enviar la calificación:', error);
      },
    });
  }
}

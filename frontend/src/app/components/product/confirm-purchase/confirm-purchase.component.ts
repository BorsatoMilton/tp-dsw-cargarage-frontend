import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Compra } from '../../../core/models/compra.interfaces';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Vehicle } from '../../../core/models/vehicles.interface';
import { User } from '../../../core/models/user.interface';
import { Category } from '../../../core/models/categories.interface';
import { CompraService } from '../../../core/services/compra.service';
import { alertMethod } from '../../../shared/components/alerts/alert-function/alerts.functions';
import { UniversalAlertComponent } from '../../../shared/components/alerts/universal-alert/universal-alert.component';

@Component({
  selector: 'app-confirm-purchase',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './confirm-purchase.component.html',
  styleUrl: './confirm-purchase.component.css',
})
export class ConfirmPurchaseComponent {
  id: string | null = null;
  usuario: User | null = null;
  selectedCompra: Compra | null = null;
  vehiculo: Vehicle | null = null;
  idVehiculo: string | null = null;
  categoria: Category | null = null;
  compraForm: FormGroup = new FormGroup({});

  constructor(
    private route: ActivatedRoute,
    private compraService: CompraService,
    private router: Router
  ) {}

  @ViewChild(UniversalAlertComponent) alertComponent!: UniversalAlertComponent;

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.id = params['id'];
      if (this.id !== null) {
          this.compraService.getOneCompra(this.id).subscribe((data) => {
            if (data === null) {
              this.router.navigate(['/']);
              alertMethod(
                'Confirmar Compra',
                'Oops! El servidor no reconoce su compra. Tal vez no fue confirmada',
                'error'
              );
            } else {
              if(data.estadoCompra !== 'PENDIENTE'){
                this.router.navigate(['/']);
                alertMethod('Confirmar Compra', `Oops! Esta compra se encuentra en estado ${data.estadoCompra}`, 'error');
              }
              this.selectedCompra = data;
              this.vehiculo = data.vehiculo;
              this.usuario = data.usuario;
            }
          });
      }
    });
 
  }

  openModal(modalId: string): void {
    const modalDiv = document.getElementById(modalId);
    if (modalDiv != null) {
      modalDiv.style.display = 'block';
    }
  }

  closeModal(modalId: string) {
    const modalDiv = document.getElementById(modalId);
    if (modalDiv != null) {
      modalDiv.style.display = 'none';
    }
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop != null) {
      backdrop.parentNode?.removeChild(backdrop);
    }
  }

  confirmarCompra(): void {
    this.closeModal('confirmarCompra');
    if (this.selectedCompra && this.vehiculo && this.usuario) {
      this.compraService
        .confirmarCompra(this.selectedCompra!.id)
        .subscribe((data) => {
          if (data === null) {
            alertMethod(
              'Confirmar Compra',
              'Oops! El servidor no reconoce su compra.',
              'error'
            );
            this.router.navigate(['/']);
          } else {
            alertMethod(
              'Confirmar Compra',
              'Compra confirmada exitosamente!',
              'success'
            );
            this.router.navigate(['/']);
          }
        });

      this.compraService
        .avisoCompraExitosa(this.usuario.mail, this.vehiculo!.id)
        .subscribe((data) => {
          if (data === null) {
            alertMethod(
              'Confirmar Compra',
              'Oops! El servidor no reconoce su usuario.',
              'error'
            );
            this.router.navigate(['/']);
          }
        });
    }else {
      alertMethod('Confirmar Compra', 'Oops! Algo salió mal. falta mail, vehiculo, compra', 'error');
    }
  }

}

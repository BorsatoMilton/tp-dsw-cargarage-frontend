import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PasswordRecoveryService } from '../../../core/services/password-recovery.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UniversalAlertComponent } from '../../../shared/components/alerts/universal-alert/universal-alert.component';
import { UsuariosService } from '../../../core/services/users.service';
import { alertMethod } from '../../../shared/components/alerts/alert-function/alerts.functions';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule, UniversalAlertComponent],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup = new FormGroup({});
  token: string | null = null;

  @ViewChild(UniversalAlertComponent) alertComponent!: UniversalAlertComponent;

  constructor(
    private fb: FormBuilder,
    private passwordRecoveryService: PasswordRecoveryService,
    private userService: UsuariosService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.resetForm = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
      },
    );
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
    });
    if (!this.token) {
      alertMethod('Recuperación de contraseña','Oops algo sucedio! Necesitas un token, tal vez ya utilizaste este link', 'error');
      this.router.navigate(['auth/login']);
    }else{
      this.passwordRecoveryService.validateToken(this.token).subscribe({
        next: () => {
          console.log('Token verificado');
        },
        error: (error) => {
          console.error('Error al verificar el token:', error);
          alertMethod('Recuperación de contraseña','Token utilizado o invalido', 'error');
          this.router.navigate(['auth/login']);
        }
      });
    }
  }

  passwordMatchValidator(form: FormGroup): boolean {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if(password !== confirmPassword){
      return false;
    }
    return true;
    
  }
  

  resetPassword(): void {
    if (!this.resetForm.valid || !this.token) {
      this.alertComponent.showAlert('Por favor, complete el formulario correctamente.', 'error');
      return;
    }
    if(!this.passwordMatchValidator(this.resetForm)){
      this.alertComponent.showAlert('Las contraseñas no coinciden', 'error');
      return;
    }
    const password = this.resetForm.get('password')?.value;
    this.userService.resetPassword(this.token, password).subscribe({
      next: () => {
        alertMethod('Actualizar Contraseña','Contraseña actualizada correctamente', 'success');
        this.router.navigate(['auth/login']);
      },
      error: (error) => {
        console.error('Error al actualizar la contraseña:', error);
        this.alertComponent.showAlert('Hubo un error al actualizar la contraseña. Por favor, inténtalo nuevamente.', 'error');
      }
    });
  }
  
}
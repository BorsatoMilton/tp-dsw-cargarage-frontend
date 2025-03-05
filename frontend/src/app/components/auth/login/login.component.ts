import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { RouterModule, Router } from '@angular/router';
import { UniversalAlertComponent } from '../../../shared/components/alerts/universal-alert/universal-alert.component';
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule, UniversalAlertComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup = new FormGroup({});
  user: string = '';
  password: string = '';
  isLoggedIn: boolean = false;  

  @ViewChild(UniversalAlertComponent) alertComponent!: UniversalAlertComponent;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      user: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  login(): void {
    if (this.loginForm.invalid) {
      this.alertComponent.showAlert('Por favor, complete los campos', 'error');
      return;
    }
  
    this.user = this.loginForm.get('user')?.value;
    this.password = this.loginForm.get('password')?.value;
    
  
    this.authService.login(this.user, this.password).subscribe({
      next: (usuario) => {
        this.isLoggedIn= true
        this.router.navigate(['/']);
        
      },
      error: (error) => {
        if (error.status === 404) {
          this.alertComponent.showAlert('Usuario no encontrado', 'error');
        } else if (error.status === 401) {
          this.alertComponent.showAlert('Contraseña incorrecta', 'error');
        } else {
          this.alertComponent.showAlert('Error al iniciar sesión, intente en un momento', 'error');
        }
        this.loginForm.reset();
      }
    });
  }
  
}

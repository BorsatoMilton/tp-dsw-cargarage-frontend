import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { User } from '../../../core/models/user.interface';
import { UsuariosService } from '../../../core/services/users.service';
import { UniversalAlertComponent } from '../../../shared/components/alerts/universal-alert/universal-alert.component';
import { alertMethod } from '../../../shared/components/alerts/alert-function/alerts.functions';
import {  map, Observable, switchMap, throwError } from 'rxjs';
import {SearcherComponent} from '../../../shared/components/searcher/searcher.component';
import { MatBottomSheet} from '@angular/material/bottom-sheet'; 
import { BottomSheetComponent } from '../../../shared/components/bottom-sheet/bottom-sheet.component'; 
import { BottomSheetConfig } from '../../../core/models/bottom-sheet.interface';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, UniversalAlertComponent, SearcherComponent],
  templateUrl: 'usuario.component.html',
  styleUrl: './usuario.component.css',
})
export class UserComponent implements OnInit {
  addUserForm: FormGroup = new FormGroup({});
  userForm: FormGroup = new FormGroup({});
  passwordForm: FormGroup = new FormGroup({}); 
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedUser: User | null = null;


@ViewChild(UniversalAlertComponent) alertComponent! : UniversalAlertComponent

  constructor(
    private fb: FormBuilder,
    private userService: UsuariosService,
    private bottomSheet: MatBottomSheet
  ) {
    this.addUserForm = this.fb.group({
      usuario: ['', Validators.required],
      nombre: ['', Validators.required],
      clave: ['', [Validators.required, Validators.minLength(6)]],
      apellido: ['', Validators.required],
      telefono: ['', Validators.required],
      mail: ['', [Validators.required, Validators.email]],
      direccion: ['', Validators.required],
      rol: ['', Validators.required],
    });

    this.userForm = this.fb.group({
      usuario: ['', Validators.required],
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      telefono: ['', Validators.required],
      mail: ['', [Validators.required, Validators.email]],
      direccion: ['', Validators.required],
      rol: ['', Validators.required],
    });
    
    this.passwordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    this.userService.getAllUser().subscribe((users: User[]) => {
      this.users = users;
      this.filteredUsers = users;
    });
  }

  onSearch(filteredUsers: User[]): void {
    this.filteredUsers = filteredUsers.length > 0 ? filteredUsers : [];
  }

  openModal(modalId: string, user: User): void {
    this.selectedUser = user;
    if (user) {
      this.userForm.patchValue({
        usuario: user.usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        mail: user.mail,
        telefono: user.telefono,
        direccion: user.direccion,
        rol: user.rol,
      });
    }
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
    this.selectedUser = null;
    this.userForm.reset();
  }

  checkUsernameAndMail(username: string, mail: string, excludeUserId?: string): Observable<boolean> {
    return this.userService.getOneUserByEmailOrUsername(username, mail, excludeUserId).pipe(
      map((user: User | null) => !!user)
    );
  }

  openUserDetails(user: User): void {
    const config: BottomSheetConfig<User> = {
      title: 'Detalles del Usuario',
      fields: [
        { key: 'nombre', label: 'Nombre' },
        { key: 'apellido', label: 'Apellido' },
        { key: 'direccion', label: 'Dirección' },
        { key: 'telefono', label: 'Teléfono' },
        { key: 'rol', label: 'Rol' },
      ],
      data: user,
    };
    this.bottomSheet.open(BottomSheetComponent, { data: config });
  }

  addUser() {
    if (this.addUserForm.valid) {
      const userData = {
        ...this.addUserForm.value,
        telefono: this.addUserForm.value.telefono.toString()
      };
  
      this.checkUsernameAndMail(userData.usuario, userData.mail).pipe(
        switchMap((exists: boolean) => {
          if (exists) {
            return throwError(() => new Error('El usuario ya existe'));
          }
          return this.userService.addUser(userData);
        })
      ).subscribe({
        next: () => {
          alertMethod('Alta de usuarios', 'Usuario creado exitosamente', 'success');
          this.loadUser();
          this.closeModal('addUser');
          this.addUserForm.reset();
        },
        error: (err: any) => {
          if (err.message === 'El usuario ya existe') {
            this.alertComponent.showAlert('El usuario o mail ya están registrados', 'error');
          } else if (err.status === 500) {
            this.alertComponent.showAlert('Error interno del servidor', 'error');
          } else {
            this.alertComponent.showAlert('Ocurrió un error al agregar el usuario', 'error');
          }
          this.closeModal('addUser');
        }
      });
    } else {
      this.alertComponent.showAlert('Por favor, complete todos los campos requeridos.', 'error');
    }
  }

  editUser(): void {
    if (this.selectedUser) {
      const updatedUser: User = {
        ...this.selectedUser,
        ...this.userForm.value
      };
  
      this.checkUsernameAndMail(updatedUser.usuario, updatedUser.mail, this.selectedUser.id).pipe(
        switchMap((exists: boolean) => {
          if (exists) {
            return throwError(() => new Error('El usuario ya existe'));
          }
          return this.userService.editUser(updatedUser);
        })
      ).subscribe({
        next: () => {
          alertMethod('Actualización de usuarios', 'Usuario actualizado exitosamente', 'success');
          this.loadUser();
          this.closeModal('editUser');
          this.userForm.reset();
        },
        error: (err: any) => {
          this.closeModal('editUser');
          if (err.message === 'El usuario ya existe') {
            this.alertComponent.showAlert('El usuario o mail ya están registrados', 'error');
          } else if (err.status === 500) {
            this.alertComponent.showAlert('Error interno del servidor', 'error');
          } else {
            this.alertComponent.showAlert('Ocurrió un error al actualizar el usuario', 'error');
          }
        }
      });
    }
  }
  
  updatePassword(): void {
    if (this.selectedUser && this.passwordForm.valid) {
      const newPassword = { newPassword: this.passwordForm.value.newPassword };
  
      this.userService.changePassword(this.selectedUser.id, newPassword).subscribe(() => {
        alertMethod('Cambio de contraseña','Contraseña actualizada correctamente', 'success');
        this.closeModal('updatePassword');
        this.passwordForm.reset();
        this.ngOnInit();
      });
    }
  }
  
  removeUser(user: User | null, modalId: string) {
    if (user) {
      this.userService.deleteUser(user).subscribe(() => {
        alertMethod('Baja de usuarios','Usuario eliminado correctamente', 'success');
        this.ngOnInit();
        this.closeModal(modalId);
        this.userForm.reset();
      });
    }
  }

}

import { CanActivateFn } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';

export const onlyAdmin: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return of(false); 
  }

  const currentUser = authService.getCurrentUser();
  
  if(currentUser && currentUser.rol === 'ADMIN') {
        return of(true); 
  } else {    
    router.navigate(['/']);
    return of(false);
  }
};

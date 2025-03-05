import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.interface';


@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavBarComponent {
  isLoggedIn: boolean = false;
  currentUser: User|null = null;
  userRole: string|null = null;
  isDropdownOpen= false;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.isAuthenticated$.subscribe((authStatus) => {
      this.isLoggedIn = authStatus;
    });

    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      this.userRole = user?.rol || null;
    });
}

  logout(): void {
    this.authService.logout();
    this.isDropdownOpen = false;
    this.userRole = null;
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
}

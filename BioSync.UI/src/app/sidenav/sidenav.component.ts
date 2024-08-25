import { Component, OnInit, EventEmitter, Output, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { RouterLink } from '@angular/router';
import { LogoutService } from '../../services/auth/logout.service';
import { CookieService } from '../../services/cookie.service';
import { PromptConfirmComponent } from '../prompt-confirm/prompt-confirm.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [
    MatSelectModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    RouterLink,
    CommonModule,
    MatIconModule,
  ],
  providers: [LogoutService, CookieService],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css'],
})
export class SidenavComponent implements OnInit {
  activeButton: string | null = 'dashboard';
  isDropdownOpenStudent = false;
  isDropdownOpenMaintenance = false;

  @Output() sidenavClose = new EventEmitter<void>();

  constructor(
    private router: Router,
    private logoutService: LogoutService,
    private cookieService: CookieService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    const savedActiveButton = localStorage.getItem('activeButton');
    if (savedActiveButton) {
      this.activeButton = savedActiveButton;
    }
  }

  onButtonClick(buttonName: string) {
    if (buttonName !== 'student' && buttonName !== 'maintenance') {
      this.activeButton = buttonName;
      localStorage.setItem('activeButton', buttonName);
      this.isDropdownOpenStudent = false;
      this.isDropdownOpenMaintenance = false;
    }
  }

  toggleStudentDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpenStudent = !this.isDropdownOpenStudent;
    if (this.isDropdownOpenStudent) {
      this.activeButton = 'student';
      localStorage.setItem('activeButton', 'student');
      this.isDropdownOpenMaintenance = false;
    }
  }

  toggleMaintenanceDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpenMaintenance = !this.isDropdownOpenMaintenance;
    if (this.isDropdownOpenMaintenance) {
      this.activeButton = 'maintenance';
      localStorage.setItem('activeButton', 'maintenance');
      this.isDropdownOpenStudent = false;
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
    this.isDropdownOpenStudent = false;
    this.isDropdownOpenMaintenance = false;
    if (route === '/student' || route === '/attendance') {
      this.activeButton = 'student';
      localStorage.setItem('activeButton', 'student');
    } else if (route === '/school-year' || route === '/program') {
      this.activeButton = 'maintenance';
      localStorage.setItem('activeButton', 'maintenance');
    } else {
      this.activeButton = route.split('/').pop() || '';
      localStorage.setItem('activeButton', this.activeButton);
    }
  }

  closeSidenav() {
    this.sidenavClose.emit();
  }

  @HostListener('document:click', ['$event'])
  closeDropdownOnClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (
      this.isDropdownOpenStudent &&
      !target.closest('.menu-container') &&
      !target.closest('.dropdown-content')
    ) {
      this.isDropdownOpenStudent = false;
      this.activeButton = null;
      localStorage.removeItem('activeButton');
    } else if (
      this.isDropdownOpenMaintenance &&
      !target.closest('.menu-container') &&
      !target.closest('.dropdown-content')
    ) {
      this.isDropdownOpenMaintenance = false;
      this.activeButton = null;
      localStorage.removeItem('activeButton');
    }
  }

  openLogoutDialog(): void {
    const dialogRef = this.dialog.open(PromptConfirmComponent, {
      width: '400px',
      data: {
        title: 'Logout',
        message: 'Are you sure you want to log out of your account?',
        action: 'Logout',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.logout();
      }
    });
  }

  logout() {
    this.logoutService.logout().subscribe({
      next: () => {
        this.cookieService.deleteCookie('authToken');
        this.cookieService.deleteCookie('role');
        this.router.navigate(['/login']).then();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}

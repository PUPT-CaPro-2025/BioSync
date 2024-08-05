import { Component, OnInit, HostListener } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [MatSelectModule, MatToolbarModule, MatButtonModule, MatSidenavModule, MatListModule, RouterLink, CommonModule, MatIconModule],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent implements OnInit {
  activeButton: string | null = 'dashboard';
  isDropdownOpen = false;

  constructor(private router: Router) {}

  ngOnInit() {
    const savedActiveButton = localStorage.getItem('activeButton');
    if (savedActiveButton) {
      this.activeButton = savedActiveButton;
    }
  }

  onButtonClick(buttonName: string) {
    if (buttonName !== 'student') {
      this.activeButton = buttonName;
      localStorage.setItem('activeButton', buttonName);
      this.isDropdownOpen = false;
    }
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.activeButton = 'student';
      localStorage.setItem('activeButton', 'student');
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
    this.isDropdownOpen = false;
    if (route === '/student' || route === '/attendance') {
      this.activeButton = 'student';
      localStorage.setItem('activeButton', 'student');
    } else {
      this.activeButton = route.split('/').pop() || '';
      localStorage.setItem('activeButton', this.activeButton);
    }
  }

  @HostListener('document:click', ['$event'])
  closeDropdownOnClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (this.isDropdownOpen && !target.closest('.menu-container') && 
        !target.closest('.dropdown-content')) {
      this.isDropdownOpen = false;
      this.activeButton = null;
      localStorage.removeItem('activeButton');
    }
  }
}

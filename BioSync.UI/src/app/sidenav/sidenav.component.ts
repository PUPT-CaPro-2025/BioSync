import { Component, OnInit } from '@angular/core';
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
  imports: [MatSelectModule, MatToolbarModule, MatButtonModule, MatSidenavModule, MatListModule, RouterLink, CommonModule, MatIconModule,],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.css'
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
    this.activeButton = buttonName;
    localStorage.setItem('activeButton', buttonName);
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
    this.activeButton = 'student';
    localStorage.setItem('activeButton', 'student');
    this.isDropdownOpen = false; 
  }
}

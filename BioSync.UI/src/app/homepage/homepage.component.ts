import { Component, HostListener, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [RouterOutlet, SidenavComponent, MatSidenavModule, MatIconModule],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent {
  showSideNav = true;
  isMobile = false;

  @ViewChild('sidenav') sidenav!: MatSidenav;

  private hideSideNavRoutes = [
    '/login',
    '/admin-login',
    'faculty-login',
    'student-login',
    'visitor-log',
    'dashboard-student',
    'dashboard-professor'
  ];

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.showSideNav = !this.hideSideNavRoutes.some(
          (route) => this.router.url.includes(route)
        );
      }
    });

    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth <= 900;
    if (!this.isMobile) {
      this.showSideNav = true;
    } else {
      this.showSideNav = false;
    }
  }

  onCloseSidenav() {
    if (this.isMobile) {
      this.showSideNav = false;
    }
  }

  handleSidenavClose() {
    this.showSideNav = false;
    if (this.sidenav) {
      this.sidenav.close();
    }
  }
}

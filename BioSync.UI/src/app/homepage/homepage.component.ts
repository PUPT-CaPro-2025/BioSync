import { Component, HostListener } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [RouterOutlet, SidenavComponent, MatSidenavModule],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent {
  showSideNav = true;
  isMobile = false;

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
}

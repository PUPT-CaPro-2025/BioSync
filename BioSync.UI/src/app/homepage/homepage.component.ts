import { Component, HostListener, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
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
export class HomepageComponent implements AfterViewInit {
  showSideNav = true;
  displaySideNav = true;
  isMobile = false;

  @ViewChild('sidenav') sidenav!: MatSidenav;

  private hideSideNavRoutes = [
    '/login', 
    '/admin-login', 
    '/student-login', 
    '/professor-login', 
    '/visitor-log'
  ];

  constructor(private router: Router, private cd: ChangeDetectorRef) {
    this.router.events.subscribe((event) => {
      if(event instanceof NavigationEnd) {
        this.showSideNav = !this.hideSideNavRoutes.some(
          route => this.router.url.includes(route)
        );
        this.updateDisplaySideNav();
      }
    });
  }

  ngAfterViewInit() {
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkScreenSize();
    this.cd.detectChanges();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth <= 900;
    this.updateDisplaySideNav();
  }

  private updateDisplaySideNav() {
    if (this.isMobile) {
      this.showSideNav = false; // Hide sidenav by default on mobile
    } else {
      this.showSideNav = !this.hideSideNavRoutes.some(
        route => this.router.url.startsWith(route)
      ); // Check if sidenav should be visible on larger screens
    }
    if (this.sidenav) {
      this.sidenav.opened = !this.isMobile && this.showSideNav; // Adjust sidenav state
    }
  }

  private updateSideNavVisibility() {
    this.showSideNav = !this.hideSideNavRoutes.some(
      route => this.router.url.startsWith(route)
    );
    if (this.isMobile) {
      this.sidenav.close(); // Ensure sidenav is closed on mobile
    }
  }

  onCloseSidenav() {
    if (this.isMobile) {
      this.showSideNav = false;
    }
  }

  handleSidenavClose() {
    this.displaySideNav = true;
    if (this.sidenav) {
      this.sidenav.close();
    }
  }
}

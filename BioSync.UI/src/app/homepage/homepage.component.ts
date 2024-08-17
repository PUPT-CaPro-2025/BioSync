import { Component } from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import { SidenavComponent } from '../sidenav/sidenav.component';
import {MatSidenavModule} from '@angular/material/sidenav';


@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [RouterOutlet, SidenavComponent, MatSidenavModule ],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})
export class HomepageComponent {
  showSideNav = true;
  private hideSideNavRoutes = [
    '/login', 
    '/admin-login', 
    'faculty-login', 
    'student-login', 
    'visitor-log'
  ];

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if(event instanceof NavigationEnd) {
        this.showSideNav = !this.hideSideNavRoutes.some(
          route => this.router.url.includes(route)
        )
      }
    })
  }

}

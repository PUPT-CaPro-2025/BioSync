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

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if(event instanceof NavigationEnd) {
        this.showSideNav = !this.router.url.includes('/login');
      }
    })
  }

}

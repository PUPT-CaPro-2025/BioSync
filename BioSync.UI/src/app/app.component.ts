import {Component, OnInit} from '@angular/core';
import {NavigationStart, Router, RouterOutlet} from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import {AuthService} from "../services/auth/auth.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HomepageComponent],
  providers: [AuthService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{

  private publicRoutes = ['/login', '/admin-login', '/faculty-login', '/student-login', '/visitor-log'];


  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        const isPublicRoute = this.publicRoutes.includes(event.url);
        if (this.authService.isAuthenticated() && isPublicRoute) {
          this.router.navigate(['/dashboard']).then();
        } else if (!this.authService.isAuthenticated() && !isPublicRoute) {
          this.router.navigate(['/login']).then();
        }
      }
    });
  }


}

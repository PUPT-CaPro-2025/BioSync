import {Component, OnInit} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
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

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.authService) {
      // Redirect to dashboard if already authenticated
      this.router.navigate(['/dashboard']).then();
    } else {
      // Redirect to login if not authenticated
      this.router.navigate(['/login']).then();
    }
  }


}

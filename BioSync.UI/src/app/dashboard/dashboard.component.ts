import { Component } from '@angular/core';
import {CookieService} from "../../services/cookie.service";
import {DashboardProfessorComponent} from "./dashboard-professor/dashboard-professor.component";
import {DashboardStudentComponent} from "./dashboard-student/dashboard-student.component";
import { DashboardAdminComponent } from './dashboard-admin/dashboard-admin.component';
import { CryptoService } from '../../services/crypto.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DashboardProfessorComponent,
    DashboardStudentComponent,
    DashboardAdminComponent
  ],
  providers: [CookieService, CryptoService],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  constructor(
    private cookieService: CookieService,
    private cryptoService: CryptoService
  ) {}

  getRole(): string{
    const getTheRole = <string>decodeURIComponent(this.cookieService.getCookie("role")!);
    return this.cryptoService.decrypt(getTheRole);
  }
}

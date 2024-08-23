import { Component } from '@angular/core';
import {CookieService} from "../../services/cookie.service";
import {DashboardProfessorComponent} from "../dashboard-professor/dashboard-professor.component";
import {DashboardStudentComponent} from "../dashboard-student/dashboard-student.component";
import { DashboardAdminComponent } from '../dashboard-admin/dashboard-admin.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DashboardProfessorComponent,
    DashboardStudentComponent,
    DashboardAdminComponent
  ],
  providers: [CookieService],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  constructor(private cookie: CookieService) {}

  getRole(): string{
    return <string>this.cookie.getCookie('role');
  }
}

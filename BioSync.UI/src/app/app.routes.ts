import { Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { SubjectComponent } from './subject/subject.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { VisitorComponent } from './visitor/visitor.component';
import { ProfessorComponent } from './professor/professor.component';
import { StudentComponent } from './student/student.component';
import { AttendanceComponent } from './attendance/attendance.component';
import { LandingComponent } from './landing/landing.component';
import { LoginAdminComponent } from './login-admin/login-admin.component';

export const routes: Routes = [
   { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: "login", component: LandingComponent },
    { path: "admin-login", component: LoginAdminComponent },
    { path: "admin-home", component: HomepageComponent },
    { path: "dashboard", component: DashboardComponent },
    { path: "schedule", component: ScheduleComponent },
    { path: "subject", component: SubjectComponent },
    { path: "visitor", component: VisitorComponent },
    { path: "professor", component: ProfessorComponent },
    { path: "student", component: StudentComponent },
    { path: "attendance", component: AttendanceComponent }
];

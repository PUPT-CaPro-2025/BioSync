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
import { LoginFacultyComponent } from './login-faculty/login-faculty.component';
import { LoginStudentComponent } from './login-student/login-student.component';
import { LoginVisitorComponent } from './login-visitor/login-visitor.component';
import { SubjectScheduleStudentComponent } from './subject-schedule-student/subject-schedule-student.component';
import { AttendanceManagementProfessorComponent } from './attendance-management-professor/attendance-management-professor.component';

export const routes: Routes = [
    { path: "login", component: LandingComponent },
    { path: "admin-login", component: LoginAdminComponent },
    { path: "faculty-login", component: LoginFacultyComponent },
    { path: "student-login", component: LoginStudentComponent },
    { path: "visitor-log", component: LoginVisitorComponent },
    { path: "dashboard", component: DashboardComponent },
    { path: "schedule", component: ScheduleComponent },
    { path: "subject", component: SubjectComponent },
    { path: "visitor", component: VisitorComponent },
    { path: "professor", component: ProfessorComponent },
    { path: "student", component: StudentComponent },
    { path: "attendance", component: AttendanceComponent },
    { path: "subject-schedule-professor", component: AttendanceManagementProfessorComponent },
    { path: "subject-schedule-student", component: SubjectScheduleStudentComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: '**', redirectTo: '/login' },
];

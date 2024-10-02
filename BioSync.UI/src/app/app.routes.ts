import { Routes } from '@angular/router';
import { ScheduleComponent } from './schedule/schedule.component';
import { SubjectComponent } from './subject/subject.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { VisitorComponent } from './visitor/visitor.component';
import { ProfessorComponent } from './professor/professor.component';
import { StudentComponent } from './student/student.component';
import { AttendanceComponent } from './attendance/attendance.component';
import { LoginVisitorComponent } from './login-visitor/login-visitor.component';
import { SchoolYearComponent } from './school-year/school-year.component';
import { ProgramComponent } from './program/program.component';
import { LaboratoryComponent } from './laboratory/laboratory.component';
import { SectionComponent } from './section/section.component';
import { FacultyAttendanceComponent } from './faculty-attendance/faculty-attendance.component';
import {ScheduleListComponent} from "./schedule-list/schedule-list.component";
import {StartAttendanceComponent} from "./start-attendance/start-attendance.component";
import {ViewScheduleComponent} from "./view-schedule/view-schedule.component";
import {ViewAttendanceComponent} from "./view-attendance/view-attendance.component";
import { UserLoginComponent } from './user-login/user-login.component';
import { PasswordForgotComponent } from './password-forgot/password-forgot.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';

export const routes: Routes = [
    { path: "login", component: UserLoginComponent },
    { path: "user-login", component: UserLoginComponent},
    { path: "visitor-log", component: LoginVisitorComponent },
    { path: "forgot-password", component: PasswordForgotComponent },
    { path: "reset-password", component: PasswordResetComponent },
    { path: "dashboard", component: DashboardComponent },
    { path: "schedule", component: ScheduleComponent },
    { path: "subject", component: SubjectComponent },
    { path: "visitor", component: VisitorComponent },
    { path: "professor", component: ProfessorComponent },
    { path: "student", component: StudentComponent },
    { path: "attendance", component: AttendanceComponent },
    { path: "attendance/start/:id", component: StartAttendanceComponent },
    { path: "view/attendance/:id", component: ViewAttendanceComponent },
    { path: "school-year", component: SchoolYearComponent },
    { path: "program", component: ProgramComponent },
    { path: "section", component: SectionComponent },
    { path: "laboratory", component: LaboratoryComponent },
    { path: "faculty-attendance", component: FacultyAttendanceComponent },
    { path: 'schedule/start/:id', component: ScheduleListComponent },
    { path: 'view/schedule/:id', component: ViewScheduleComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: '**', redirectTo: '/login' },
];

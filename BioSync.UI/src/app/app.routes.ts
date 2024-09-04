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
import { SchoolYearComponent } from './school-year/school-year.component';
import { ProgramComponent } from './program/program.component';
import { LaboratoryComponent } from './laboratory/laboratory.component';
import { SectionComponent } from './section/section.component';
import { FacultyAttendanceComponent } from './faculty-attendance/faculty-attendance.component';
import { StudentScheduleComponent } from './student-schedule/student-schedule.component';

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
    { path: "school-year", component: SchoolYearComponent },
    { path: "program", component: ProgramComponent },
    { path: "section", component: SectionComponent },
    { path: "laboratory", component: LaboratoryComponent },
    { path: "faculty-attendance", component: FacultyAttendanceComponent },
    { path: "student-schedule", component:StudentScheduleComponent },
    { path: "subject-schedule-professor", component: AttendanceManagementProfessorComponent },
    { path: "subject-schedule-student", component: SubjectScheduleStudentComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: '**', redirectTo: '/login' },
];

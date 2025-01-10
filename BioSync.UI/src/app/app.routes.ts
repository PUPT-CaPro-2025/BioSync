import {Routes} from '@angular/router';
import {ScheduleComponent} from './schedule/schedule.component';
import {SubjectComponent} from './subject/subject.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {VisitorComponent} from './visitor/visitor.component';
import {ProfessorComponent} from './professor/professor.component';
import {StudentComponent} from './student/student.component';
import {AttendanceComponent} from './attendance/attendance.component';
import {
    LoginVisitorComponent
} from './visitor/login-visitor/login-visitor.component';
import {SchoolYearComponent} from './school-year/school-year.component';
import {ProgramComponent} from './program/program.component';
import {LaboratoryComponent} from './laboratory/laboratory.component';
import {SectionComponent} from './section/section.component';
import {
    ScheduleListComponent
} from "./schedule/schedule-list/schedule-list.component";
import {
    StartAttendanceComponent
} from "./attendance/start-attendance/start-attendance.component";
import {
    ViewScheduleComponent
} from "./schedule/view-schedule/view-schedule.component";
import {
    ViewAttendanceComponent
} from "./attendance/view-attendance/view-attendance.component";
import {UserLoginComponent} from './user-login/user-login.component';
import {
    PasswordForgotComponent
} from './password/password-forgot/password-forgot.component';
import {
    PasswordResetComponent
} from './password/password-reset/password-reset.component';
import {
    FacultyMyRequestComponent
} from './faculty-my-request/faculty-my-request.component';
import {
    RequestListScheduleComponent
} from './request-list-schedule/request-list-schedule.component';
import {
    AttendanceTypeComponent
} from "./attendance/attendance-type/attendance-type.component";
import {
    FaceRecognitionAttendanceComponent
} from "./attendance/face-recognition-attendance/face-recognition-attendance.component";
import { SuffixComponent } from './suffix/suffix.component';
import { VisitPurposeComponent } from './visit-purpose/visit-purpose.component';
import { AdminProfileComponent } from './admin-profile/admin-profile.component';
import { ManualAttendanceComponent } from './attendance/manual-attendance/manual-attendance.component';
import { ViolationComponent } from './violation/violation.component';

export const routes: Routes = [
    {path: "login", component: UserLoginComponent},
    {path: "visitor-log", component: LoginVisitorComponent},
    {path: "forgot-password", component: PasswordForgotComponent},
    {path: "reset-password", component: PasswordResetComponent},
    {path: "profile", component: AdminProfileComponent},
    {path: "dashboard", component: DashboardComponent},
    {path: "schedule", component: ScheduleComponent},
    {path: "requests", component: RequestListScheduleComponent},
    {path: "my-requests", component: FacultyMyRequestComponent},
    {path: "subject", component: SubjectComponent},
    {path: "visitor", component: VisitorComponent},
    {path: "professor", component: ProfessorComponent},
    {path: "student", component: StudentComponent},
    {path: "attendance", component: AttendanceComponent},
    {path: "violation", component: ViolationComponent},
    {path: "attendance/:id/select-type", component: AttendanceTypeComponent},
    {
        path: "attendance/fingerprint/start/:id",
        component: StartAttendanceComponent
    },
    {
        path: "attendance/face/start/:id",
        component: FaceRecognitionAttendanceComponent
    },
    {path: "attendance/manual/start/:id", component: ManualAttendanceComponent},
    {path: "view/attendance/:id", component: ViewAttendanceComponent},
    {path: "school-year", component: SchoolYearComponent},
    {path: "program", component: ProgramComponent},
    {path: "section", component: SectionComponent},
    {path: "laboratory", component: LaboratoryComponent},
    {path: "suffix", component: SuffixComponent},
    {path: "visit-purpose", component: VisitPurposeComponent},
    {path: 'schedule/start/:id', component: ScheduleListComponent},
    {path: 'view/schedule/:id', component: ViewScheduleComponent},
    {path: '', redirectTo: '/login', pathMatch: 'full'},
    {path: '**', redirectTo: '/login'},
];

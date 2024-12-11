import { Component, OnInit } from '@angular/core';
import { Schedule } from '../../../model/schedule.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ScheduleService } from '../../../services/schedule.service';
import { MatToolbar } from '@angular/material/toolbar';
import { SdkService } from '../../../services/sdk.service';
import { FingerprintService } from '../../../services/fingerprint.service';
import { User } from '../../../model/user.model';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { PromptConfirmComponent } from '../../prompt/prompt-confirm/prompt-confirm.component';
import { PromptOkayComponent } from '../../prompt/prompt-okay/prompt-okay.component';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { AttendanceService } from '../../../services/attendance.service';
import { CookieService } from '../../../services/cookie.service';
import { UserService } from '../../../services/user.service';
import { ClassResponse } from '../../../model/class.model';

@Component({
  selector: 'app-manual-attendance',
  standalone: true,
  imports: [
    MatToolbar,
    MatButton,
    FormsModule,
    MatIconModule,
    NgOptimizedImage,
    CommonModule,
  ],
  providers: [
    ScheduleService,
    SdkService,
    FingerprintService,
    AttendanceService,
    UserService,
  ],
  templateUrl: './manual-attendance.component.html',
  styleUrls: ['./manual-attendance.component.css', '../start-attendance/start-attendance.component.css'],
})
export class ManualAttendanceComponent implements OnInit {
  currentTime!: string;
  currentDate!: string;
  selectedProfessorId!: number;
  hasProfessorVerified = false;
  selectedSchedule!: Schedule;
  fingerprintImageSrc!: Blob;
  reminder = 'Fingerprint Verification Required';
  profileImageUrl!: string;
  hasFingerprintScanner = false;
  hasCamera = false;
  hasDevice = false;
  studentsLogged: User[] = [];
  class: ClassResponse[] = [];

  //new/temporary variables
  simulate = false;
  selectedStudentId: number | null = null;
  getStudent!: User | null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private scheduleService: ScheduleService,
    private sdkService: SdkService,
    private fingerprintService: FingerprintService,
    private dialog: MatDialog,
    private router: Router,
    private attendanceService: AttendanceService,
    private cookieService: CookieService,
    private userService: UserService,
  ) {}

  async ngOnInit() {
    this.updateTimeAndDate();
    setInterval(() => this.updateTimeAndDate(), 1000);
    this.activatedRoute.paramMap.subscribe({
      next: (params) => {
        const scheduleId = +params.get('id')!;
        this.getScheduleDetails(scheduleId);
      },
    });
    this.hasFingerprintScanner = await this.sdkService.loadSDK();
    this.hasCamera = true; // TODO: initiate camera reader
    this.hasDevice = this.hasCamera || this.hasFingerprintScanner;

    this.sdkService.getImageSrc().subscribe({
      next: (src) => {
        if (src) {
          this.fingerprintImageSrc = this.base64ToBlob(src, 'image/png');
        }
      },
    });
  }

  updateTimeAndDate(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    const formattedDate = now.toLocaleDateString('en-US', options);

    const match = formattedDate.match(/^(.*?), (\w+ \d{1,2}, \d{4})$/);
    if (match) {
      const [_, weekday, monthDayYear] = match;
      const [month, day, year] = monthDayYear.split(' ');
      this.currentDate = `${weekday.toUpperCase()}, ${month.charAt(0).toUpperCase()}${month.slice(1).toLowerCase()} ${day} ${year}`;
    } else {
      this.currentDate = formattedDate;
    }
  }

  getScheduleDetails(scheduleId: number) {
    this.scheduleService.getScheduleById(scheduleId).subscribe({
      next: (value) => {
        this.selectedSchedule = value;
        this.selectedProfessorId = value.professor?.id!;
        this.getUsersByScheduleId(value.id!);
        this.getLoggedStudents(value.id);
      },
    });
  }

  getUsersByScheduleId(scheduleId: number) {
    this.userService.getUsersByScheduleId(scheduleId).subscribe({
      next: (value: ClassResponse[]) => {
        this.class = value;
        console.log(this.class);
      },
      error: (err) => {
        console.error('Error fetching users by schedule ID:', err);
      },
    });
  }


  private base64ToBlob(base64: string, contentType: string) {
    return this.sdkService.base64ToBlob(base64, contentType);
  }

  selectStudent(id: number): void {
    this.selectedStudentId = id; 
  }

  pickStudent(): void {
    if (this.selectedStudentId !== null) {
      const foundClass = this.class
        .find(cls => cls.student.id === this.selectedStudentId);
  
      this.getStudent = foundClass ? foundClass.student : null;
      this.getUserProfileImage(this.selectedStudentId);
      this.reminder = 'Fingerprint Verification Required';
    }
  }

  //temporary function must do if fingerprint success
  simulateFingerprint(): void {
    this.simulate = true;
    this.reminder = 'Attendance Recorded';
  }

  getUserProfileImage(userId: number) {
    this.fingerprintService.getProfileImageUrl(userId).subscribe({
      next: (value: { profileImageUrl: string }) => {
        this.profileImageUrl = value.profileImageUrl;
        console.log(this.profileImageUrl);
      },
    });
  }

  openConfirmationDialog(schedule: Schedule) {
    const ref = this.dialog.open(PromptConfirmComponent, {
      width: '400px',
      data: {
        title: 'Stop Attendance',
        message:
          "Are you sure you want to stop attendance? Students that haven't logged will be marked as absent",
        action: 'Stop',
      },
    });

    ref.afterClosed().subscribe({
      next: (result) => {
        if (!result) return;
        this.stopAttendance(schedule);
      },
    });
  }

  openInformationDialog(message: string) {
    const ref = this.dialog.open(PromptOkayComponent, {
      width: '400px',
      data: {
        title: 'Attendance Stopped',
        message,
      },
    });

    ref.afterClosed().subscribe({
      next: () => {
        this.router.navigate(['/schedule']).then();
      },
    });
  }

  stopAttendance(schedule: Schedule) {
    this.fingerprintService.stopAttendance(schedule).subscribe({
      next: (value) => {
        this.openInformationDialog(value);
      },
    });
  }

  getLoggedStudents(scheduleId: number) {
    this.attendanceService.getStudentsLogged(scheduleId).subscribe({
      next: (value) => {
        this.studentsLogged = value;
      },
    });
  }

  protected readonly history = history;
}

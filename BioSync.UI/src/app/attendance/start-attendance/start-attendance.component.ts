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

@Component({
  selector: 'app-start-attendance',
  standalone: true,
  imports: [
    MatToolbar,
    MatButton,
    FormsModule,
    MatIconModule,
    NgOptimizedImage,
    CommonModule
  ],
  providers: [
    ScheduleService,
    SdkService,
    FingerprintService,
    AttendanceService,
    UserService
  ],
  templateUrl: './start-attendance.component.html',
  styleUrl: './start-attendance.component.css',
})
export class StartAttendanceComponent implements OnInit {
  currentTime!: string;
  currentDate!: string;
  selectedProfessorId!: number;
  hasProfessorVerified = false;
  selectedSchedule!: Schedule;
  fingerprintImageSrc!: Blob;
  instructions = 'Scan Professors Fingerprint to Start Attendance';
  reminder = 'Scanning In-Charge Fingerprint...';
  loggedProfessor!: User | null;
  loggedStudent!: User | null;
  studentVerified = false;
  profileImageUrl!: string;
  hasFingerprintScanner = false;
  hasCamera = false;
  hasDevice = false;
  studentsLogged: User[] = [];
  isError: boolean = false;
  isSuccess: boolean = false;
  isAlreadyLogged: boolean = false;

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
          if (!this.hasProfessorVerified) {
            this.submitProfessor();
          } else {
            this.submitStudent();
          }
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
        this.getLoggedStudents(value.id);
      },
    });
  }

  private base64ToBlob(base64: string, contentType: string) {
    return this.sdkService.base64ToBlob(base64, contentType);
  }

  submitProfessor() {
    const formData = new FormData();

    formData.append('userId', this.selectedProfessorId.toString());
    formData.append('fingerprint', this.fingerprintImageSrc, 'fingerprint.png');

    this.fingerprintService
      .verifyProfessorFingerprintForAttendance(formData)
      .subscribe({
        next: (value) => {
          if (value)
            this.userService.getUserById(this.selectedProfessorId).subscribe({
              next: (professor) => {
                this.loggedProfessor = professor;
              },
            });
            const actualTimeStart = this.cookieService.getCookie("actualTimeStart");
            if (!actualTimeStart) {
              this.cookieService.setCookie('actualTimeStart', Date.now().toString());
            }
            this.reminder = 'Fingerprint verified, Starting Attendance...';
            this.isSuccess = true;
          setTimeout(() => {
            this.instructions = 'Scan Fingerprint to Log Attendance';
            this.reminder = 'Scan Student Fingerprint';
            this.hasProfessorVerified = true;
            this.loggedProfessor = null;
            this.isSuccess = false;
          }, 3000);
        },
        error: (err) => {
          console.log(err);
          this.isError = true;
          setTimeout(() => {
            this.reminder = 'Scanning In-Charge Fingerprint...';
            this.isError = false;
          }, 3000);
        },
      });
  }

  submitStudent() {
    const formData = new FormData();

    formData.append('sectionId', `${this.selectedSchedule.section?.id}`);
    formData.append('scheduleId', `${this.selectedSchedule.id}`);
    formData.append('fingerprint', this.fingerprintImageSrc, 'fingerprint.png');

    const actualTimeStart = parseInt(<string>this.cookieService.getCookie(
        "actualTimeStart"));
    const currentTime = Date.now();
    const timeDifferenceInMinutes = (currentTime - actualTimeStart) / (1000 * 60);
    const isStudentLate = timeDifferenceInMinutes > 30;
    formData.append('status', isStudentLate ? "LATE" : "PRESENT");

    this.fingerprintService.verifyStudentTimeInAttendance(formData).subscribe({
      next: (value) => {
        const isAlreadyLoggedStudent = this.studentsLogged.find(
          (student) => student.id === value.student.id
        );
  
        if (isAlreadyLoggedStudent) {
          this.reminder = 'Attendance has already been recorded';
          this.loggedStudent = value.student;
          this.isSuccess = true;
          this.isAlreadyLogged = true;
          setTimeout(() => {
            this.reminder = 'Scan Student Fingerprint';
            this.isAlreadyLogged = false;
            this.isSuccess = false;
          }, 3000);
          return;
        }

        this.loggedStudent = value.student;
        this.studentsLogged.push(this.loggedStudent);
        this.reminder = 'Attendance Recorded';
        this.isSuccess = true;
        this.getUserProfileImage(value.student.id);
        setTimeout(() => {
          this.loggedStudent = null;
          this.studentVerified = true;
          this.profileImageUrl = '';
          this.reminder = 'Scan Student Fingerprint';
          this.isSuccess = false;
        }, 3000);
      },
      error: (err) => {
        this.reminder = err['error'];
        this.isError = true;
        setTimeout(() => {
          this.reminder = 'Scan Student Fingerprint';
          this.isError = false;
        }, 2000);
      },
    });
  }

  getUserProfileImage(userId: number) {
    this.fingerprintService.getProfileImageUrl(userId).subscribe({
      next: (value: { profileImageUrl: string }) => {
        this.profileImageUrl = value.profileImageUrl;
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
      next: () => {
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
}

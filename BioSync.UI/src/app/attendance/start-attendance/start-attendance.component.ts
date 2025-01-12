import {Component, HostListener, OnInit} from '@angular/core';
import { Schedule } from '../../../model/schedule.model';
import {ActivatedRoute, Router} from '@angular/router';
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
import {MatProgressSpinner} from "@angular/material/progress-spinner";

@Component({
  selector: 'app-start-attendance',
  standalone: true,
  imports: [
    MatToolbar,
    MatButton,
    FormsModule,
    MatIconModule,
    NgOptimizedImage,
    CommonModule,
    MatProgressSpinner,
  ],
  providers: [
    ScheduleService,
    SdkService,
    FingerprintService,
    AttendanceService,
    UserService,
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
  id!: number;
  loading = false;
  private buffer: string = '';
  private scanTimeout: any;
  private readonly debounceTime = 50;
  scannedCode: string = '';
  isBarcode = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private scheduleService: ScheduleService,
    private sdkService: SdkService,
    private fingerprintService: FingerprintService,
    private dialog: MatDialog,
    private router: Router,
    private attendanceService: AttendanceService,
    private cookieService: CookieService,
  ) {}

  async ngOnInit() {
    this.updateTimeAndDate();
    setInterval(() => this.updateTimeAndDate(), 1000);
    this.activatedRoute.paramMap.subscribe({
      next: (params) => {
        const scheduleId = +params.get('id')!;
        this.id = scheduleId;
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
    this.setLoadingProf();
    const formData = new FormData();

    formData.append('userId', this.selectedProfessorId.toString());
    formData.append('fingerprint', this.fingerprintImageSrc, 'fingerprint.png');

    this.fingerprintService
      .verifyProfessorFingerprintForAttendance(formData)
      .subscribe({
        next: (value) => {
          if (value)
            this.loggedProfessor = value;
            this.getUserProfileImage(value.id);
            this.cookieService.setCookie(
              'actualTimeStart',
              Date.now().toString(),
            );
          this.reminder = 'Fingerprint verified, Starting Attendance...';
          this.isSuccess = true;
          this.loading = false;
          setTimeout(() => {
            this.reminder = 'Scan Student Fingerprint';
            this.hasProfessorVerified = true;
            this.loggedProfessor = null;
            this.profileImageUrl = '';
            this.isSuccess = false;
          }, 3000);
        },
        error: (err) => {
          console.log(err);
          this.isError = true;
          this.loading = false;
          setTimeout(() => {
            this.reminder = 'Scanning In-Charge Fingerprint...';
            this.isError = false;
          }, 3000);
        },
      });
  }

  private setLoadingProf(){
    this.loading = true;
    this.loggedProfessor = null;
    this.profileImageUrl = '';
    this.isSuccess = false;
    this.isError = false;
  }

  submitStudent() {
    this.setLoadingStudent();

    const formData = new FormData();

    formData.append('sectionId', `${this.selectedSchedule.section?.id}`);
    formData.append('scheduleId', `${this.selectedSchedule.id}`);
    formData.append('fingerprint', this.fingerprintImageSrc, 'fingerprint.png');

    const actualTimeStart = parseInt(
      <string>this.cookieService.getCookie('actualTimeStart'),
    );
    const currentTime = Date.now();
    const timeDifferenceInMinutes =
      (currentTime - actualTimeStart) / (1000 * 60);
    const isStudentLate = timeDifferenceInMinutes > 30;
    formData.append('status', isStudentLate ? 'LATE' : 'PRESENT');

    this.fingerprintService.verifyStudentTimeInAttendance(formData).subscribe({
      next: (value) => {
        this.loggedStudent = value.student;
        this.studentsLogged.push(this.loggedStudent);
        this.reminder = 'Attendance Recorded';
        this.isSuccess = true;
        this.getUserProfileImage(value.student.id);
        this.loading = false;
        setTimeout(() => {
          this.loggedStudent = null;
          this.studentVerified = true;
          this.profileImageUrl = '';
          this.reminder = 'Scan Student Fingerprint';
          this.isSuccess = false;
        }, 3000);
      },
      error: (err) => {
        if (err.status == 409) {
          this.reminder = 'Attendance has already been recorded';
          this.loggedStudent = this.studentsLogged.find(
            (student) => student.id == err.error,
          )!;
          this.isAlreadyLogged = true;
        } else {
          this.isError = true;
          this.reminder = '';
        }
        this.loading = false;
        setTimeout(() => {
          this.loggedStudent = null;
          this.reminder = 'Scan Student Fingerprint';
          this.isAlreadyLogged = false;
          this.isError = false;
        }, 3000);
      },

    });

  }

  private setLoadingStudent(){
    this.loading = true;
    this.loggedStudent = null;
    this.profileImageUrl = '';
    this.isSuccess = false;
    this.isAlreadyLogged = false;
    this.isError = false;
    this.reminder = 'Scan Student Fingerprint';
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

  goToManualAttendance() {
    const url = this.router.serializeUrl(this.router.createUrlTree([`attendance/manual/start/`, this.id]));
    window.open(url, '_blank');
  }

  handleBackEvent(){
    this.router.navigate(['/schedule']).then();
  }

  sendAttendance(usercode: string){
    this.loading = true;
    const formData = new FormData();
    formData.append('usercode', usercode);
    formData.append('scheduleId', this.id.toString());

    const actualTimeStart = parseInt(<string>this.cookieService.getCookie(
        "actualTimeStart"));
    const currentTime = Date.now();
    const timeDifferenceInMinutes = (currentTime - actualTimeStart) / (1000 * 60);
    const isStudentLate = timeDifferenceInMinutes > 30;
    formData.append('attendanceStatus', isStudentLate ? "LATE" : "PRESENT");



    this.attendanceService.logAttendance(formData).subscribe({
      next: (value) => {
        this.loggedStudent = value;
        let hasLogged = false;
        console.log(this.studentsLogged)
        console.log(this.loggedStudent);

        this.studentsLogged.some((loggedStudent) => {
          hasLogged = loggedStudent.id == this.loggedStudent!.id;
        })

        if(hasLogged){
          this.reminder = 'Attendance has already been recorded';
          this.isAlreadyLogged = true;
        } else {
          this.studentsLogged.push(this.loggedStudent);
          this.reminder = 'Attendance Recorded';
          this.isSuccess = true;
          this.getUserProfileImage(value.id);
        }
        this.loading = false;
        setTimeout(() => {
          this.loggedStudent = null;
          this.studentVerified = true;
          this.profileImageUrl = '';
          this.reminder = 'Scan Student Fingerprint';
          this.isSuccess = false;
          this.isAlreadyLogged = false;
        }, 3000);
      },
      error: () => {
        this.isError = true;
        this.isBarcode = true;
        this.reminder = '';
        this.loading = false;
        setTimeout(() => {
          this.loggedStudent = null;
          this.reminder = 'Scan Student Fingerprint';
          this.isAlreadyLogged = false;
          this.isError = false;
        }, 3000);
      }
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (this.scanTimeout) {
      clearTimeout(this.scanTimeout);
    }

    if (event.key === 'Enter') {
      if(this.buffer === '') return;

      this.scannedCode = this.buffer;

      const cleanedCode = this.scannedCode.replace(/Shift/g, '');

      if (!this.hasProfessorVerified) {
        this.verifyProfessorCode(cleanedCode);
      } else {
        this.sendAttendance(cleanedCode)
      }
      this.buffer = '';
    } else if (!event.ctrlKey && !event.altKey && !event.metaKey) {
      this.buffer += event.key;

      this.scanTimeout = setTimeout(() => {
        this.buffer = '';
      }, this.debounceTime);
    }
  }

  protected readonly history = history;

  private verifyProfessorCode(usercode: string) {
    this.loading = true;
    this.isBarcode = true;
    const professor = this.selectedSchedule.professor!;

    if(usercode === professor.usercode) {
      this.loggedProfessor = professor;
      this.getUserProfileImage(professor.id);
      this.cookieService.setCookie(
          'actualTimeStart',
          Date.now().toString(),
      );
      this.reminder = 'Usercode Verified, Starting Attendance...';
      this.isSuccess = true;
      this.loading = false;
      setTimeout(() => {
        this.reminder = 'Scan Student Fingerprint';
        this.hasProfessorVerified = true;
        this.loggedProfessor = null;
        this.profileImageUrl = '';
        this.isSuccess = false;
      }, 3000);
    } else {
      this.isError = true;
      this.loading = false;
      setTimeout(() => {
        this.reminder = 'Scanning In-Charge Fingerprint...';
        this.isError = false;
      }, 3000);
    }
  }
}

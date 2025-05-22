import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild
} from '@angular/core';
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
import { PromptContinueComponent } from '../../prompt/prompt-continue/prompt-continue.component';
import { PromptOkayComponent } from '../../prompt/prompt-okay/prompt-okay.component';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { AttendanceService } from '../../../services/attendance.service';
import { CookieService } from '../../../services/cookie.service';
import { UserService } from '../../../services/user.service';
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {CryptoService} from "../../../services/crypto.service";
import {
  LogAttendanceComponent
} from "../../prompt/log-attendance/log-attendance.component";

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
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
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
  studentsLoggedOut: User [] = [];
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
  isTimeOut = false;
  adminDetails!: User;
  isCustomDialogOpen = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private scheduleService: ScheduleService,
    private sdkService: SdkService,
    private fingerprintService: FingerprintService,
    private dialog: MatDialog,
    private router: Router,
    private attendanceService: AttendanceService,
    private cookieService: CookieService,
    private cdr: ChangeDetectorRef,
    private cryptoService: CryptoService,
    private userService: UserService,
  ) {}

  async ngOnInit() {
    this.updateTimeAndDate();
    this.getAdminDetails();
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
            if(this.isTimeOut){
              this.submitStudentTimeOut()
            } else {
              this.submitStudentTimeIn();
            }
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
        error: () => {
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

  submitStudentTimeIn() {
    this.setLoadingStudent();
    const formData = this.setFormData();

    formData.append('status',
        this.isStudentLate() ? 'LATE' : 'PRESENT');

    this.fingerprintService.verifyStudentTimeInAttendance(formData).subscribe({
      next: (value) => {
        this.setActualTimeStart();
        this.loggedStudent = value.student;
        this.studentsLogged.push(this.loggedStudent);
        this.cdr.detectChanges();
        this.scrollToBottom();
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

  private setActualTimeStart() {
    if (this.studentsLogged.length < 1) {
      this.cookieService.setCookie(
          'actualTimeStart',
          Date.now().toString(),
      );
    }
  }

  private getActualTimeStart() {
      return this.cookieService.getCookie(
          'actualTimeStart'
      )!;
  }

  private isStudentLate() {
    if(this.studentsLogged.length < 1) return false;

    const currentTime = Date.now();
    const timeDifferenceInMinutes =
        (currentTime - +this.getActualTimeStart()) / (1000 * 60);
    return timeDifferenceInMinutes > 30;
  }

  submitStudentTimeOut() {
    this.setLoadingStudent();
    const formData = this.setFormData();

    this.fingerprintService.verifyStudentTimeOutAttendance(formData).subscribe({
      next: (value) => {
        this.loggedStudent = value.student;
        this.studentsLoggedOut.push(this.loggedStudent);
        this.reminder = 'Timed Out, Good Bye!';
        this.isSuccess = true;
        this.getUserProfileImage(this.loggedStudent.id);
        this.loading = false;
        setTimeout(() => {
          this.loggedStudent = null;
          this.studentVerified = true;
          this.profileImageUrl = '';
          this.reminder = 'Time Out Student';
          this.isSuccess = false;
        }, 3000);
      },
      error: (error) => {
        if (error.status == 409) {
          this.reminder = 'Already timed out';
          this.loggedStudent = this.studentsLogged.find(
              (student) => student.id == error.error,
          )!;
          this.isAlreadyLogged = true;
        } else {
          this.isError = true;
          this.reminder = '';
        }
        this.loading = false;
        setTimeout(() => {
          this.loggedStudent = null;
          this.reminder = 'Time Out Student';
          this.isAlreadyLogged = false;
          this.isError = false;
        }, 3000);
      },

    });

  }

  private setFormData() {
    const formData = new FormData();

    formData.append('sectionId', `${this.selectedSchedule.section?.id}`);
    formData.append('scheduleId', `${this.selectedSchedule.id}`);
    formData.append('fingerprint', this.fingerprintImageSrc,
        'fingerprint.png');
    return formData;
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
      },
    });
  }

  getUserId() {
    const encryptedUserId = decodeURIComponent(
        this.cookieService.getCookie('user_id')!,
    );
    return +this.cryptoService.decrypt(encryptedUserId);
  }

  getAdminDetails(){
    const adminId = this.getUserId();

    this.userService.getUserById(adminId).subscribe({
      next: (user: User) => {
        this.adminDetails = user;
      }
    })
  }

  openConfirmationDialogStop(schedule: Schedule) {
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

  openLogAttendanceDialog(schedule: Schedule, click = false) {
    if (!click) return;

    const ref = this.dialog.open(LogAttendanceComponent, {
      width: '400px',
      data: {
        title: 'Log Student',
        scheduleId: schedule.id,
      },
    });

    ref.afterClosed().subscribe({
      next: (result) => {
        if (!result) return;

        if(this.isTimeOut) {
          this.sendBarcodeTimeOut(result);
        } else {
          this.sendBarcodeTimeIn(result);
        }
      },
    });
  }

  openConfirmationDialogTimeOut() {
    const ref = this.dialog.open(PromptConfirmComponent, {
      width: '400px',
      data: {
        title: 'Start Individual Time Out',
        message:
            "Are you sure you want to start individual time out?",
        action: 'Start',
      },
    });

    ref.afterClosed().subscribe({
      next: (result) => {
        if (!result) return;
        this.isTimeOut = true;
        this.reminder = 'Time Out Student'
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

    this.attendanceService.getStudentsLoggedOut(scheduleId).subscribe({
      next: (value) => {
        this.studentsLoggedOut = value;
      },
    });
  }

  sendBarcodeTimeIn(usercode: string){
    this.loading = true;

    if (usercode.startsWith('CapsLock')) {
      usercode = usercode.slice('CapsLock'.length);
    }

    const formData = new FormData();
    formData.append('usercode', usercode);
    formData.append('scheduleId', this.id.toString());

    formData.append('attendanceStatus',
        this.isStudentLate() ? "LATE" : "PRESENT");

    this.attendanceService.logAttendance(formData).subscribe({
      next: (value) => {
        this.setActualTimeStart();
        this.isError = false;
        this.loggedStudent = value;
        this.studentsLogged.push(this.loggedStudent);
        this.cdr.detectChanges();
        this.scrollToBottom();
        this.reminder = 'Attendance Recorded';
        this.isSuccess = true;
        this.getUserProfileImage(value.id);
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
        this.isBarcode = true;
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

    sendBarcodeTimeOut(usercode: string){
      this.loading = true;

      if (usercode.startsWith('CapsLock')) {
        usercode = usercode.slice('CapsLock'.length);
      }

    const formData = new FormData();
    formData.append('usercode', usercode);
    formData.append('scheduleId', this.id.toString());

    this.attendanceService.logOutAttendance(formData).subscribe({
      next: (value) => {
        this.isError = false;
        this.loggedStudent = value;
        this.studentsLoggedOut.push(this.loggedStudent);
        this.reminder = 'Timed Out, Good Bye!';
        this.isSuccess = true;
        this.getUserProfileImage(value.id);
        this.loading = false;
        setTimeout(() => {
          this.loggedStudent = null;
          this.studentVerified = true;
          this.profileImageUrl = '';
          this.reminder = 'Time Out Student';
          this.isSuccess = false;
          this.isAlreadyLogged = false;
        }, 3000);
      },
      error: (err) => {
        if (err.status == 409) {
          this.reminder = 'Already timed out';
          this.loggedStudent = this.studentsLogged.find(
              (student) => student.id == err.error,
          )!;
          this.isAlreadyLogged = true;
        } else {
          this.isError = true;
          this.reminder = '';
        }
        this.isBarcode = true;
        this.loading = false;
        setTimeout(() => {
          this.loggedStudent = null;
          this.reminder = 'Time Out Student';
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
        if(this.isTimeOut){
          this.sendBarcodeTimeOut(cleanedCode)
        } else {
          this.sendBarcodeTimeIn(cleanedCode)
        }
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

    if (usercode.startsWith('CapsLock')) {
      usercode = usercode.slice('CapsLock'.length);
    }

    this.isBarcode = true;
    const professor = this.selectedSchedule.professor!;

    if(usercode === professor.usercode || usercode === this.adminDetails.usercode) {

      if(usercode === professor.usercode) {
        this.loggedProfessor = professor;
        this.getUserProfileImage(professor.id);
      } else {
        this.loggedProfessor = this.adminDetails;
        this.getUserProfileImage(this.adminDetails.id);
      }

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

  isStudentLoggedOut(student: User): boolean {
    return this.studentsLoggedOut.some(loggedOutStudent => loggedOutStudent.id === student.id) && this.isTimeOut;
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    }, 0);
  }

  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload(event: BeforeUnloadEvent): void {
    if (!this.isCustomDialogOpen) {
      event.preventDefault();
    }
  }

  openContinueDialog(){
      const ref = this.dialog.open(PromptContinueComponent, {
        width: '350px',
        data: {
          title: "Go back to Schedule List",
          message: "Are you sure you want to go back?",
        }
      })

      ref.afterClosed().subscribe({
        next: result => {
          if (!result) return

          this.router.navigate(['/schedule']).then();
        }
      })
  }
}

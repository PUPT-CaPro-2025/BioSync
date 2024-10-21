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
import {NgOptimizedImage} from "@angular/common";

@Component({
  selector: 'app-face-recognition-attendance',
  standalone: true,
  imports: [MatToolbar, MatButton, FormsModule, MatIconModule, NgOptimizedImage],
  providers: [ScheduleService, SdkService, FingerprintService],
  templateUrl: './face-recognition-attendance.component.html',
  styleUrls: ['./face-recognition-attendance.component.css', '../start-attendance/start-attendance.component.css']
})
export class FaceRecognitionAttendanceComponent implements OnInit {
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
  selectedDevice: string = '';
  profileImageUrl!: string;
  hasFingerprintScanner = false;
  hasBarcodeScanner = false;
  hasDevice = false;
  notRegistered = true;
  notEnrolled = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private scheduleService: ScheduleService,
    private sdkService: SdkService,
    private fingerprintService: FingerprintService,
    private dialog: MatDialog,
    private router: Router,
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
    await this.sdkService.loadSDK();
    this.hasBarcodeScanner = false; // TODO: initiate barcode reader
    this.hasDevice = this.hasBarcodeScanner || this.hasFingerprintScanner;

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
      hour12: true
    });

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
        console.log(this.selectedProfessorId);
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
            this.reminder = 'Fingerprint verified, Starting Attendance...';
          setTimeout(() => {
            this.hasProfessorVerified = true;
            this.instructions = 'Scan Fingerprint to Log Attendance';
            this.reminder = 'Scanning...';
          }, 2000);
        },
        error: (err) => {
          console.log(err);
          this.reminder = err['error'];
          setTimeout(() => {
            this.reminder = 'Scanning In-charge fingerprint...';
          }, 3000);
        },
      });
  }

  submitStudent() {
    const formData = new FormData();

    formData.append('sectionId', `${this.selectedSchedule.section?.id}`);
    formData.append('scheduleId', `${this.selectedSchedule.id}`);
    formData.append('fingerprint', this.fingerprintImageSrc, 'fingerprint.png');

    this.fingerprintService.verifyStudentTimeInAttendance(formData).subscribe({
      next: (value) => {
        this.loggedStudent = value.student;
        this.reminder = 'WELCOME';
        this.getUserProfileImage(value.student.id);
        setTimeout(() => {
          this.studentVerified = true;
          this.loggedStudent = null;
          this.profileImageUrl = "";
          this.reminder = 'Scanning...';
        }, 3000);
      },
      error: (err) => {
        this.reminder = err['error'];
        setTimeout(() => {
          this.reminder = 'Scanning...';
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

  //temporary data
  logstudents = [
    'Kylie Ross Ayacocho',
    'Andronicus Dimasacat',
    'Jhean Khendrick Galope',
    'Christian Harrel Go'
  ]
}

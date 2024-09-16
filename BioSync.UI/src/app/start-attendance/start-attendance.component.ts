import {Component, OnInit} from '@angular/core';
import {Schedule} from "../../model/schedule.model";
import {ActivatedRoute} from "@angular/router";
import {ScheduleService} from "../../services/schedule.service";
import {MatToolbar} from "@angular/material/toolbar";
import {SdkService} from "../../services/sdk.service";
import {FingerprintService} from "../../services/fingerprint.service";
import {User} from "../../model/user.model";

@Component({
  selector: 'app-start-attendance',
  standalone: true,
  imports: [
    MatToolbar
  ],
  providers: [ScheduleService, SdkService, FingerprintService],
  templateUrl: './start-attendance.component.html',
  styleUrl: './start-attendance.component.css'
})
export class StartAttendanceComponent implements OnInit{
  selectedProfessorId!: number;
  hasProfessorVerified = false;
  selectedSchedule!: Schedule;
  fingerprintImageSrc!: Blob;
  instructions = "Scan Professors Fingerprint to Start Attendance";
  reminder = "Scan now";
  loggedStudent!: User | null;
  studentVerified = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private scheduleService: ScheduleService,
    private sdkService: SdkService,
    private fingerprintService: FingerprintService
  ) {}

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe({
      next: params => {
        const scheduleId = +params.get('id')!;
        this.getScheduleDetails(scheduleId);
      }
    })
    this.sdkService.loadSDK();

    this.sdkService.getImageSrc().subscribe({
      next: (src) => {
        if (src) {
          this.fingerprintImageSrc = this.base64ToBlob(src, 'image/png');
          if(!this.hasProfessorVerified){
            this.submitProfessor();
          } else {
            this.submitStudent();
          }
        }
      }
    });
  }

  getScheduleDetails(scheduleId: number){
    this.scheduleService.getScheduleById(scheduleId).subscribe({
      next: value => {
        this.selectedSchedule = value;
        this.selectedProfessorId = value.professor?.id!;
        console.log(this.selectedProfessorId);
      }
    })
  }

  getMonth(date: string){
    return this.scheduleService.getMonth(date);
  }

  getDay(date: string){
    return this.scheduleService.getDay(date);
  }

  private base64ToBlob(base64: string, contentType: string) {
    return this.sdkService.base64ToBlob(base64, contentType);
  }

  submitProfessor(){
    const formData = new FormData();

    formData.append('userId', this.selectedProfessorId.toString());
    formData.append('fingerprint', this.fingerprintImageSrc, 'fingerprint.png')

    this.fingerprintService.verifyProfessorFingerprintForAttendance(formData).subscribe({
      next: value => {
        if(value)
          this.reminder = 'Fingerprint verified, Starting Attendance...'
          setTimeout(() => {
            this.hasProfessorVerified = true;
            this.instructions = "Scan Fingerprint to Log Attendance";
            this.reminder = "Scan now"
          }, 2000);
      },
      error: (err) => {
        console.log(err)
        this.reminder = err["error"];
        setTimeout(() => {
          this.reminder = 'Scan now'
        }, 3000);
      }
    })

  }

  submitStudent(){
    const formData = new FormData();

    formData.append('sectionId', `${this.selectedSchedule.section?.id}`);
    formData.append('scheduleId', `${this.selectedSchedule.id}`);
    formData.append('fingerprint', this.fingerprintImageSrc, 'fingerprint.png')

    this.fingerprintService.verifyStudentTimeInAttendance(formData).subscribe({
      next: value => {
        this.loggedStudent = value.student;
        console.log(this.loggedStudent);
        this.reminder = 'Attendance Logged'
        setTimeout(() => {
          this.studentVerified = true;
          this.loggedStudent = null;
          this.reminder = 'Scan now';
        }, 3000)
      },
      error: err => {
        this.reminder = err['error'];
        setTimeout(() => {
          this.reminder = 'Scan now';
        }, 2000)
      }
    })
  }

}

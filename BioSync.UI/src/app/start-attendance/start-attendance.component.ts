import {Component, OnInit} from '@angular/core';
import {Schedule} from "../../model/schedule.model";
import {ActivatedRoute} from "@angular/router";
import {ScheduleService} from "../../services/schedule.service";
import {MatToolbar} from "@angular/material/toolbar";
import {FingerprintService} from "../../services/fingerprint.service";

@Component({
  selector: 'app-start-attendance',
  standalone: true,
  imports: [
    MatToolbar
  ],
  providers: [ScheduleService, FingerprintService],
  templateUrl: './start-attendance.component.html',
  styleUrl: './start-attendance.component.css'
})
export class StartAttendanceComponent implements OnInit{
  selectedProfessorId!: number;
  selectedSchedule!: Schedule;
  fingerprintImageSrc!: Blob;

  constructor(
    private activatedRoute: ActivatedRoute,
    private scheduleService: ScheduleService,
    private fingerprintService: FingerprintService
  ) {}

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe({
      next: params => {
        const scheduleId = +params.get('id')!;
        this.getScheduleDetails(scheduleId);
      }
    })
    this.fingerprintService.loadSDK();

    this.fingerprintService.getImageSrc().subscribe({
      next: (src) => {
        if (src) {
          this.fingerprintImageSrc = this.base64ToBlob(src, 'image/png');
          this.submit();
        }
      }
    });
  }

  getScheduleDetails(scheduleId: number){
    this.scheduleService.getScheduleById(scheduleId).subscribe({
      next: value => {
        this.selectedSchedule = value;
        this.selectedProfessorId = value.professor?.id!;
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
    return this.fingerprintService.base64ToBlob(base64, contentType);
  }

  submit(){
    const formData = new FormData();

    formData.append('userId', this.selectedProfessorId.toString());
    formData.append('fingerprint', this.fingerprintImageSrc, 'fingerprint.png')


    for (let pair of (formData as any).entries()) {
      console.log(pair[0] + ':', pair[1]);
    }

  }



}

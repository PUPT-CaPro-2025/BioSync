import {Component, OnInit} from '@angular/core';
import {MatToolbar} from "@angular/material/toolbar";
import {Schedule} from "../../model/schedule.model";
import {ActivatedRoute} from "@angular/router";
import {ScheduleService} from "../../services/schedule.service";
import {MatIcon} from "@angular/material/icon";
import {AttendanceService} from "../../services/attendance.service";
import {Attendance} from "../../model/attendance.model";

@Component({
  selector: 'app-view-attendance',
  standalone: true,
  imports: [
    MatToolbar,
    MatIcon
  ],
  providers: [ScheduleService, AttendanceService],
  templateUrl: './view-attendance.component.html',
  styleUrls: ['./view-attendance.component.css', '../schedule/schedule.component.css' ]
})
export class ViewAttendanceComponent implements OnInit {
  schedule!: Schedule;
  class: Attendance[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private scheduleService: ScheduleService,
    private attendanceService: AttendanceService
  ) {}

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      const id = params.get('id');
      this.getScheduleDetails(+id!);
      this.getAttendance(+id!);
    });
  }

  getAttendance(scheduleId: number){
    this.attendanceService.getAttendanceByScheduleId(scheduleId).subscribe({
      next: value => {
        this.class = value;
      }
    })
  }

  getScheduleDetails(scheduleId: number){
    this.scheduleService.getScheduleById(scheduleId).subscribe({
      next: value => {
        this.schedule = value;
      }
    })
  }

  convertTo12HourFormat(string: string){
    return this.scheduleService.convertTimeFormat(string);
  }

  returnToSchoolYearView() {
    history.back()
  }
}

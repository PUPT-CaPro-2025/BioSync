import {Component, OnInit} from '@angular/core';
import {Schedule} from "../../model/schedule.model";
import {ActivatedRoute} from "@angular/router";
import {ScheduleService} from "../../services/schedule.service";
import {MatToolbar} from "@angular/material/toolbar";

@Component({
  selector: 'app-start-attendance',
  standalone: true,
  imports: [
    MatToolbar
  ],
  providers: [ScheduleService],
  templateUrl: './start-attendance.component.html',
  styleUrl: './start-attendance.component.css'
})
export class StartAttendanceComponent implements OnInit{
  selectedSchedule!: Schedule;

  constructor(
    private activatedRoute: ActivatedRoute,
    private scheduleService: ScheduleService
  ) {}

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe({
      next: params => {
        const scheduleId = +params.get('id')!;
        this.getScheduleDetails(scheduleId);
      }
    })
  }

  getScheduleDetails(scheduleId: number){
    this.scheduleService.getScheduleById(scheduleId).subscribe({
      next: value => {
        this.selectedSchedule = value;
      }
    })
  }

  getMonth(date: string){
    return this.scheduleService.getMonth(date);
  }

  getDay(date: string){
    return this.scheduleService.getDay(date);
  }

}

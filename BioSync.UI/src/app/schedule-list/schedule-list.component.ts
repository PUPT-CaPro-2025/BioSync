import {Component, OnInit} from '@angular/core';
import {MatToolbar} from "@angular/material/toolbar";
import {Schedule} from "../../model/schedule.model";
import {ScheduleService} from "../../services/schedule.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'app-schedule-list',
  standalone: true,
  imports: [
    MatToolbar,
    MatIcon
  ],
  providers: [ScheduleService],
  templateUrl: './schedule-list.component.html',
  styleUrls: ['./schedule-list.component.css', '../schedule/schedule.component.css']
})
export class ScheduleListComponent implements OnInit {
  schedules: Schedule[] = [];
  schedule!: Schedule;
  recurrenceId: string | null | undefined;

  constructor(
    private scheduleService: ScheduleService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      this.recurrenceId = params.get('id');
      if(this.recurrenceId)
        this.getSchedulesByRecurrenceId(this.recurrenceId!);
    });
  }

  getSchedulesByRecurrenceId(recurrenceId: string){
    this.scheduleService.getSchedulesByRecurrenceId(recurrenceId).subscribe({
      next: (schedules: Schedule[]) => {
        const today = new Date().setHours(0, 0, 0, 0);

        const futureSchedules = schedules.filter(schedule => new Date(schedule.scheduleDate).getTime() >= today);
        const pastSchedules = schedules.filter(schedule => new Date(schedule.scheduleDate).getTime() < today);

        futureSchedules.sort((a, b) => new Date(a.scheduleDate).getTime() - new Date(b.scheduleDate).getTime());
        pastSchedules.sort((a, b) => new Date(b.scheduleDate).getTime() - new Date(a.scheduleDate).getTime());

        this.schedules = [...futureSchedules, ...pastSchedules];

        this.schedule = this.schedules[0];
      }
    })
  }

  getDayOfWeek(date: string | Date) {
    return this.scheduleService.getDayOfWeek(date);
  }

  convertTimeFormat(time: string) {
    return this.scheduleService.convertTimeFormat(time);
  }

  toggleStartSchedule(schedule: Schedule) {
    this.router.navigate(['/attendance/start/', schedule.id]).then();
  }
}

import {Component, OnInit} from '@angular/core';
import {MatToolbar} from "@angular/material/toolbar";
import {Schedule} from "../../../model/schedule.model";
import {ScheduleService} from "../../../services/schedule.service";
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
  styleUrls: ['./schedule-list.component.css', '../schedule.component.css']
})
export class ScheduleListComponent implements OnInit {
  schedules: Schedule[] = [];
  schedule!: Schedule;
  recurrenceId: string | null | undefined;
  today: number;

  constructor(
    private scheduleService: ScheduleService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.today = new Date().setHours(0, 0, 0, 0);
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      this.recurrenceId = params.get('id');
      if(this.recurrenceId)
        this.getSchedulesByRecurrenceId(this.recurrenceId!);
    });
  }

  getSchedulesByRecurrenceId(recurrenceId: string) {
    this.scheduleService.getSchedulesByRecurrenceId(recurrenceId).subscribe({
      next: (schedules: Schedule[]) => {
        const today = this.today;

        const futureSchedules = schedules.filter(schedule =>
          new Date(schedule.scheduleDate).getTime() >= today && !schedule.hasFinished
        );

        const finishedSchedules = schedules.filter(schedule =>
          schedule.hasFinished && new Date(schedule.scheduleDate).getTime() >= today
        );

        const pastSchedules = schedules.filter(schedule =>
          new Date(schedule.scheduleDate).getTime() < today && !schedule.hasFinished
        );

        futureSchedules.sort((a, b) => new Date(a.scheduleDate).getTime() - new Date(b.scheduleDate).getTime());
        finishedSchedules.sort((a, b) => new Date(a.scheduleDate).getTime() - new Date(b.scheduleDate).getTime());
        pastSchedules.sort((a, b) => new Date(b.scheduleDate).getTime() - new Date(a.scheduleDate).getTime());

        this.schedules = [...futureSchedules, ...finishedSchedules, ...pastSchedules];

        this.schedule = this.schedules[0];
      }
    });
  }

  isScheduledForFutureOrToday(schedule: Schedule): boolean {
    console.log(schedule.hasFinished);
    return (new Date(schedule.scheduleDate).getTime() >= this.today) && !schedule.hasFinished;
  }

  getDayOfWeek(date: string | Date) {
    return this.scheduleService.getDayOfWeek(date);
  }

  convertTimeFormat(time: string) {
    return this.scheduleService.convertTimeFormat(time);
  }

  toggleStartSchedule(schedule: Schedule) {
    this.router.navigate(['/attendance', schedule.id, 'select-type']).then();
  }
}

import {Component, OnInit} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {MatToolbar} from "@angular/material/toolbar";
import {Schedule} from "../../../model/schedule.model";
import {ScheduleService} from "../../../services/schedule.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-attendance-list',
  standalone: true,
    imports: [
        MatIcon,
        MatToolbar
    ],
    providers: [ScheduleService],
  templateUrl: './attendance-list.component.html',
  styleUrl: './attendance-list.component.css'
})
export class AttendanceListComponent implements OnInit{
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

                const finishedSchedules = schedules.filter(schedule =>
                    schedule.hasFinished && new Date(schedule.scheduleDate).getTime() >= today
                );

                finishedSchedules.sort((a, b) => new Date(a.scheduleDate).getTime() - new Date(b.scheduleDate).getTime());

                this.schedules = [...finishedSchedules];

                this.schedule = this.schedules[0];
            }
        });
    }

    getDayOfWeek(date: string | Date) {
        return this.scheduleService.getDayOfWeek(date);
    }

    convertTimeFormat(time: string) {
        return this.scheduleService.convertTimeFormat(time);
    }

    toggleStartSchedule(schedule: Schedule) {
        this.router.navigate(['/view/attendance', schedule.id]).then();
    }
}

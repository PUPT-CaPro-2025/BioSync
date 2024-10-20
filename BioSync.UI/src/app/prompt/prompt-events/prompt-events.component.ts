import {Component, Inject, OnInit} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatButton, MatIconButton} from "@angular/material/button";
import {Schedule} from "../../../model/schedule.model";
import {ScheduleService} from "../../../services/schedule.service";
import {MatIcon} from "@angular/material/icon";
import {Router} from "@angular/router";

@Component({
  selector: 'app-prompt-okay',
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    MatIconButton,
    MatIcon
  ],
  providers: [ScheduleService],
  templateUrl: './prompt-events.component.html',
  styleUrls: ['./prompt-events.component.css',
    '../../dashboard/dashboard-admin/dashboard-admin.component.css']
})
export class PromptEventsComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<PromptEventsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, message: string, schedules: Schedule[] },
    private scheduleService: ScheduleService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log(this.data.schedules)
  }

  getMonth(scheduleDate: string) {
    return this.scheduleService.getMonth(scheduleDate);
  }

  getTime12HourFormat(startTime: string) {
    return this.scheduleService.getTime12HourFormat(startTime);
  }

  getDay(scheduleDate: string) {
    return this.scheduleService.getDay(scheduleDate);
  }

  createSchedule() {
    this.router.navigate(['/schedule/add']).then();
  }
}

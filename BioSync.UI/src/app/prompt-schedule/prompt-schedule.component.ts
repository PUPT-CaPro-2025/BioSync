import {Component, Inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef, MatDialogTitle
} from "@angular/material/dialog";
import {Schedule} from "../../model/schedule.model";
import {MatButton} from "@angular/material/button";
import {ScheduleService} from "../../services/schedule.service";
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'app-prompt-schedule',
  standalone: true,
  imports: [
    MatDialogActions,
    MatButton,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MatIcon
  ],
  providers: [ScheduleService],
  templateUrl: './prompt-schedule.component.html',
  styleUrl: './prompt-schedule.component.css'
})
export class PromptScheduleComponent {
  constructor(
    public dialogRef: MatDialogRef<PromptScheduleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, schedule: Schedule },
    private scheduleService: ScheduleService
  ) {
  }

  getTime12HourFormat(time: string){
   return this.scheduleService.getTime12HourFormat(time);
  }

}

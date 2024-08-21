import {Component, Output, EventEmitter, Input, OnInit,} from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import {Schedule} from "../../model/schedule-model";
import {Subject} from "rxjs";
import {ViewScheduleService} from "../../services/view-schedule.service";
import {ScheduleComponent} from "../schedule/schedule.component";


@Component({
  selector: 'app-view-schedule',
  standalone: true,
  imports: [MatToolbarModule, MatSelectModule],
  templateUrl: './view-schedule.component.html',
  styleUrl: './view-schedule.component.css'
})
export class ViewScheduleComponent implements OnInit{
  @Output() viewBackToSchedule = new EventEmitter<void>();
  @Input() id!: number | undefined;
  schedule: Schedule = {
    endTime: "",
    id: 0,
    labRoom: "",
    professor: "",
    remarks: "",
    scheduleDate: "",
    schoolYear: "",
    section: "",
    semester: "",
    startTime: ""
  };

  constructor(private viewScheduleService: ViewScheduleService, protected scheduleComponent: ScheduleComponent) {
  }

  ngOnInit() {
    console.log(this.id);
    this.getSchedule();
  }

  getSchedule() {
    this.viewScheduleService.getSchedule(+this.id!).subscribe({
      next: value => {
        this.schedule = value;
      }
    })
  }

  backToSchedule(): void {
    this.viewBackToSchedule.emit();
  }


}

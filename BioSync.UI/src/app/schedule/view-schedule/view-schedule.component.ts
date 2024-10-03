import {Component, OnInit} from '@angular/core';
import {MatToolbar} from "@angular/material/toolbar";
import {ActivatedRoute} from "@angular/router";
import {ScheduleService} from "../../../services/schedule.service";
import {Schedule} from "../../../model/schedule.model";
import {MatIcon} from "@angular/material/icon";
import {User} from "../../../model/user.model";
import {UserService} from "../../../services/user.service";
import {MatButton} from "@angular/material/button";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";

@Component({
  selector: 'app-view-schedule',
  standalone: true,
  imports: [
    MatToolbar,
    MatIcon,
    MatButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger
  ],
  providers: [ScheduleService, UserService],
  templateUrl: './view-schedule.component.html',
  styleUrls: ['./view-schedule.component.css', '../schedule.component.css']
})
export class ViewScheduleComponent implements OnInit{
  schedule!: Schedule;
  class: User[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private scheduleService: ScheduleService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      const id = params.get('id');
      this.getScheduleDetails(+id!);

    });
  }

  getScheduleDetails(scheduleId: number){
    this.scheduleService.getScheduleById(scheduleId).subscribe({
      next: value => {
        this.schedule = value;
        this.getUsersBySectionId(this.schedule.id!);
      }
    })
  }

  getUsersBySectionId(scheduleId: number) {
    this.userService.getUsersByScheduleId(scheduleId).subscribe({
      next: value => {
        this.class = value
      }
    })
  }

  convertTo12HourFormat(string: string){
    return this.scheduleService.convertTimeFormat(string);
  }

  getReadableDate(dateStr: string){
    const date = new Date(dateStr);

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }


  returnToSchoolYearView() {
    history.back()
  }

  toggleAddStudent() {

  }
}

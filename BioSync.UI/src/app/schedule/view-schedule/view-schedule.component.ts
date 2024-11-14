import { Component, OnInit } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { ActivatedRoute } from '@angular/router';
import { ScheduleService } from '../../../services/schedule.service';
import { Schedule } from '../../../model/schedule.model';
import { MatIcon } from '@angular/material/icon';
import { UserService } from '../../../services/user.service';
import {
  MatButton,
  MatFabButton,
  MatIconButton,
  MatMiniFabButton,
} from '@angular/material/button';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { PromptCsvComponent } from '../../prompt/prompt-csv/prompt-csv.component';
import { AddToScheduleComponent } from '../../prompt/add-to-schedule/add-to-schedule.component';
import { SetComputerComponent } from '../../prompt/set-computer/set-computer.component';
import { ClassResponse } from '../../../model/class.model';
import {CookieService} from "../../../services/cookie.service";
import {CryptoService} from "../../../services/crypto.service";

@Component({
  selector: 'app-view-schedule',
  standalone: true,
  imports: [
    MatToolbar,
    MatIcon,
    MatButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatIconButton,
    MatMiniFabButton,
    MatFabButton,
  ],
  providers: [ScheduleService, UserService, CookieService, CryptoService],
  templateUrl: './view-schedule.component.html',
  styleUrls: ['./view-schedule.component.css', '../schedule.component.css'],
})
export class ViewScheduleComponent implements OnInit {
  schedule!: Schedule;
  class: ClassResponse[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private scheduleService: ScheduleService,
    private userService: UserService,
    private dialog: MatDialog,
    private cookieService: CookieService,
    private cryptoService: CryptoService
  ) {}

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.getScheduleDetails(+id!);
    });
  }

  getScheduleDetails(scheduleId: number) {
    this.scheduleService.getScheduleById(scheduleId).subscribe({
      next: (value) => {
        this.schedule = value;
        this.getUsersByScheduleId(this.schedule.id!);
      },
    });
  }

  getUsersByScheduleId(scheduleId: number) {
    this.userService.getUsersByScheduleId(scheduleId).subscribe({
      next: (value: ClassResponse[]) => {
        this.class = value;
        console.log(this.class);
      },
      error: (err) => {
        console.error('Error fetching users by schedule ID:', err);
      },
    });
  }

  convertTo12HourFormat(string: string) {
    return this.scheduleService.convertTimeFormat(string);
  }

  getReadableDate(dateStr: string) {
    const date = new Date(dateStr);

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }

  returnToSchoolYearView() {
    history.back();
  }

  toggleAddStudent() {
    const ref = this.dialog.open(AddToScheduleComponent, {
      width: '450px',
      height: '250px',
      data: {
        title: 'Add Student',
        scheduleId: this.schedule.id,
      },
      autoFocus: false,
    });

    ref.afterClosed().subscribe({
      next: () => {
        this.getUsersByScheduleId(this.schedule.id!);
      },
    });
  }

  toggleAssignedComputer(data: ClassResponse) {
    this.dialog.open(SetComputerComponent, {
      width: '450px',
      height: '280px',
      data: data,
      autoFocus: false
    });
  }

  toggleBulkAddStudent() {
    this.dialog.open(PromptCsvComponent, {
      width: '450px',
      height: '210px',
      data: {
        scheduleId: this.schedule.id,
      },
    });
  }

  getRole(): string{
    const getTheRole = <string>decodeURIComponent(this.cookieService.getCookie("role")!);
    return this.cryptoService.decrypt(getTheRole);
  }
}

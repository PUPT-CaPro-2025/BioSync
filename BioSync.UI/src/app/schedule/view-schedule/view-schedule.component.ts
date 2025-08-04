import { Component, OnInit } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { ActivatedRoute } from '@angular/router';
import { ScheduleService } from '../../../services/schedule.service';
import { Schedule } from '../../../model/schedule.model';
import { MatIcon } from '@angular/material/icon';
import { UserService } from '../../../services/user.service';
import {
  MatButton,
  MatMiniFabButton,
} from '@angular/material/button';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { PromptCsvComponent } from '../../prompt/prompt-csv/prompt-csv.component';
import { AddToScheduleComponent } from '../../prompt/add-to-schedule/add-to-schedule.component';
import { SetComputerComponent } from '../../prompt/set-computer/set-computer.component';
import { ClassResponse } from '../../../model/class.model';
import { CookieService } from '../../../services/cookie.service';
import { CryptoService } from '../../../services/crypto.service';
import { PromptConfirmComponent } from '../../prompt/prompt-confirm/prompt-confirm.component';

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
    MatMiniFabButton,
  ],
  providers: [ScheduleService, UserService, CookieService, CryptoService],
  templateUrl: './view-schedule.component.html',
  styleUrls: ['./view-schedule.component.css', '../schedule.component.css'],
})
export class ViewScheduleComponent implements OnInit {
  schedule!: Schedule;
  class: ClassResponse[] = [];
  activeDropdownId: number | null = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private scheduleService: ScheduleService,
    private userService: UserService,
    private dialog: MatDialog,
    private cookieService: CookieService,
    private cryptoService: CryptoService,
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
        this.class.sort((a, b) => {
          const nameA = a.student.lastName.toLowerCase();
          const nameB = b.student.lastName.toLowerCase();
          if (nameA < nameB) return -1;
          if (nameA > nameB) return 1;
          return 0;
        });
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
      height: '330px',
      data: data,
      autoFocus: false,
    });
  }

  toggleBulkAddStudent() {
    const ref = this.dialog.open(PromptCsvComponent, {
      width: '450px',
      height: '210px',
      data: {
        heading: "Add Multiple Students",
        subheading: "adding multiple students",
        scheduleId: this.schedule.id,
      },
    });

    ref.afterClosed().subscribe({
      next: () => {
        this.getUsersByScheduleId(this.schedule.id!);
      },
    });
  }

  getRole(): string {
    const getTheRole = <string>(
      decodeURIComponent(this.cookieService.getCookie('role')!)
    );
    return this.cryptoService.decrypt(getTheRole);
  }

  toggleDropdownAction(scheduleId: number): void {
    this.activeDropdownId =
      this.activeDropdownId === scheduleId ? null : scheduleId;
  }

  removeStudent(data: ClassResponse) {
    const ref = this.dialog.open(PromptConfirmComponent, {
      width: '450px',
      height: '210px',
      data: {
        title: 'Remove Student',
        message: 'Are you sure you want to remove this student?',
        action: 'Remove',
      },
    });

    ref.afterClosed().subscribe({
      next: (result) => {
        if (result) {
          this.userService
            .removeUserToSchedule(data.schedule.id, data.student.id)
            .subscribe({
              next: () => {
                this.class = this.class.filter((cls) => cls.id != data.id);
              },
            });
        }
      },
    });
  }
}

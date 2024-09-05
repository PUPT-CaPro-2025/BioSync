import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import {Schedule} from "../../model/schedule.model";
import {ScheduleService} from "../../services/schedule.service";
import {UserService} from "../../services/user.service";
import {CryptoService} from "../../services/crypto.service";
import {CookieService} from "../../services/cookie.service";
import {User} from "../../model/user.model";

@Component({
  selector: 'app-dashboard-student',
  standalone: true,
  imports: [FullCalendarModule, MatToolbarModule],
  providers: [
    ScheduleService,
    CryptoService,
    UserService
  ],
  templateUrl: './dashboard-student.component.html',
  styleUrl: './dashboard-student.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class DashboardStudentComponent implements OnInit{
  totalAbsences: number =  2;
  totalAttendance: number = 50;
  totalTardiness: number = 0;
  totalSubject: number = 0;
  upcomingSchedules: Schedule[] = [];
  userId!: string | number;
  sectionId!: number;

  //region CALENDAR OPTIONS
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    dateClick: (arg: DateClickArg) => this.handleDateClick(arg),
    eventTextColor: '#FFF',
    eventDidMount: function(info) {
      info.el.style.background = 'linear-gradient(to bottom, #E4581D, #F9653F)';
    },
    eventContent: function(info) {
      const startTime = new Date(info.event.start!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const endTime = new Date(info.event.end!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return {
        html: `
            <div class="text-white text-xs flex flex-col gap-0.5 pl-1">
              <p>${info.event.title}</p>
              <p>${startTime} - ${endTime}</p>
            </div>
        `
      };
    }
  };
  //endregion

  constructor(
    private scheduleService: ScheduleService,
    private userService: UserService,
    private cryptoService: CryptoService,
    private cookieService: CookieService,
  ) {}

  ngOnInit() {
    this.getUserId();
    this.getSectionId(+this.userId);
  }

  getUserId(){
    const encryptedUserId = decodeURIComponent(this.cookieService.getCookie("user_id")!);
    this.userId = this.cryptoService.decrypt(encryptedUserId);
  }

  getSectionId(userId: number) {
    this.userService.getUserById(userId).subscribe({
      next: (user: User) => {
        if(!user.id) return;
        this.sectionId = +user.section?.id!;
        this.getStudentSchedules();
        this.getStudentUpcomingSchedules();
      }
    })
  }

  getStudentSchedules(){
    this.scheduleService.getAllSchedulesBySectionId(this.sectionId).subscribe({
      next: (schedules: Schedule[]) => {
        console.log(schedules)
        this.calendarOptions.events = this.transformToCalendarEvents(schedules);
        this.countUniqueSubjects(schedules);
      }
    })
  }

  countUniqueSubjects(items: Schedule[]) {
    const uniqueSubjects = new Set<string>();

    items.forEach(item => {
      const subjectKey = `${item.subject?.id}-${item.subject?.code}`;
      uniqueSubjects.add(subjectKey);
    });

    this.totalSubject = uniqueSubjects.size;
  }

  getStudentUpcomingSchedules() {
    this.scheduleService.getAllSchedulesBySectionId(this.sectionId).subscribe({
      next: (data: Schedule[]) => {
        const now = new Date();
        const upcoming = data.filter(schedule => new Date(schedule.scheduleDate) >= now);
        upcoming.sort((a, b) =>
          new Date(a.scheduleDate).getTime() - new Date(b.scheduleDate).getTime());

        this.upcomingSchedules = upcoming.slice(0, 6);
      }
    });
  }

  transformToCalendarEvents(schedules: Schedule[]): { title: string, start: string, end?: string }[] {
    return schedules.map(schedule => ({
      title: `${schedule.subject?.code} - (${schedule.section?.program.programAbbreviation} - ${schedule.section?.section})`,
      start: `${schedule.scheduleDate}T${schedule.startTime}`,
      end: `${schedule.scheduleDate}T${schedule.endTime}`
    }));
  }

  getTime12HourFormat(time: string): string {
    const date = new Date(`1970-01-01T${time}Z`);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  getMonth(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { month: 'long' };
    return date.toLocaleDateString(undefined, options);
  }

  getDay(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  }

  get filteredUpcomingSchedules(): Schedule[] {
    return this.upcomingSchedules.slice();
  }

  handleDateClick(arg: DateClickArg) {
    alert('date click! ' + arg.dateStr);
  }

}

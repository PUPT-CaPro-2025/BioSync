import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import {CryptoService} from "../../services/crypto.service";
import {CookieService} from "../../services/cookie.service";
import {ScheduleService} from "../../services/schedule.service";
import {Schedule} from "../../model/schedule.model";
import {UserService} from "../../services/user.service";
import {SubjectService} from "../../services/subject.service";

@Component({
  selector: 'app-dashboard-professor',
  standalone: true,
  imports: [FullCalendarModule, MatToolbarModule],
  providers: [
    ScheduleService,
    CookieService,
    CryptoService,
    SubjectService,
    UserService,
  ],
  templateUrl: './dashboard-professor.component.html',
  styleUrl: './dashboard-professor.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class DashboardProfessorComponent implements OnInit{
  userId = '';
  totalStudents!: number;
  totalSubject!: number;
  upcomingSchedules: Schedule[] = [];

  //region CALENDAR OPTIONS
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    dateClick: (arg: DateClickArg) => this.handleClick(arg),
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

  handleClick(arg: DateClickArg) {
    alert('date click! ' + arg.dateStr);
  }
  //endregion


  constructor(
    private cryptoService: CryptoService,
    private cookieService: CookieService,
    private scheduleService: ScheduleService,
    private userService: UserService,
    private subjectService: SubjectService,
  ) {}


  ngOnInit(): void {
    this.getUserId();
    this.getFacultySchedule(+this.userId);
    this.loadUpcomingSchedules(+this.userId);
    this.loadDashboardNumbers();
  }

  getUserId(){
    const encryptedUserId = decodeURIComponent(this.cookieService.getCookie("user_id")!);
    this.userId = this.cryptoService.decrypt(encryptedUserId);
  }

  getFacultySchedule(facultyId: number) {
    this.scheduleService.getAllSchedulesByProfessorId(facultyId).subscribe({
      next: (schedules: Schedule[]) => {
        console.log(schedules);
        this.calendarOptions.events = this.transformToCalendarEvents(schedules);
      }
    })
  }

  loadUpcomingSchedules(facultyId: number) {
    this.scheduleService.getAllSchedulesByProfessorId(facultyId).subscribe({
      next: (data: Schedule[]) => {
        const now = new Date();
        const upcoming = data.filter(schedule => new Date(schedule.scheduleDate) >= now);
        upcoming.sort((a, b) => new Date(a.scheduleDate).getTime() - new Date(b.scheduleDate).getTime());

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


  get filteredUpcomingSchedules(): Schedule[] {
    return this.upcomingSchedules.slice();
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

  loadDashboardNumbers(){
    this.userService.getUsersByRole("STUDENT").subscribe({
      next: data => {
        this.totalStudents = data.length;
      }
    })

    this.subjectService.getSubjects().subscribe({
      next: data => {
        this.totalSubject = data.length;
      }
    })
  }

}

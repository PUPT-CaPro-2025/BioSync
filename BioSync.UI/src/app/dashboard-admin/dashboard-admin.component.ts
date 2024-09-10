import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {FullCalendarModule} from '@fullcalendar/angular';
import {CalendarOptions} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, {DateClickArg} from '@fullcalendar/interaction';
import {ScheduleService} from "../../services/schedule.service";
import {Schedule} from "../../model/schedule.model";
import {UserService} from "../../services/user.service";
import {SubjectService} from "../../services/subject.service";
import {MatDialog} from "@angular/material/dialog";
import {PromptEventsComponent} from "../prompt-events/prompt-events.component";

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [FullCalendarModule, MatToolbarModule],
  providers: [
    ScheduleService,
    SubjectService,
    UserService
  ],
  templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class DashboardAdminComponent implements OnInit {
  currentTime!: string;
  currentDate!: string;
  totalSubject: number = 0;
  totalStudents: number = 0;
  totalProfessors: number = 0;
  upcomingSchedules: Schedule[] = [];
  schedules: Schedule[] = [];

  constructor(
    private scheduleService : ScheduleService,
    private userService: UserService,
    private subjectService: SubjectService,
    private dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.updateTimeAndDate();
    setInterval(() => this.updateTimeAndDate(), 1000);
    this.loadSchedules();
    this.loadUpcomingSchedules();
    this.loadDashboardNumbers();
  }

  loadSchedules(): void {
    this.scheduleService.getAllSchedules().subscribe({
      next: data => {
        this.calendarOptions.events = this.transformToCalendarEvents(data);
        this.schedules = data;
      }
    })
  }

  loadUpcomingSchedules() {
    this.scheduleService.getAllSchedules().subscribe({
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

  updateTimeAndDate(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };

    const formattedDate = now.toLocaleDateString('en-US', options);

    const match = formattedDate.match(/^(.*?), (\w+ \d{1,2}, \d{4})$/);
    if (match) {
      const [_, weekday, monthDayYear] = match;
      const [month, day, year] = monthDayYear.split(' ');
      this.currentDate = `${weekday.toUpperCase()}, ${month.charAt(0).toUpperCase()}${month.slice(1).toLowerCase()} ${day} ${year}`;
    } else {
      this.currentDate = formattedDate;
    }
  }

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    dateClick: (arg: DateClickArg) => this.openDateSchedule(arg),
    eventClick: () => console.log("hello"),
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

  openDateSchedule(arg: DateClickArg) {
    const date = arg.dateStr;

    const schedule = this.schedules.filter(
      schedule => schedule.scheduleDate === date);

    this.dialog.open(PromptEventsComponent, {
      data: {
        title: "Events",
        schedules: schedule,
      }
    })
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

    this.userService.getUsersByRole("FACULTY").subscribe({
      next: data => {
        this.totalProfessors = data.length;
      }
    })

    this.subjectService.getSubjects().subscribe({
      next: data => {
        this.totalSubject = data.length;
      }
    })
  }
}

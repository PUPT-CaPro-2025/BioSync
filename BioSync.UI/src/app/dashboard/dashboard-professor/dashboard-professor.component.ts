import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FullCalendarModule } from '@fullcalendar/angular';
import {CalendarOptions, EventClickArg} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import {CryptoService} from "../../../services/crypto.service";
import {CookieService} from "../../../services/cookie.service";
import {ScheduleService} from "../../../services/schedule.service";
import {Schedule} from "../../../model/schedule.model";
import {UserService} from "../../../services/user.service";
import {SubjectService} from "../../../services/subject.service";
import {PromptEventsComponent} from "../../prompt/prompt-events/prompt-events.component";
import {PromptScheduleComponent} from "../../prompt/prompt-schedule/prompt-schedule.component";
import {MatDialog} from "@angular/material/dialog";
import {forkJoin} from "rxjs";

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
  styleUrls: ['./dashboard-professor.component.css', '../dashboard-admin/dashboard-admin.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardProfessorComponent implements OnInit{
  userId!: string | number;
  totalStudents = 0;
  totalSubject!: number;
  schedules: Schedule[] = [];
  upcomingSchedules: Schedule[] = [];

  //region CALENDAR OPTIONS
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    hiddenDays: [0],
    plugins: [dayGridPlugin, interactionPlugin],
    dateClick: (arg: DateClickArg) => this.openDateSchedule(arg),
    eventClick: (info : EventClickArg) => this.handleEventClick(info),
    eventTextColor: '#FFF',
    eventDidMount: function(info) {
      info.el.style.background = '#AB3130';
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
    private cryptoService: CryptoService,
    private cookieService: CookieService,
    private scheduleService: ScheduleService,
    private userService: UserService,
    private dialog: MatDialog
  ) {}


  ngOnInit(): void {
    this.getUserId();
    this.getFacultySchedule(+this.userId);
    this.loadUpcomingSchedules(+this.userId);
  }

  getUserId(){
    const encryptedUserId = decodeURIComponent(this.cookieService.getCookie("user_id")!);
    this.userId = this.cryptoService.decrypt(encryptedUserId);
  }

  getFacultySchedule(facultyId: number) {
    this.scheduleService.getAllSchedulesByProfessorId(facultyId).subscribe({
      next: (schedules: Schedule[]) => {
        this.schedules = schedules;
        this.getSubjectCount();
        this.getTotalStudents();
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
      title: `${schedule.subject?.code} - (${schedule.section?.program.programAbbreviation} - ${schedule.section?.year})`,
      start: `${schedule.scheduleDate}T${schedule.startTime}`,
      end: `${schedule.scheduleDate}T${schedule.endTime}`,
      laboratory: `${schedule.laboratory?.id}`
    }));
  }


  get filteredUpcomingSchedules(): Schedule[] {
    return this.upcomingSchedules.slice();
  }

  getTime12HourFormat(time: string): string {
    return this.scheduleService.getTime12HourFormat(time);
  }

  getMonth(dateString: string): string {
    return this.scheduleService.getMonth(dateString);
  }

  getDay(dateString: string): string {
    return this.scheduleService.getDay(dateString);
  }

  openDateSchedule(arg: DateClickArg) {
    const date = arg.dateStr;

    const schedule = this.schedules.filter(
      schedule => schedule.scheduleDate === date);

    this.dialog.open(PromptEventsComponent, {
      width: '400px',
      data: {
        title: "Events",
        schedules: schedule,
      }
    })
  }

  handleEventClick(info: EventClickArg): void {
    const event = info.event;
    const startTime = new Date(event.start!).toLocaleTimeString('en-GB', { hour12: false });
    const eventDate = new Intl.DateTimeFormat('en-GB').format(event.start!);
    const [month, day, year] = eventDate.split('/');
    const scheduleDate = `${year}-${day.padStart(2, '0')}-${month.padStart(2, '0')}`;
    const laboratory = event.extendedProps['laboratory'];
    console.log(laboratory)

    const scheduledEvent = this.schedules.find(
      schedule => schedule.scheduleDate === scheduleDate && schedule.startTime === startTime
    );

    this.dialog.open(PromptScheduleComponent, {
      width: '400px',
      data: {
        schedule: scheduledEvent,
      }
    })
  }

  private getSubjectCount() {
    const container: number[] = [];

    this.schedules.forEach(sched => {
      if(!container.includes(sched.subject?.id!)){
        container.push(sched.subject?.id!)
      }
    })

    this.totalSubject = container.length;
  }

  private getTotalStudents(){

    this.filteredRepeatedSchedules();
    this.getUniqueSections();

    const scheduleObservables = this.schedules.map(schedule => {
      return this.userService.getUsersByScheduleId(schedule.id);
    });

    forkJoin(scheduleObservables).subscribe({
      next: results => {
        results.forEach(usersArray => {
          this.totalStudents += usersArray.length;
        });
      },
      error: err => console.error(err),
    });

  }

  filteredRepeatedSchedules(): void {
    const filteredSchedules: Schedule[] = [];
    const recurrenceIdStorage: string[] = [];
    this.schedules.forEach(schedule => {
      if (schedule.recurrenceId != null) {
        if (!recurrenceIdStorage.includes(schedule.recurrenceId)) {
          recurrenceIdStorage.push(schedule.recurrenceId);
          filteredSchedules.push(schedule);
        }
      } else {
        filteredSchedules.push(schedule);
      }
    })

    this.schedules = filteredSchedules;

    console.log(this.schedules)
  }

  private getUniqueSections() {
    const uniqueSectionIds = new Set();
    const filteredSchedules: Schedule[] = [];

    this.schedules.forEach(schedule => {
      const sectionId = schedule.section!.id;
      if (!uniqueSectionIds.has(sectionId)) {
        uniqueSectionIds.add(sectionId);
        filteredSchedules.push(schedule);
      }
    })

    this.schedules = filteredSchedules;
  }
}

import { Component, ViewEncapsulation, OnInit  } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import {ScheduleService} from "../../services/schedule.service";
import {Schedule} from "../../model/schedule.model";

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [FullCalendarModule, MatToolbarModule],
  providers: [ScheduleService],
  templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class DashboardAdminComponent implements OnInit {
  currentTime!: string;
  currentDate!: string;
  totalSubject: number = 8;
  totalStudents: number = 300;
  totalProfessors: number = 32;


  constructor(
    private scheduleService : ScheduleService,
  ) {
  }

  ngOnInit(): void {
    this.updateTimeAndDate();
    setInterval(() => this.updateTimeAndDate(), 1000);
    this.loadSchedules();
  }

  loadSchedules(): void {
    this.scheduleService.getAllSchedules().subscribe({
      next: data => {
        this.calendarOptions.events = this.transformToCalendarEvents(data);
      }
    })
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
    dateClick: (arg: DateClickArg) => this.handleDateClick(arg),
    eventTextColor: '#FFF',
    eventDidMount: function(info) {
      info.el.style.background = 'linear-gradient(to bottom, #E4581D, #F9653F)';
    },
    eventContent: function(info) {
      // Extract and format start and end times
      const startTime = new Date(info.event.start!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const endTime = new Date(info.event.end!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Return HTML with the formatted time
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

  //Temporary: if the date cell was click!
  handleDateClick(arg: DateClickArg) {
    alert('date click! ' + arg.dateStr);
  }

  upcomingSchedules: Schedule[] = [];

  get filteredUpcomingSchedules(): Schedule[] {
    return this.upcomingSchedules.slice();
  }
}

import { Component, ViewEncapsulation, OnInit  } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';

export interface Schedule {
  subjectName: string;
  section: string;
  startTime: string;
  endTime: string;
  labRoom: string;
  professor: string;
  semester: string;
  schoolYear: string;
  remarks: string;
  month: string;
  day: string;
}

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [FullCalendarModule, MatToolbarModule],
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

  ngOnInit(): void {
    this.updateTimeAndDate();
    setInterval(() => this.updateTimeAndDate(), 1000);
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
    events: [
      { title: 'Fundamentals to Computing', date: '2024-08-05' },
      { title: 'Fundamentals to Computing', date: '2024-08-16' },
      { title: 'Computer Programming I', date: '2024-08-16' },
      { title: 'Defense', date: '2024-08-28' },
    ],
    eventColor: '#F84C42',
  };

  //Temporary: if the date cell was click!
  handleDateClick(arg: DateClickArg) {
    alert('date click! ' + arg.dateStr);
  }

  upcomingSchedules: Schedule[] = [
    { subjectName: "Fundamentals of Computing", section: "BSIT 1-1", startTime: "1:00 PM", endTime: "3:00 PM", labRoom: "DOST Laboratory", professor: "Gecilie Almirañez", semester: "Summer", schoolYear: "2023 -2024", remarks: "Laboratory", month: "August", day: "5" },
    { subjectName: "Computer Programming I", section: "BSIT 1-1", startTime: "7:30 AM", endTime: "12:00 PM", labRoom: "DOST Laboratory", professor: "Gecilie Almirañez", semester: "Summer", schoolYear: "2023 -2024", remarks: "Laboratory", month: "August", day: "16" },
    { subjectName: "Fundamentals of Computing", section: "BSIT 1-1", startTime: "1:00 PM", endTime: "3:00 PM", labRoom: "DOST Laboratory", professor: "Gecilie Almirañez", semester: "Summer", schoolYear: "2023 -2024", remarks: "Laboratory", month: "August", day: "16" }
  ];

  get filteredUpcomingSchedules(): Schedule[] {
    return this.upcomingSchedules.slice();
  }
}

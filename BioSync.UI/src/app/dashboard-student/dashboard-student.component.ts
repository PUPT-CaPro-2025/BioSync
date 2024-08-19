import { Component, ViewEncapsulation } from '@angular/core';
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
  selector: 'app-dashboard-student',
  standalone: true,
  imports: [FullCalendarModule, MatToolbarModule],
  templateUrl: './dashboard-student.component.html',
  styleUrl: './dashboard-student.component.css',
  encapsulation: ViewEncapsulation.None, // Disable view encapsulation
})
export class DashboardStudentComponent {
  totalAbsences: number =  2;
  totalAttendance: number = 50;
  totalTardiness: number = 0;
  totalSubject: number = 8;

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
    eventColor: '#D31119',
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

import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {FullCalendarModule} from '@fullcalendar/angular';
import {CalendarOptions, EventClickArg} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, {DateClickArg} from '@fullcalendar/interaction';
import {ScheduleService} from "../../../services/schedule.service";
import {Schedule} from "../../../model/schedule.model";
import {UserService} from "../../../services/user.service";
import {SubjectService} from "../../../services/subject.service";
import {MatDialog} from "@angular/material/dialog";
import {
  PromptEventsComponent
} from "../../prompt/prompt-events/prompt-events.component";
import {
  PromptScheduleComponent
} from "../../prompt/prompt-schedule/prompt-schedule.component";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {Semester} from "../../../model/semester.model";
import {SchoolYear} from "../../../model/school.year.model";
import {Laboratory} from "../../../model/laboratory.model";
import {LaboratoryService} from "../../../services/laboratory.service";
import {PromptSyncComponent} from "../../prompt/prompt-sync/prompt-sync.component";
import {IntegrationService} from "../../../services/integration.service";
import {
  CalendarExportComponent
} from "../../prompt/calendar-export/calendar-export.component";

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [FullCalendarModule, MatToolbarModule],
  providers: [
    ScheduleService,
    SubjectService,
    UserService,
    LaboratoryService,
    IntegrationService
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
  selectedLaboratory!: Laboratory;
  currentSemester!: Semester;
  currentSchoolYear!: SchoolYear;
  labs: Laboratory[] = [];
  schoolLogo!: string;
  bioSyncLogo!: string;

  constructor(
    private scheduleService : ScheduleService,
    private userService: UserService,
    private subjectService: SubjectService,
    private dialog: MatDialog,
    private laboratoryService: LaboratoryService,
    private integrationService: IntegrationService
  ) {
  }

  ngOnInit(): void {
    this.updateTimeAndDate();
    setInterval(() => this.updateTimeAndDate(), 1000);
    this.loadSchedules();
    this.loadUpcomingSchedules();
    this.loadDashboardNumbers();
    this.getLaboratories();

    this.loadImageToBase64('../../assets/BioSync Logo - with text' +
        ' orange.svg', (base64Image) => {
      this.bioSyncLogo = base64Image;
    });

    this.loadImageToBase64('../../assets/PUPLogo.png', (base64Image) => {
      this.schoolLogo = base64Image;
    });
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
      title: `${schedule.subject?.code} - (${schedule.section?.program.programAbbreviation} - ${schedule.section?.year})`,
      start: `${schedule.scheduleDate}T${schedule.startTime}`,
      end: `${schedule.scheduleDate}T${schedule.endTime}`,
      laboratory: `${schedule.laboratory?.id}`
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
    hiddenDays: [0],
    plugins: [dayGridPlugin, interactionPlugin],
    customButtons: {
      printCalendarButton: {
        text: 'Export',
        click: () => {
          this.printEvent();
        }
      },
      SyncSchedules: {
        text: 'Sync',
        click: () => {
          this.syncSchedules();
        }
      }
    },
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'SyncSchedules printCalendarButton'
    },
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

  printEvent(): void {
    this.dialog.open(CalendarExportComponent, {
      width: '400px',
      data: {
        generateFirstSemester: () => this.generatePDF(1),
        generateSecondSemester: () =>  this.generatePDF(2),
        generateSummerSemester: () => this.generatePDF(3)
      }
    })
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

  private syncSchedules() {
    const ref = this.dialog.open(PromptSyncComponent, {
      width: '250px',
      disableClose: true,
    })

    setTimeout(() => {
      this.integrationService.getSchedulesToSync().subscribe({
        next: value => {
          this.createScheduleIntegration(value);
          ref.close()
        }
      })
    }, 1500)

  }

  private createScheduleIntegration(computer_laboratory_schedules: any) {
    this.integrationService.syncSchedules(computer_laboratory_schedules).subscribe({
      next: () => {
        this.loadSchedules();
        this.loadUpcomingSchedules();
        this.loadDashboardNumbers();
      },
      error: () => {
        this.loadSchedules();
        this.loadUpcomingSchedules();
        this.loadDashboardNumbers();
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

    const scheduledEvent = this.schedules.find(
      schedule => schedule.scheduleDate === scheduleDate && schedule.startTime === startTime
      && schedule.laboratory?.id === +laboratory
    );

    this.dialog.open(PromptScheduleComponent, {
      width: '400px',
      data: {
        schedule: scheduledEvent,
      }
    })
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

  getLaboratories() {
    this.laboratoryService.getLaboratories().subscribe({
      next: (laboratories: Laboratory[]) => {
        if (!laboratories) return;
        this.labs = laboratories;
      },
    });
  }

  generatePDF(semesterNumber: number): void  {
    // Create a new PDF document in landscape mode
    const doc = new jsPDF('landscape', 'mm', 'a3');
    const pageWidth = doc.internal.pageSize.getWidth();

    // Loop through each laboratory in `this.upcomingSchedules`
    this.labs.forEach((lab, index) => {
      // Initialize selected data for each laboratory
      this.selectedLaboratory = lab;
      this.currentSchoolYear = this.upcomingSchedules[1].schoolYear!;

      if(semesterNumber == 1){
        this.currentSemester = this.currentSchoolYear.firstSemester;
      } else if(semesterNumber == 2){
        this.currentSemester = this.currentSchoolYear.secondSemester;
      } else {
        this.currentSemester = this.currentSchoolYear.summerSemester;
      }

      // Add a new page for each laboratory (skip adding a new page for the first lab)
      if (index > 0) {
        doc.addPage();
      }

      // Add Main Title - Laboratory Name
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.setTextColor(40, 40, 40);
      doc.text(this.selectedLaboratory.name, 14, 20);

      // Semester and Year Information
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 40, 40);
      doc.text(`${this.currentSemester.name} • SY ${this.currentSchoolYear.startYear} - ${this.currentSchoolYear.endYear}`
          , 14, 28);

      const imageWidth = 20;
      const imageHeight = 20;

      const rightMargin = 14;
      const xPos = pageWidth - imageWidth - rightMargin;
      const uniLogoXPos = pageWidth - imageWidth - (rightMargin + 20);
      const yPos = 10;

      doc.addImage(
          this.bioSyncLogo,
          'PNG',
          xPos,
          yPos,
          imageWidth,
          imageHeight
      );

      doc.addImage(
          this.schoolLogo,
          'PNG',
          uniLogoXPos,
          yPos + 1,
          imageWidth - 3,
          imageHeight - 3
      );

      // Draw Room Assignment Header Box
      doc.setDrawColor(0);
      doc.setFillColor(128, 0, 0);
      doc.rect(14, 32, pageWidth - 28, 10, 'F');

      // Add Room Assignment Header Text
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text("ROOM ASSIGNMENT", pageWidth / 2, 39, { align: 'center' });

      // Calendar Table Headers
      const headers = ["Time Slot", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

      // Filter schedules based on the selected laboratory
      const filteredSchedules = this.schedules.filter(
          schedule => schedule.laboratory!.id === this.selectedLaboratory.id
              && schedule.semester!.id === this.currentSemester.id
      );

      // Filter for unique recurrenceId schedules
      const uniqueRecurrence = filteredSchedules.filter(
          (item, index, self) =>
              item.recurrenceId &&
              self.findIndex(i => i.recurrenceId === item.recurrenceId) === index
      );

      // Map schedules into days of the week
      const daysMapping = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const filteredByDay = daysMapping.reduce((acc: any, day: string) => {
        acc[day] = uniqueRecurrence.filter(schedule => schedule.recurrenceDays!.includes(day));
        return acc;
      }, {});

      // Define time slots
      const timeSlots = [
        "7:30 am - 10:30 am",
        "10:30 am - 1:30 pm",
        "2:00 pm - 5:00 pm",
        "5:00 pm - 8:00 pm",
        "8:00 pm - 9:00 pm"
      ];

      // Create scheduleData for table rows
      const scheduleData = timeSlots.map((timeSlot) => {
        const row = [timeSlot]; // Initialize row with the time slot as the first column

        // Loop through days (MON to SAT)
        daysMapping.forEach((day) => {
          const daySchedules = filteredByDay[day] || [];
          const cellData = daySchedules
              .filter((schedule: any) => {
                return this.scheduleFitsInSlot(schedule.startTime,
                    schedule.endTime, timeSlot);
              })
              .map((schedule: any) => `${schedule.subject.description},\n${schedule.section.program.programAbbreviation} ${schedule.section.year}-${schedule.section.section}\n${schedule.professor.lastName}\n${this.formatTime(schedule.startTime)} - ${this.formatTime(schedule.endTime)}`)
              .join("\n\n");

          row.push(cellData || ""); // Add cell data or leave empty
        });

        return row;
      });

      // Create table using autoTable
      autoTable(doc, {
        startY: 45,
        head: [headers],
        body: scheduleData,
        theme: 'grid',
        headStyles: {
          fillColor: [128, 0, 0],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
        },
        bodyStyles: {
          halign: 'center',
          valign: 'middle',
          fontSize: 10,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { top: 45, left: 14, right: 14 },
        styles: {
          minCellHeight: 12,
        },
        tableWidth: pageWidth - 28,
        columnStyles: {
          0: { cellWidth: (pageWidth - 28) * 0.15 },  // 15% for Time Slot column
          1: { cellWidth: (pageWidth - 28) * 0.14 },  // 14% each for other days
          2: { cellWidth: (pageWidth - 28) * 0.14 },
          3: { cellWidth: (pageWidth - 28) * 0.14 },
          4: { cellWidth: (pageWidth - 28) * 0.14 },
          5: { cellWidth: (pageWidth - 28) * 0.14 },
          6: { cellWidth: (pageWidth - 28) * 0.15 },  // Adjust to balance total width
        },
      });
    });

    // download the PDF
    const semesterName = this.currentSemester.name.replace(" ", "-");
    const schoolYear = `${this.currentSchoolYear.startYear}-${this.currentSchoolYear.endYear}`;
    doc.save(`${semesterName}-Calendar-SY-${schoolYear}.pdf`)
  }

  scheduleFitsInSlot(startTime: string, endTime: string, timeSlot: string): boolean {
    const parseTime = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes; // Convert time to minutes since midnight
    };

    // Parse the time slot range
    const [slotStartStr, slotEndStr] = timeSlot.split(" - ");
    const slotStart = parseTime(this.convertTo24HourFormat(slotStartStr));
    const slotEnd = parseTime(this.convertTo24HourFormat(slotEndStr));

    // Parse the schedule start and end times
    const scheduleStart = parseTime(this.convertTo24HourFormat(startTime));
    const scheduleEnd = parseTime(this.convertTo24HourFormat(endTime));

    // Check if the schedule overlaps with the time slot
    return (scheduleStart < slotEnd && scheduleEnd > slotStart);
  }


  convertTo24HourFormat(time: string): string {
    if (/^\d{2}:\d{2}:\d{2}$/.test(time)) {
      return time;
    }

    if (!time.toLowerCase().includes('am') && !time.toLowerCase().includes('pm')) {
      throw new Error(`Invalid time format: ${time}`);
    }

    const [timePart, modifier] = time.toLowerCase().trim().split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);

    if (modifier === "pm" && hours !== 12) {
      hours += 12;
    } else if (modifier === "am" && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
  }

  formatTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }


  loadImageToBase64(
      url: string,
      callback: (base64Image: string) => void,
  ): void {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      const base64Image = canvas.toDataURL('image/png');
      callback(base64Image);
    };
  }
}

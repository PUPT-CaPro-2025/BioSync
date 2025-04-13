import { Component, Input, OnInit, HostListener } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { Schedule } from '../../model/schedule.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { ScheduleService } from '../../services/schedule.service';
import { PromptConfirmComponent } from '../prompt/prompt-confirm/prompt-confirm.component';
import { MatDialog } from '@angular/material/dialog';
import { SchoolYearService } from '../../services/school.year.service';
import { SchoolYear } from '../../model/school.year.model';
import { Router } from '@angular/router';
import { CryptoService } from '../../services/crypto.service';
import { CookieService } from '../../services/cookie.service';
import { User } from '../../model/user.model';
import { UserService } from '../../services/user.service';
import jsPDF from 'jspdf';
import { Program } from '../../model/program.model';
import { ProgramService } from '../../services/program.service';
import { Section } from '../../model/section.model';
import { SectionService } from '../../services/section.service';
import {Semester} from "../../model/semester.model";

@Component({
  selector: 'app-faculty-my-request',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatIconModule,
    CommonModule,
    FormsModule,
    MatSelectModule,
  ],
  providers: [
    ScheduleService,
    SchoolYearService,
    ProgramService,
    SectionService,
    UserService,
    CookieService,
    CryptoService,
  ],
  templateUrl: './faculty-my-request.component.html',
  styleUrls: [
    './faculty-my-request.component.css',
    '../schedule/schedule.component.css',
  ],
})
export class FacultyMyRequestComponent implements OnInit {
  entries: string[] = ['10', '20', '30', '40', '50'];

  sorting: string[] = ['Subject Code', 'Alphabetical', 'Date'];

  academicYears: SchoolYear[] = [];
  selectedAcademicYear: number | undefined;

  semesters: Semester[] = [];
  selectedSemester = 1;

  programs: Program[] = [];
  selectedProgram!: number;
  prevSelectedProgram = -1;

  sections: Section[] = [];
  selectedYearAndSection = -1;

  schedules: Schedule[] = [];
  scheduleContainer: Schedule[] = [];

  totalItems!: number;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalPages!: number;
  isOneAddSchedule: boolean = false;
  isWeeklyAddSchedule: boolean = false;
  isRequestOneSchedule: boolean = false;
  isRequestWeeklySchedule: boolean = false;
  isEditSchedule: boolean = false;
  groupedSchedules: { [key: string]: Schedule[] } = {};
  selectedSchedule!: Schedule;
  isDropdownOpenAddSchedule: boolean = false;
  isDropdownOpenRequestSchedule: boolean = false;
  userId!: number;
  bagongPilipinas!: string;
  stamp!: string;
  schoolLogo!: string;  
  activeDropdownId: number | null = null;

  constructor(
    private scheduleService: ScheduleService,
    private dialog: MatDialog,
    private schoolYearService: SchoolYearService,
    private sectionService: SectionService,
    private programService: ProgramService,
    private router: Router,
    private cryptoService: CryptoService,
    private cookieService: CookieService,
    private userService: UserService,
  ) {}

  ngOnInit() {
    if (this.getRole() === 'ADMIN') {
      this.getAllSchedules();
    } else if (this.getRole() === 'FACULTY') {
      this.getUserId();
      this.getFacultySchedule(this.userId);
    } else {
      this.getUserId();
      this.getSectionId(this.userId);
    }
    this.getAcademicYears();
    this.getAllPrograms();
    this.getSections();
    this.loadImageToBase64('../../assets/BagongPilipinas.png', (base64Image) => {
      this.bagongPilipinas = base64Image;
    });

    this.loadImageToBase64('../../assets/stamp.jpg', (base64Image) => {
      this.stamp = base64Image;
    });

    this.loadImageToBase64('../../assets/PUPLogo.png', (base64Image) => {
      this.schoolLogo = base64Image;
    });
  }

  getAllSchedules() {
    this.scheduleService.getAllSchedules().subscribe({
      next: (schedules) => {
        this.schedules = schedules;
        this.scheduleContainer = schedules;
        this.groupSchedulesByRecurrenceId();
        this.filteredRepeatedSchedules();
        this.sortSchedulesById(this.schedules);
        this.setLatestSchoolYear();
        this.getSemester();
        this.setLatestProgram();
        this.getSections();
        this.totalItems = this.schedules.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      },
      error: (err) => console.error(err),
    });
  }

  getUserId() {
    const encryptedUserId = decodeURIComponent(
      this.cookieService.getCookie('user_id')!,
    );
    this.userId = +this.cryptoService.decrypt(encryptedUserId);
  }

  getRole() {
    return this.cryptoService.decrypt(
      decodeURIComponent(this.cookieService.getCookie('role')!),
    );
  }

  getFacultySchedule(facultyId: number) {
    this.scheduleService.getAllRequestedSchedules(facultyId).subscribe({
      next: (schedules: Schedule[]) => {
        console.log(schedules);
        this.schedules = schedules;
        this.scheduleContainer = schedules;
        this.groupSchedulesByRecurrenceId();
        this.filteredRepeatedSchedules();
        this.sortSchedulesById(this.schedules);
        this.setLatestSchoolYear();
        this.getSemester();
        this.setLatestProgram();
        this.getSections();
        this.totalItems = this.schedules.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      },
    });
  }

  setLatestSchoolYear() {
    if (this.schedules && this.schedules.length > 0) {
      const latestSchedule = this.schedules[this.schedules.length - 1];
      this.selectedAcademicYear = latestSchedule.schoolYear?.id;
    }
  }

  setLatestProgram() {
    if (this.schedules && this.schedules.length > 0) {
      const latestSchedule = this.schedules[this.schedules.length - 1];
      this.selectedProgram = latestSchedule.section?.program.id!;
    }
  }

  sortSchedulesById(schedules: Schedule[]): Schedule[] {
    return schedules.sort((a, b) => b.id - a.id);
  }

  getRecurrenceDays(recId: string): string[] {
    const schedules = this.groupedSchedules[recId];
    if (schedules) {
      const daysSet = new Set<string>();
      schedules.forEach((schedule) => {
        schedule.recurrenceDays!.forEach((day: String) =>
          daysSet.add(day.toString()),
        );
      });
      return Array.from(daysSet);
    }
    return [];
  }

  getSemester() {
    this.semesters = [];

    if (!this.schedules || this.schedules.length === 0) return;

    const lastSchedule = this.schedules[this.schedules.length - 1];
    const lastSchoolYear = lastSchedule.schoolYear;
    if (!lastSchoolYear) return;

    if (lastSchoolYear.firstSemester) {
      this.semesters.push(lastSchoolYear.firstSemester);
    }
    if (lastSchoolYear.secondSemester) {
      this.semesters.push(lastSchoolYear.secondSemester);
    }
    if (lastSchoolYear.summerSemester) {
      this.semesters.push(lastSchoolYear.summerSemester);
    }

    if (lastSchedule.semester) {
      this.selectedSemester = lastSchedule.semester.id!;
    }
  }

  updatePagination(): void {
    this.totalItems = this.schedules.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  convertTimeFormat(time: string): string {
    return this.scheduleService.convertTimeFormat(time);
  }

  openDeleteDialog(schedule: Schedule): void {
    const dialogRef = this.dialog.open(PromptConfirmComponent, {
      width: '400px',
      data: {
        title: 'Delete Schedule',
        message: 'Are you sure you want to delete this schedule?',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteSchedule(schedule);
      }
    });
  }

  getDayOfWeek(date: string | Date): string {
    return this.scheduleService.getDayOfWeek(date);
  }

  deleteSchedule(scheduleToDelete: Schedule) {
    this.scheduleService.deleteSchedule(scheduleToDelete).subscribe({
      next: () => {
        this.schedules = this.schedules.filter(
          (schedule) => schedule.id !== scheduleToDelete.id,
        );
        this.updatePagination();
      },
    });
  }

  getAcademicYears() {
    this.schoolYearService.getSchoolYears().subscribe({
      next: (academicYears: SchoolYear[]) => {
        this.academicYears = academicYears;
      },
    });
  }

  getAllPrograms() {
    this.programService.getAllPrograms().subscribe({
      next: (programs: Program[]) => {
        this.programs = programs;
      }
    })
  }

  getSections() {
    this.sectionService.getSectionByProgramId(this.selectedProgram).subscribe({
      next: (sections: Section[]) => {
        this.sections = sections;
      }
    })
  }

  get pages(): number[] {
    return Array(this.totalPages)
      .fill(0)
      .map((_, i) => i + 1);
  }

  getDisplayRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `${start}-${end}`;
  }

  get filteredSchedules(): Schedule[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.schedules.slice(startIndex, endIndex);
  }

  onPageChange(): void {
    // Handle page change logic here
  }

  onItemsPerPageChange(): void {
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    this.onPageChange();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.onPageChange();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.onPageChange();
    }
  }

  toggleDropdownAction(scheduleId: number): void {
    this.activeDropdownId =
      this.activeDropdownId === scheduleId ? null : scheduleId;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    const isDropdownClicked = target.closest('.action-container') !== null;
    const isToggleButtonClicked = target.closest('.dropdown-toggle') !== null;

    if (!isDropdownClicked && !isToggleButtonClicked) {
      this.activeDropdownId = null;
    }
  }

  toggleOneAddSchedule(): void {
    this.isDropdownOpenAddSchedule = false;
    this.isOneAddSchedule = !this.isOneAddSchedule;
  }

  toggleWeeklyAddSchedule(): void {
    this.isDropdownOpenAddSchedule = false;
    this.isWeeklyAddSchedule = !this.isWeeklyAddSchedule;
  }

  toggleRequestOneSchedule(): void {
    this.isDropdownOpenRequestSchedule = false;
    this.isRequestOneSchedule = !this.isRequestOneSchedule;
  }

  toggleRequestWeeklySchedule(): void {
    this.isDropdownOpenRequestSchedule = false;
    this.isRequestWeeklySchedule = !this.isRequestWeeklySchedule;
  }

  handleBackToSchedule(): void {
    this.isOneAddSchedule = false;
    this.isWeeklyAddSchedule = false;
    this.isRequestOneSchedule = false;
    this.isRequestWeeklySchedule = false;
  }

  toggleStartSchedule(schedule: Schedule) {
    if (schedule.recurrenceId) {
      this.router.navigate(['/schedule/start', schedule.recurrenceId]).then();
    } else {
      this.router.navigate(['/attendance/start/', schedule.id]).then();
    }
  }

  toggleEditSchedule(schedule: Schedule): void {
    this.isEditSchedule = !this.isEditSchedule;
    this.selectedSchedule = schedule;
  }

  handleEditBackToSchedule(): void {
    this.isEditSchedule = false;
  }

  filteredRepeatedSchedules(): void {
    const filteredSchedules: Schedule[] = [];
    const recurrenceIdStorage: string[] = [];
    this.schedules.forEach((schedule) => {
      if (schedule.recurrenceId != null) {
        if (!recurrenceIdStorage.includes(schedule.recurrenceId)) {
          recurrenceIdStorage.push(schedule.recurrenceId);
          filteredSchedules.push(schedule);
        }
      } else {
        filteredSchedules.push(schedule);
      }
    });

    this.schedules = filteredSchedules;
  }

  groupSchedulesByRecurrenceId() {
    this.groupedSchedules = this.schedules.reduce(
      (acc, schedule) => {
        if (schedule.recurrenceId) {
          if (!acc[schedule.recurrenceId]) {
            acc[schedule.recurrenceId] = [];
          }
          acc[schedule.recurrenceId].push(schedule);
        }
        return acc;
      },
      {} as { [key: string]: Schedule[] },
    );
  }

  onFilterChange() {
    const isProgramDiff = this.prevSelectedProgram != this.selectedProgram

    if(isProgramDiff) {
      this.sections = [];
      this.selectedYearAndSection = -1;
      this.getSections();
      this.prevSelectedProgram = this.selectedProgram;
    }

    this.schedules = this.scheduleContainer.filter(
      schedule => schedule.schoolYear?.id === this.selectedAcademicYear
        && schedule.semester?.id === this.selectedSemester
        && schedule.section?.program.id === this.selectedProgram
    );

    this.groupSchedulesByRecurrenceId();
    this.filteredRepeatedSchedules();
    this.sortSchedulesById(this.schedules);
  }

  toggleViewSchedule(schedule: Schedule) {
    this.router.navigate(['/view/schedule', schedule.id]).then();
  }

  getSectionId(userId: number) {
    this.userService.getUserById(userId).subscribe({
      next: (user: User) => {
        if (!user.id) return;
        this.getStudentSchedules(+user.section?.id!);
      },
    });
  }

  getStudentSchedules(sectionId: number) {
    this.scheduleService.getAllSchedulesBySectionId(sectionId).subscribe({
      next: (schedules: Schedule[]) => {
        this.schedules = schedules;
        this.scheduleContainer = schedules;
        this.groupSchedulesByRecurrenceId();
        this.filteredRepeatedSchedules();
        this.sortSchedulesById(this.schedules);
        this.setLatestSchoolYear();
        this.setLatestProgram();
        this.getSections();
      },
    });
  }

  generatePdf() {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const leftX = 10;
    const rightX = pageWidth - 10;
    const lineHeight = 7;
    let currentY = 60; // Start position for content

    //Headers and Rows
    const columns = [
      'Subject Code',
      'Subject Name',
      'Schedule',
      'Time',
      'Faculty',
      'Class',
      'Laboratory',
    ];
    const rows = this.schedules.map((schedule) => [
      schedule.subject?.code,
      schedule.subject?.name,
      schedule.recurrenceDays,
      `${this.convertTimeFormat(schedule.startTime)} - ${this.convertTimeFormat(schedule.endTime)}`,
      `${schedule.professor?.firstName} ${schedule.professor?.lastName}`,
      `${schedule.section?.program.programAbbreviation} ${schedule.section?.year} - ${schedule.section?.section}`,
      schedule.laboratory?.name,
    ]);

    const renderHeader = (currentPage: number, pageCount: number) => {
      //Add header image
     const margin = 10;
     const imgWidth = 20; 
     const imgHeight = 20;

     doc.addImage(this.schoolLogo, 'PNG', margin, 10, imgWidth, imgHeight);

     const textStartX = margin + imgWidth + 5;
     const textStartY = 15;
     doc.setFontSize(10);
     doc.text('Republic of the Philippines', textStartX, textStartY);

     doc.setFontSize(12);
     doc.setFont('times', 'bold');
     doc.text('POLYTECHNIC UNIVERSITY OF THE PHILIPPINES', textStartX, textStartY + 5);

     doc.setFontSize(10);
     doc.setFont('times', 'normal');
     doc.text('Office of the Vice President for Branches and Campuses', textStartX, textStartY + 10);

     doc.setFontSize(11);
     doc.setFont('times', 'bold');
     doc.text('TAGUIG CAMPUS', textStartX, textStartY + 15);

     doc.addImage(this.bagongPilipinas, 'PNG', pageWidth - margin - imgWidth, 10, imgWidth, imgHeight);

     // Add title
     const title = 'SCHEDULE LIST';
     doc.setFontSize(20);
     doc.setFont('helvetica', 'bold');
     doc.text(title, pageWidth / 2, 45, { align: 'center' });

     // Add print date and time below the title, centered
     doc.setFontSize(10);
     doc.setFont('helvetica', 'bold');
     doc.text('Date/Time Printed:', pageWidth / 2 - 20, 50, { align: 'center' });
     doc.setFont('helvetica', 'normal');
     const currentDate = new Date().toLocaleString();
     doc.text(currentDate, pageWidth / 2 + 20, 50, { align: 'center' });

       // Add footer
     const footerY = doc.internal.pageSize.height - 15;
     const textLeftX = 10;  

     doc.setFont('helvetica', 'normal');
     doc.setFontSize(8);
     doc.text('General Santos Ave., Lower Bicutan, Taguig City, Philippines 1632', textLeftX, footerY - 10);
     doc.text('Direct Line: (02) 8837 5858 to 60', textLeftX, footerY - 5);

     doc.setTextColor(0, 0, 0); 
     doc.text('Website: ', textLeftX, footerY + 0.5);
     doc.setTextColor(0, 0, 255); 
     doc.textWithLink('www.pup.edu.ph', textLeftX + 12, footerY + 0.5, { url: 'http://www.pup.edu.ph' });
     doc.setTextColor(0, 0, 0);
     doc.text(' | Email: ', textLeftX + 33, footerY + 0.5);
     doc.text('taguig@pup.edu.ph', textLeftX + 44, footerY + 0.5);
     doc.setTextColor(0);

     doc.setFont('times', 'normal');
     doc.setFontSize(15);
     doc.text('THE COUNTRY\'S 1st POLYTECHNICU', textLeftX, footerY + 8);

     const stampRightX = doc.internal.pageSize.width - 80;
     const stampWidth = 65;
     const stampHeight = 30; 
     doc.addImage(this.stamp, 'JPEG', stampRightX, footerY - 15, stampWidth, stampHeight);
   }

  //Table
  doc.autoTable({
    head: [columns],
    body: rows,
    startY: 55,
    theme: 'grid',
    margin: { top: 55, bottom: 40 },
    styles: {
      fontSize: 10,
      halign: 'center',
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      lineWidth: 0.4,
      lineColor: [0, 0, 0],
    },
    bodyStyles: {
      lineColor: [0, 0, 0],
      textColor: [0, 0, 0],
    },
    didDrawPage: (data: { pageNumber: number; pageCount: number }) => {
      renderHeader(data.pageNumber, data.pageCount);
    },
  });

    doc.save('schedule-list.pdf');
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

  onSectionChange(){
    if(this.selectedYearAndSection == -1){
      this.schedules = this.scheduleContainer.filter(
          schedule => schedule.schoolYear?.id === this.selectedAcademicYear
              && schedule.semester?.id === this.selectedSemester
              && schedule.section?.program.id === this.selectedProgram
      )
    } else {
      this.schedules = this.scheduleContainer.filter(
          schedule => schedule.schoolYear?.id === this.selectedAcademicYear
              && schedule.semester?.id === this.selectedSemester
              && schedule.section?.program.id === this.selectedProgram
              && schedule.section?.id === this.selectedYearAndSection
      )
    }

    this.groupSchedulesByRecurrenceId();
    this.filteredRepeatedSchedules();
    this.sortSchedulesById(this.schedules);
    this.totalItems = this.schedules.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
  }
}

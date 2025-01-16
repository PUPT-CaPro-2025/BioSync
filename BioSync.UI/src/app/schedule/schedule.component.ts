import {Component, OnInit, HostListener} from '@angular/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {Schedule} from '../../model/schedule.model';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AddScheduleComponent} from './add-schedule/add-schedule.component';
import {MatSelectModule} from '@angular/material/select';
import {EditScheduleComponent} from './edit-schedule/edit-schedule.component';
import {ScheduleService} from "../../services/schedule.service";
import {
  PromptConfirmComponent
} from "../prompt/prompt-confirm/prompt-confirm.component";
import {MatDialog} from "@angular/material/dialog";
import {SchoolYearService} from "../../services/school.year.service";
import {SchoolYear} from "../../model/school.year.model";
import {Router} from "@angular/router";
import {CryptoService} from "../../services/crypto.service";
import {CookieService} from "../../services/cookie.service";
import {User} from "../../model/user.model";
import {UserService} from "../../services/user.service";
import jsPDF from "jspdf";
import { Program } from '../../model/program.model';
import { ProgramService } from '../../services/program.service';
import { Section } from '../../model/section.model';
import { SectionService } from '../../services/section.service';
import { Semester } from "../../model/semester.model";

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [MatToolbarModule,
    MatIconModule,
    CommonModule,
    FormsModule,
    AddScheduleComponent,
    MatSelectModule,
    EditScheduleComponent
  ],
  providers: [ScheduleService,
    SchoolYearService,
    SectionService,
    ProgramService,
    UserService,
    CookieService,
    CryptoService
  ],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css',
})

export class ScheduleComponent implements OnInit {
  entries: string[] = [
    '10', '20', '30', '40', '50'
  ];

  academicYears: SchoolYear[] = [];
  selectedAcademicYear: number | undefined;

  semesters!: Semester[];
  selectedSemester!: number;

  programs: Program[] = [];
  selectedProgram!: number;
  prevSelectedProgram: number | undefined;

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
  headerImage!: string;
  activeDropdownId: number | null = null;
  student!: User;

  constructor(
    private scheduleService: ScheduleService,
    private dialog: MatDialog,
    private schoolYearService: SchoolYearService,
    private sectionService: SectionService,
    private programService: ProgramService,
    private router: Router,
    private cryptoService: CryptoService,
    private cookieService: CookieService,
    private userService: UserService
  ) {
  }

  ngOnInit() {
    if (this.getRole() === "ADMIN") {
      this.getAllSchedules();
    } else if (this.getRole() === "FACULTY") {
      this.getUserId();
      this.getFacultySchedule(this.userId);
    } else {
      this.getUserId();
      this.getSectionId(this.userId);
      this.getStudentDetails();
    }
    this.getAcademicYears();
    this. getAllPrograms();
    this.loadImageToBase64('../../assets/header.png', (base64Image) => {
      this.headerImage = base64Image;
    });
  }

  getStudentDetails(){
    this.userService.getUserById(+this.userId).subscribe({
      next: value => {
        this.student = value;
      }
    })
  }

  getAllSchedules() {
    this.scheduleService.getAllSchedules().subscribe({
      next: (schedules) => {
        this.schedules = schedules.filter(schedule => !schedule.hasFinished);
        this.scheduleContainer = schedules;
        this.groupSchedulesByRecurrenceId();
        this.filteredRepeatedSchedules();
        this.sortSchedulesById(this.schedules);
        this.setLatestSchoolYear();
        this.setLatestProgram();
        this.getSections();
        this.getSemester();
        this.onFilterChange();
        this.totalItems = this.schedules.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      },
      error: (err) => console.error(err),
    });
  }

  getUserId() {
    const encryptedUserId = decodeURIComponent(
      this.cookieService.getCookie("user_id")!);
    this.userId = +this.cryptoService.decrypt(encryptedUserId);
  }

  getRole() {
    return this.cryptoService.decrypt(
      decodeURIComponent(this.cookieService.getCookie("role")!));
  }

  getFacultySchedule(facultyId: number) {
    this.scheduleService.getAllSchedulesByProfessorId(facultyId).subscribe({
      next: (schedules: Schedule[]) => {
        this.schedules = schedules;
        this.scheduleContainer = schedules;
        this.groupSchedulesByRecurrenceId();
        this.filteredRepeatedSchedules();
        this.sortSchedulesById(this.schedules);
        this.setLatestSchoolYear();
        this.setLatestProgram();
        this.getSemester();
        this.getSections();
        this.onFilterChange();
        this.totalItems = this.schedules.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      }
    })
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
      this.prevSelectedProgram = this.selectedProgram;
    }
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

  sortSchedulesById(schedules: Schedule[]): Schedule[] {
    return schedules.sort((a, b) => b.id - a.id);
  }

  getRecurrenceDays(recId: string): string[] {
    const schedules = this.groupedSchedules[recId];
    if (schedules) {
      const daysSet = new Set<string>();
      schedules.forEach((schedule) => {
        schedule.recurrenceDays!.forEach(
          (day: String) => daysSet.add(day.toString()));
      });
      return Array.from(daysSet);
    }
    return [];
  }

  onScheduleCreation(schedule: Schedule[]) {
    schedule.forEach((schedule: Schedule) => {
      this.schedules.push(schedule);
    })
    this.groupSchedulesByRecurrenceId();
    this.filteredRepeatedSchedules();
    this.sortSchedulesById(this.schedules);
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalItems = this.schedules.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  onScheduleUpdate(updatedSchedule: Schedule) {
    const index = this.schedules.findIndex(schedule =>
      schedule.id === updatedSchedule.id);

    this.schedules[index] = updatedSchedule;
    this.getAllSchedules();
  }

  convertTimeFormat(time: string): string {
    return this.scheduleService.convertTimeFormat(time);
  }

  openDeleteDialog(schedule: Schedule): void {
    this.activeDropdownId = null;
    const dialogRef = this.dialog.open(PromptConfirmComponent, {
      width: '400px',
      data: {
        title: 'Delete Schedule',
        message: 'Are you sure you want to delete this schedule?',
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteSchedule(schedule);
      }
    });
  }

  getDayOfWeek(date: string | Date): string {
    return this.scheduleService.getDayOfWeek(date);
  }

  deleteSchedule(scheduleToDelete: Schedule) {
    this.scheduleService.deleteSchedule(scheduleToDelete)
      .subscribe({
        next: () => {
          this.schedules = this.schedules.filter(
            schedule => schedule.id !== scheduleToDelete.id
          );
          this.updatePagination();
        }
      })
  }

  getAcademicYears() {
    this.schoolYearService.getSchoolYears().subscribe({
      next: (academicYears: SchoolYear[]) => {
        this.academicYears = academicYears;
      }
    })
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
    return Array(this.totalPages).fill(0).map((_, i) => i + 1);
  }

  getDisplayRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage,
      this.totalItems);
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
    this.activeDropdownId = this.activeDropdownId === scheduleId ? null : scheduleId;
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
    this.activeDropdownId = null;
    if (schedule.recurrenceId) {
      this.router.navigate(['/schedule/start', schedule.recurrenceId]).then();
    } else {
      this.router.navigate(['/attendance', schedule.id, 'select-type']).then();
    }
  }

  toggleEditSchedule(schedule: Schedule): void {
    this.activeDropdownId = null;
    this.isEditSchedule = !this.isEditSchedule;
    this.selectedSchedule = schedule;
  }

  handleEditBackToSchedule(): void {
    this.isEditSchedule = false;
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
  }

  groupSchedulesByRecurrenceId() {
    this.groupedSchedules = this.schedules.reduce((acc, schedule) => {
      if (schedule.recurrenceId) {
        if (!acc[schedule.recurrenceId]) {
          acc[schedule.recurrenceId] = [];
        }
        acc[schedule.recurrenceId].push(schedule);
      }
      return acc;
    }, {} as { [key: string]: Schedule[] });
  }

  onAddScheduleClick() {
    this.isDropdownOpenAddSchedule = !this.isDropdownOpenAddSchedule;
  }

  onRequestScheduleClick() {
    this.isDropdownOpenRequestSchedule = !this.isDropdownOpenRequestSchedule;
  }

  onFilterChange() {

    if(this.getRole() != "STUDENT"){
      const isProgramChanged = this.prevSelectedProgram !== this.selectedProgram;

      if(isProgramChanged) {
        this.sections = [];
        this.selectedYearAndSection = -1;
        this.getSections();
        this.prevSelectedProgram = this.selectedProgram;
      }

      this.schedules = this.scheduleContainer.filter(
          schedule => schedule.schoolYear?.id === this.selectedAcademicYear
              && schedule.semester?.id === this.selectedSemester
              && schedule.section?.program.id === this.selectedProgram
      )
    } else {
      this.schedules = this.scheduleContainer.filter(
          schedule => schedule.schoolYear?.id === this.selectedAcademicYear
              && schedule.semester?.id === this.selectedSemester
      )
    }

    this.groupSchedulesByRecurrenceId();
    this.filteredRepeatedSchedules();
    this.sortSchedulesById(this.schedules);
    this.totalItems = this.schedules.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
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

  toggleViewSchedule(schedule: Schedule) {
    this.activeDropdownId = null;
    this.router.navigate(["/view/schedule", schedule.id]).then();
  }

  getSectionId(userId: number) {
    this.userService.getUserById(userId).subscribe({
      next: (user: User) => {
        if (!user.id) return;
        this.getStudentSchedules(+user.id!);
      }
    })
  }

  getStudentSchedules(userId: number) {
    this.scheduleService.getStudentsSchedule(userId).subscribe({
      next: (schedules: Schedule[]) => {
        this.schedules = schedules;
        this.scheduleContainer = schedules;
        this.groupSchedulesByRecurrenceId();
        this.filteredRepeatedSchedules();
        this.sortSchedulesById(this.schedules);
        this.setLatestSchoolYear();
        this.getSemester();
        this.totalItems = this.schedules.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      }
    })
  }

  generatePdf() {

    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    const imgWidth = 115;
    const imgHeight = 15;
    const xOffset = (pageWidth - imgWidth) / 2;
    doc.addImage(this.headerImage, 'PNG', xOffset, 5, imgWidth, imgHeight);

    const title = 'SCHEDULE LIST';
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, 30, {align: 'center'});

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Date/Time Printed:', pageWidth / 2.1, 35, {align: 'right'});
    doc.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleString();
    doc.text(currentDate, pageWidth / 2, 35);

    const columns = ['Subject Code', 'Subject Name', 'Schedule', 'Time', 'Faculty', 'Class', 'Laboratory'];
    const rows = this.schedules.map(schedule =>
      [
        schedule.subject?.code,
        schedule.subject?.description,
        schedule.recurrenceDays,
        `${this.convertTimeFormat(
          schedule.startTime)} - ${this.convertTimeFormat(schedule.endTime)}`,
        `${schedule.professor?.firstName} ${schedule.professor?.lastName}`,
        `${schedule.section?.program.programAbbreviation} ${schedule.section?.year} - ${schedule.section?.section}`,
        schedule.laboratory?.name
      ]);

    doc.autoTable({
      head: [columns],
      body: rows,
      startY: 40,
      theme: 'grid',
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
      }
    });

    doc.save('schedule-list.pdf');
  }

  loadImageToBase64(url: string, callback: (base64Image: string) => void): void {
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

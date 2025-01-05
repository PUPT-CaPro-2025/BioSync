import {Component, OnInit, HostListener} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import {SchoolYear} from "../../model/school.year.model";
import {Schedule} from "../../model/schedule.model";
import {ScheduleService} from "../../services/schedule.service";
import {MatDialog} from "@angular/material/dialog";
import {SchoolYearService} from "../../services/school.year.service";
import {Router} from "@angular/router";
import {CryptoService} from "../../services/crypto.service";
import {CookieService} from "../../services/cookie.service";
import {UserService} from "../../services/user.service";
import {User} from "../../model/user.model";
import jsPDF from "jspdf";
import {AttendanceService} from "../../services/attendance.service";
import {Attendance} from "../../model/attendance.model";
import { Program } from '../../model/program.model';
import { ProgramService } from '../../services/program.service';
import { Section } from '../../model/section.model';
import { SectionService } from '../../services/section.service';


@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, CommonModule, FormsModule, MatSelectModule],
  providers: [
    ScheduleService, 
    SchoolYearService,
    ProgramService,
    SectionService,
    UserService, 
    CookieService, 
    CryptoService, 
    AttendanceService
  ],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css', '../schedule/schedule.component.css']
})
export class AttendanceComponent implements OnInit{
  entries: string[] = [
    '10', '20', '30', '40', '50'
  ];

  sorting: string[] = [
    'Subject Code', 'Alphabetical', 'Date'
  ];

  academicYears: SchoolYear[] = [];
  selectedAcademicYear: number | undefined;

  semesters: string[] = [
    'First Semester', 'Second Semester', 'Summer Semester',
  ];
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
  userId!: number;
  headerImage!: string;
  attendances: Attendance[] = [];
  activeDropdownId: number | null = null;

  constructor(
    private scheduleService: ScheduleService,
    private dialog: MatDialog,
    private schoolYearService: SchoolYearService,
    private sectionService: SectionService,
    private programService: ProgramService,
    private router : Router,
    private cryptoService: CryptoService,
    private cookieService: CookieService,
    private userService: UserService,
    private attendanceService: AttendanceService
  ) {}

  ngOnInit() {
    if(this.getRole() === "ADMIN"){
      this.getAllSchedules();
    } else if (this.getRole() === "FACULTY"){
      this.getUserId();
      this.getFacultySchedule(this.userId);
    } else {
      this.getUserId();
      this.getSectionId(this.userId);
    }
    this.getAcademicYears();
    this. getAllPrograms();
    this.getSections();

    this.loadImageToBase64('../../assets/header.png', (base64Image) => {
      this.headerImage = base64Image;
    });
  }

  getAllSchedules() {
    this.scheduleService.getAllSchedules().subscribe({
      next: (schedules) => {
        this.schedules = schedules.filter(schedule => schedule.hasFinished);
        this.scheduleContainer = schedules.filter(schedule => schedule.hasFinished);
        this.getAllAttendance();
        this.sortSchedulesById(this.schedules);
        this.setLatestSchoolYear();
        this.setLatestProgram();
        this.getSections();
        this.totalItems = this.schedules.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      },
      error: (err) => console.error(err),
    });
  }

  getAllAttendance(){
    this.attendanceService.getAttendance().subscribe({
      next: value => {
        this.attendances = value;
      }
    })
  }

  getUserId(){
    const encryptedUserId = decodeURIComponent(this.cookieService.getCookie("user_id")!);
    this.userId = +this.cryptoService.decrypt(encryptedUserId);
  }

  getRole(){
    return this.cryptoService.decrypt(
      decodeURIComponent(this.cookieService.getCookie("role")!));
  }

  getFacultySchedule(facultyId: number) {
    this.scheduleService.getAllSchedulesByProfessorId(facultyId).subscribe({
      next: (schedules: Schedule[]) => {
        this.schedules = schedules.filter(schedule => schedule.hasFinished);
        this.scheduleContainer = schedules.filter(schedule => schedule.hasFinished);
        this.sortSchedulesById(this.schedules);
        this.setLatestSchoolYear();
        this.setLatestProgram();
        this.getSections();
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
    }
  }

  sortSchedulesById(schedules: Schedule[]): Schedule[] {
    return schedules.sort((a, b) => b.id - a.id);
  }

  convertTimeFormat(time: string): string {
    return this.scheduleService.convertTimeFormat(time);
  }

  getDayOfWeek(date: string | Date): string {
    return this.scheduleService.getDayOfWeek(date);
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

  toggleDropdownAction(attendanceId: number): void {
    this.activeDropdownId = this.activeDropdownId === attendanceId ? null : attendanceId;
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

  onFilterChange() {
    const programChanged = this.prevSelectedProgram != this.selectedProgram;

    if(programChanged) {
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

    this.sortSchedulesById(this.schedules);
    this.totalItems = this.schedules.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
  }

  toggleViewAttendance(schedule: Schedule) {
    this.activeDropdownId = null;
    this.router.navigate(["/view/attendance", schedule.id]).then();
  }

  getSectionId(userId: number) {
    this.userService.getUserById(userId).subscribe({
      next: (user: User) => {
        if(!user.id) return;
        this.getStudentSchedules(+user.section?.id!);
      }
    })
  }

  getStudentSchedules(sectionId: number){
    this.scheduleService.getAllSchedulesBySectionId(sectionId).subscribe({
      next: (schedules: Schedule[]) => {
        console.log(schedules)
        this.schedules = schedules.filter(schedule => schedule.hasFinished);
        this.scheduleContainer = schedules.filter(schedule => schedule.hasFinished);
        this.sortSchedulesById(this.schedules);
        this.setLatestSchoolYear();
        this.totalItems = this.schedules.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      }
    })
  }

  generatePdf() {

    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const imgWidth = 115;
    const imgHeight = 15;
    const xOffset = (pageWidth - imgWidth) / 2;
    doc.addImage(this.headerImage, 'PNG', xOffset, 5, imgWidth, imgHeight);

    const title = 'ATTENDANCE LIST';
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, 30, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Date/Time Printed:', pageWidth / 2.1, 35, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleString();
    doc.text(currentDate, pageWidth / 2, 35);

    const columns = ['Subject', 'Date', 'Student Name', 'Status'];
    const rows = this.attendances.map(attendance =>
      [
        attendance.schedule.subject?.name,
        attendance.schedule.scheduleDate,
        `${attendance.user.firstName} ${attendance.user.lastName}`,
        attendance.status
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

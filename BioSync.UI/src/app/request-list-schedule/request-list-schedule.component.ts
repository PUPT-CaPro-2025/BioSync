import {Component, Input, OnInit, HostListener} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { Schedule } from '../../model/schedule.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import {ScheduleService} from "../../services/schedule.service";
import {PromptConfirmComponent} from "../prompt/prompt-confirm/prompt-confirm.component";
import {MatDialog} from "@angular/material/dialog";
import {SchoolYearService} from "../../services/school.year.service";
import {SchoolYear} from "../../model/school.year.model";
import {Router} from "@angular/router";
import {CryptoService} from "../../services/crypto.service";
import {CookieService} from "../../services/cookie.service";
import {User} from "../../model/user.model";
import {UserService} from "../../services/user.service";
import jsPDF from "jspdf";
import {PromptOkayComponent} from "../prompt/prompt-okay/prompt-okay.component";
@Component({
  selector: 'app-request-list-schedule',
  standalone: true,
  imports: [MatToolbarModule,
    MatIconModule,
    CommonModule,
    FormsModule,
    MatSelectModule,
  ],
  providers: [ScheduleService,
    SchoolYearService,
    UserService,
    CookieService,
    CryptoService
  ],
  templateUrl: './request-list-schedule.component.html',
  styleUrls: ['./request-list-schedule.component.css', '../schedule/schedule.component.css']
})
export class RequestListScheduleComponent implements OnInit {
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

  schedules: Schedule[] = [];
  scheduleContainer: Schedule[] = [];

  @Input() totalItems: number = 500;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = Math.ceil(this.totalItems / this.itemsPerPage);
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

  constructor(
    private scheduleService: ScheduleService,
    private dialog: MatDialog,
    private schoolYearService: SchoolYearService,
    private router : Router,
    private cryptoService: CryptoService,
    private cookieService: CookieService,
    private userService: UserService
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

    this.loadImageToBase64('../../assets/header.png', (base64Image) => {
      this.headerImage = base64Image;
    });
  }

  getAllSchedules() {
    this.scheduleService.getAllPendingSchedules().subscribe({
      next: (schedules) => {
        this.schedules = schedules;
        this.scheduleContainer = schedules;
        this.groupSchedulesByRecurrenceId();
        this.filteredRepeatedSchedules();
        this.sortSchedulesById(this.schedules);
        this.setLatestSchoolYear();
      },
      error: (err) => console.error(err),
    });
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
        this.schedules = schedules;
        this.scheduleContainer = schedules;
        this.groupSchedulesByRecurrenceId();
        this.filteredRepeatedSchedules();
        this.sortSchedulesById(this.schedules);
        this.setLatestSchoolYear();
      }
    })
  }

  setLatestSchoolYear() {
    if (this.schedules && this.schedules.length > 0) {
      const latestSchedule = this.schedules[this.schedules.length - 1];
      this.selectedAcademicYear = latestSchedule.schoolYear?.id;
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
        schedule.recurrenceDays!.forEach((day: String) => daysSet.add(day.toString()));
      });
      return Array.from(daysSet);
    }
    return [];
  }

  onScheduleCreation(schedule: Schedule[]){
    schedule.forEach((schedule: Schedule) => {
      this.schedules.push(schedule);
    })
    this.groupSchedulesByRecurrenceId();
    this.filteredRepeatedSchedules();
    this.sortSchedulesById(this.schedules);
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

  getDayOfWeek(date: string | Date): string {
    return this.scheduleService.getDayOfWeek(date);
  }

  deleteSchedule(scheduleToDelete: Schedule){
    this.scheduleService.deleteSchedule(scheduleToDelete)
      .subscribe({
        next: () => {
          this.schedules = this.schedules.filter(
            schedule => schedule.id !== scheduleToDelete.id
          )
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
    if(schedule.recurrenceId) {
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
    this.schedules.forEach(schedule => {
      if (schedule.recurrenceId != null) {
        if(!recurrenceIdStorage.includes(schedule.recurrenceId)) {
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
    this.schedules = this.scheduleContainer.filter(
      schedule => schedule.schoolYear?.id === this.selectedAcademicYear
      && schedule.semester?.id === this.selectedSemester
    )
    this.groupSchedulesByRecurrenceId();
    this.filteredRepeatedSchedules();
    this.sortSchedulesById(this.schedules);
  }

  toggleViewSchedule(schedule: Schedule) {
    this.router.navigate(["/view/schedule", schedule.id]).then();
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
        this.schedules = schedules;
        this.scheduleContainer = schedules;
        this.groupSchedulesByRecurrenceId();
        this.filteredRepeatedSchedules();
        this.sortSchedulesById(this.schedules);
        this.setLatestSchoolYear();
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

    const title = 'SCHEDULE LIST';
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, 30, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Date/Time Printed:', pageWidth / 2.1, 35, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleString();
    doc.text(currentDate, pageWidth / 2, 35);

    const columns = ['Subject Code', 'Subject Name', 'Schedule', 'Time', 'Faculty', 'Class' ,'Laboratory'];
    const rows = this.schedules.map(schedule =>
      [
        schedule.subject?.code,
        schedule.subject?.name,
        schedule.recurrenceDays,
        `${this.convertTimeFormat(schedule.startTime)} - ${this.convertTimeFormat(schedule.endTime)}`,
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

  toggleAcceptSchedule(schedule: Schedule) {
    this.activeDropdownId = null;
    this.openAcceptDialog(schedule);
  }

  openAcceptDialog(schedule: Schedule): void {
    const dialogRef = this.dialog.open(PromptConfirmComponent, {
      width: '400px',
      data: {
        title: 'Accept Schedule',
        message: 'Are you sure you want to accept this schedule?',
        action: 'Accept'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(!result) return
      this.scheduleService.processScheduleDecision(schedule, "APPROVED").subscribe({
        next: value => {
          this.openMessageDialog(true, schedule.id)
        }
      });
    });
  }

  openRejectDialog(schedule: Schedule): void {
    const dialogRef = this.dialog.open(PromptConfirmComponent, {
      width: '400px',
      data: {
        title: 'Reject Schedule',
        message: 'Are you sure you want to reject this schedule?',
        action: 'Reject'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(!result) return
      this.scheduleService.processScheduleDecision(schedule, "REJECTED").subscribe({
        next: value => {
          this.openMessageDialog(false, schedule.id)
        }
      });
    });
  }

  openMessageDialog(isAccept: boolean, scheduleId: number){
    const dialogRef = this.dialog.open(PromptOkayComponent, {
      width: '400px',
      data: {
        title: isAccept ? "Schedule Accepted" : "Schedule Rejected",
        message: `Schedule successfully ${isAccept ? "accepted" : "rejected"}`
      }
    })

    dialogRef.afterClosed().subscribe(() => {
      this.schedules = this.schedules.filter(schedule => schedule.id != scheduleId)
    })
  }

  toggleRejectSchedule(schedule: Schedule) {
    this.activeDropdownId = null;
    this.openRejectDialog(schedule)
  }
}

import {Component, Input, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import {AddScheduleComponent} from "../add-schedule/add-schedule.component";
import {EditScheduleComponent} from "../edit-schedule/edit-schedule.component";
import {SchoolYear} from "../../model/school.year.model";
import {Schedule} from "../../model/schedule.model";
import {ScheduleService} from "../../services/schedule.service";
import {MatDialog} from "@angular/material/dialog";
import {SchoolYearService} from "../../services/school.year.service";
import {Router} from "@angular/router";
import {CryptoService} from "../../services/crypto.service";
import {CookieService} from "../../services/cookie.service";
import {UserService} from "../../services/user.service";
import {PromptConfirmComponent} from "../prompt-confirm/prompt-confirm.component";
import {User} from "../../model/user.model";

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, CommonModule, FormsModule, AddScheduleComponent, MatSelectModule, EditScheduleComponent],
  providers: [ScheduleService, SchoolYearService, UserService, CookieService, CryptoService],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.css'
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

  schedules: Schedule[] = [];
  scheduleContainer: Schedule[] = [];

  @Input() totalItems: number = 500;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = Math.ceil(this.totalItems / this.itemsPerPage);
  userId!: number;

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
  }

  getAllSchedules() {
    this.scheduleService.getAllSchedules().subscribe({
      next: (schedules) => {
        this.schedules = schedules.filter(schedule => schedule.hasFinished);
        this.scheduleContainer = schedules.filter(schedule => schedule.hasFinished);
        this.sortSchedulesById(this.schedules);
        //this.filteredRepeatedSchedules();
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
        this.schedules = schedules.filter(schedule => schedule.hasFinished);
        this.scheduleContainer = schedules;
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
      console.log(this.selectedAcademicYear);
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

  onFilterChange() {
    this.schedules = this.scheduleContainer.filter(
      schedule => schedule.schoolYear?.id === this.selectedAcademicYear
        && schedule.semester?.id === this.selectedSemester
    )
    this.filteredRepeatedSchedules();
    this.sortSchedulesById(this.schedules);
  }

  toggleViewAttendance(schedule: Schedule) {
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
        this.schedules = schedules;
        this.scheduleContainer = schedules;
        this.filteredRepeatedSchedules();
        this.sortSchedulesById(this.schedules);
        this.setLatestSchoolYear();
      }
    })
  }
}

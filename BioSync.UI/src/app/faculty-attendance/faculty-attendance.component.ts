import {Component, Input} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { EditScheduleComponent } from '../edit-schedule/edit-schedule.component';

interface Attendance {
  subject: string,
  courseYearSection: string,
  scheduleDate: string,
  laboratory: string,
  timeStarted: string,
  timeEnded: string
}

@Component({
  selector: 'app-faculty-attendance',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, CommonModule, FormsModule, MatSelectModule, EditScheduleComponent],
  templateUrl: './faculty-attendance.component.html',
  styleUrl: './faculty-attendance.component.css'
})
export class FacultyAttendanceComponent {
  entries: string[] = [
    '10', '20', '30', '40', '50'
  ];

  sorting: string[] = [
    'Subject Code', 'Alphabetical', 'Date'
  ];

  yearSemesters: string[] = [
    'School Year 2324 - First Semester', 'School Year 2324 - Second Semester', 'School Year 2324 - Summer'
  ];

  selectedYearSem = 'School Year 2324 - Summer';

   //Temporary Data
   attendances: Attendance[] = [
    { subject: "Fundamentals to Computing", courseYearSection: "BSIT 3-1", scheduleDate: "1:00 PM - 3:00 PM / MON, FRI", laboratory: "DOST Laboratory", timeStarted: "1:00 PM", timeEnded: "3:00 PM" },
    { subject: "Computer Programming I", courseYearSection: "BSIT 3-1", scheduleDate: "7:30 AM - 10:30 AM / TUE", laboratory: "Aboitiz Laboratory", timeStarted: "7:30 AM", timeEnded: "10:30 AM" },
  ];

  @Input() totalItems: number = 500;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = Math.ceil(this.totalItems / this.itemsPerPage);
  isEditSchedule: boolean = false;
  isViewSchedule: boolean = false;

  get pages(): number[] {
    return Array(this.totalPages).fill(0).map((_, i) => i + 1);
  }

  getDisplayRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `${start}-${end}`;
  }

  get filteredAttendances(): Attendance[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.attendances.slice(startIndex, endIndex);
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

  toggleEditSchedule(): void {
    this.isEditSchedule = !this.isEditSchedule;
  }

  handleEditBackToSchedule(): void {
    this.isEditSchedule = false;
  }

  toggleViewSchedule(): void {
    this.isViewSchedule = !this.isViewSchedule;
  }

  handleViewBackToSchedule(): void {
    this.isViewSchedule = false;
  }
}

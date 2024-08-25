import { Component, Input } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';

interface studentSchedule {
  student_number: string;
  last_name: string;
  first_name: string;
  time_in: string;
  time_out: string;
  subject_name: string;
  schedule_date: string;
  section: string;
  start_time: string;
  end_time: string;
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, CommonModule, FormsModule, MatSelectModule],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.css'
})
export class AttendanceComponent {
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

    //Temporary data
  student: studentSchedule[] = [
    { student_number: "2021-00123-TG-0", last_name: "Doe", first_name:"John", time_in: "7:30 AM", time_out: "10:30 AM", subject_name: "Fundamentals of Computing", schedule_date: "09/08/2024", section: "BSIT 3-1", start_time: "7:30 AM", end_time: "10:30 AM"},
    { student_number: "2022-00456-TG-0", last_name: "Ramirez", first_name:"Lemmuel", time_in: "01:00 PM", time_out: "05:00 PM", subject_name: "Computer Programming I", schedule_date: "10/06/2024", section: "BSIT 2-1", start_time: "01:00 PM", end_time: "05:00 PM"},
    { student_number: "2022-00789-TG-0", last_name: "Kinoshita", first_name:"Aaron", time_in: "01:00 PM", time_out: "01:00 PM", subject_name: "Information Technology Fundamentals", schedule_date: "24/07/2024", section: "BSIT 2-1", start_time: "01:00 PM", end_time: "05:00 PM"},
  ];

  @Input() totalItems: number = 500;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = Math.ceil(this.totalItems / this.itemsPerPage);
  isAddSchedule: boolean = false;
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

  get filteredAttendance(): studentSchedule[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.student.slice(startIndex, endIndex);
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

  toggleAddSchedule(): void {
    this.isAddSchedule = !this.isAddSchedule;
  }

  handleBackToSchedule(): void {
    this.isAddSchedule = false;
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

import { Component, Input } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';

interface subjectSchedule {
  subject_code: string;
  subject_name: string
  course: string;
  year: string;
  section: string;
  start_time: string;
  end_time: string;
  schedule_date: string;
  laboratory: string;
  time_started: string;
  time_ended: string;
}

@Component({
  selector: 'app-subject-schedule-student',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, CommonModule, FormsModule, MatSelectModule],
  templateUrl: './subject-schedule-student.component.html',
  styleUrl: './subject-schedule-student.component.css'
})
export class SubjectScheduleStudentComponent {
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
  student: subjectSchedule[] = [
    { subject_code: "COMP 1103", subject_name: "Fundamentals of Computing", start_time: "7:30 AM", end_time: "10:30 AM", schedule_date: "MON, FRI", course: "BSIT", year: "1", section: "1", laboratory: "DOST Laboratory", time_started: "7:30 AM", time_ended: "10:30 AM",}
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

  get filteredSubjectScheduleStudent(): subjectSchedule[] {
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
}

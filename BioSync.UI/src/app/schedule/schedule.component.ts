import { Component, Input } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { Schedule } from '../../model/schedule-model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddScheduleComponent } from '../add-schedule/add-schedule.component';
import { MatSelectModule } from '@angular/material/select';
import { EditScheduleComponent } from '../edit-schedule/edit-schedule.component';
import { ViewScheduleComponent } from '../view-schedule/view-schedule.component';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, CommonModule, FormsModule, AddScheduleComponent, MatSelectModule, EditScheduleComponent, ViewScheduleComponent],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css',
})

export class ScheduleComponent {
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
  schedule: Schedule[] = [
    { subject_code: 'COMP 1103', subject_name: 'Fundamentals of Computing', section: "BSIT 3-1", start_time: "7:30 AM", end_time: "10:30 AM", schedule_date: "09/08/2024", laboratory: 'DOST Laboratory', professor: "Gecilie Almirañez", semester: "Summer", start_year: 2023, end_year: 2024, remarks: "Laboratory" },
    { subject_code: 'COMP 2013', subject_name: 'Computer Programming I', section: "BSIT 2-1", start_time: "01:00 PM", end_time: "05:00 PM", schedule_date: "10/06/2024", laboratory: 'DOST Laboratory', professor: "Steven Villarosa", semester: "2nd Semester", start_year: 2023, end_year: 2024, remarks: "Laboratory" },
    { subject_code: 'COMP 2103', subject_name: 'Information Technology Fundamentals', section: "BSIT 2-1", start_time: "01:00 PM", end_time: "05:00 PM", schedule_date: "24/07/2024", laboratory: 'Aboitiz Laboratory', professor: "Dustin Santos", semester: "1st Semester", start_year: 2023, end_year: 2024, remarks: "Laboratory"},
    { subject_code: 'COMP 1103', subject_name: 'Fundamentals of Computing', section: "BSIT 3-1", start_time: "7:30 AM", end_time: "10:30 AM", schedule_date: "09/08/2024", laboratory: 'DOST Laboratory', professor: "Gecilie Almirañez", semester: "Summer", start_year: 2023, end_year: 2024, remarks: "Laboratory" },
    { subject_code: 'COMP 2013', subject_name: 'Computer Programming I', section: "BSIT 2-1", start_time: "01:00 PM", end_time: "05:00 PM", schedule_date: "10/06/2024", laboratory: 'DOST Laboratory', professor: "Steven Villarosa", semester: "2nd Semester", start_year: 2023, end_year: 2024, remarks: "Laboratory" },
    { subject_code: 'COMP 2103', subject_name: 'Information Technology Fundamentals', section: "BSIT 2-1", start_time: "01:00 PM", end_time: "05:00 PM", schedule_date: "24/07/2024", laboratory: 'Aboitiz Laboratory', professor: "Dustin Santos", semester: "1st Semester", start_year: 2023, end_year: 2024, remarks: "Laboratory"},
    { subject_code: 'COMP 1103', subject_name: 'Fundamentals of Computing', section: "BSIT 3-1", start_time: "7:30 AM", end_time: "10:30 AM", schedule_date: "09/08/2024", laboratory: 'DOST Laboratory', professor: "Gecilie Almirañez", semester: "Summer", start_year: 2023, end_year: 2024, remarks: "Laboratory" },
    { subject_code: 'COMP 2013', subject_name: 'Computer Programming I', section: "BSIT 2-1", start_time: "01:00 PM", end_time: "05:00 PM", schedule_date: "10/06/2024", laboratory: 'DOST Laboratory', professor: "Steven Villarosa", semester: "2nd Semester", start_year: 2023, end_year: 2024, remarks: "Laboratory" },
    { subject_code: 'COMP 2103', subject_name: 'Information Technology Fundamentals', section: "BSIT 2-1", start_time: "01:00 PM", end_time: "05:00 PM", schedule_date: "24/07/2024", laboratory: 'Aboitiz Laboratory', professor: "Dustin Santos", semester: "1st Semester", start_year: 2023, end_year: 2024, remarks: "Laboratory"},
    { subject_code: 'COMP 1103', subject_name: 'Fundamentals of Computing', section: "BSIT 3-1", start_time: "7:30 AM", end_time: "10:30 AM", schedule_date: "09/08/2024", laboratory: 'DOST Laboratory', professor: "Gecilie Almirañez", semester: "Summer", start_year: 2023, end_year: 2024, remarks: "Laboratory" },
    { subject_code: 'COMP 2013', subject_name: 'Computer Programming I', section: "BSIT 2-1", start_time: "01:00 PM", end_time: "05:00 PM", schedule_date: "10/06/2024", laboratory: 'DOST Laboratory', professor: "Steven Villarosa", semester: "2nd Semester", start_year: 2023, end_year: 2024, remarks: "Laboratory" },
    { subject_code: 'COMP 2103', subject_name: 'Information Technology Fundamentals', section: "BSIT 2-1", start_time: "01:00 PM", end_time: "05:00 PM", schedule_date: "24/07/2024", laboratory: 'Aboitiz Laboratory', professor: "Dustin Santos", semester: "1st Semester", start_year: 2023, end_year: 2024, remarks: "Laboratory"},
    { subject_code: 'COMP 1103', subject_name: 'Fundamentals of Computing', section: "BSIT 3-1", start_time: "7:30 AM", end_time: "10:30 AM", schedule_date: "09/08/2024", laboratory: 'DOST Laboratory', professor: "Gecilie Almirañez", semester: "Summer", start_year: 2023, end_year: 2024, remarks: "Laboratory" },
    { subject_code: 'COMP 2013', subject_name: 'Computer Programming I', section: "BSIT 2-1", start_time: "01:00 PM", end_time: "05:00 PM", schedule_date: "10/06/2024", laboratory: 'DOST Laboratory', professor: "Steven Villarosa", semester: "2nd Semester", start_year: 2023, end_year: 2024, remarks: "Laboratory" },
    { subject_code: 'COMP 2103', subject_name: 'Information Technology Fundamentals', section: "BSIT 2-1", start_time: "01:00 PM", end_time: "05:00 PM", schedule_date: "24/07/2024", laboratory: 'Aboitiz Laboratory', professor: "Dustin Santos", semester: "1st Semester", start_year: 2023, end_year: 2024, remarks: "Laboratory"},
    { subject_code: 'COMP 1103', subject_name: 'Fundamentals of Computing', section: "BSIT 3-1", start_time: "7:30 AM", end_time: "10:30 AM", schedule_date: "09/08/2024", laboratory: 'DOST Laboratory', professor: "Gecilie Almirañez", semester: "Summer", start_year: 2023, end_year: 2024, remarks: "Laboratory" },
    { subject_code: 'COMP 2013', subject_name: 'Computer Programming I', section: "BSIT 2-1", start_time: "01:00 PM", end_time: "05:00 PM", schedule_date: "10/06/2024", laboratory: 'DOST Laboratory', professor: "Steven Villarosa", semester: "2nd Semester", start_year: 2023, end_year: 2024, remarks: "Laboratory" },
    { subject_code: 'COMP 2103', subject_name: 'Information Technology Fundamentals', section: "BSIT 2-1", start_time: "01:00 PM", end_time: "05:00 PM", schedule_date: "24/07/2024", laboratory: 'Aboitiz Laboratory', professor: "Dustin Santos", semester: "1st Semester", start_year: 2023, end_year: 2024, remarks: "Laboratory"},
    { subject_code: 'COMP 1103', subject_name: 'Fundamentals of Computing', section: "BSIT 3-1", start_time: "7:30 AM", end_time: "10:30 AM", schedule_date: "09/08/2024", laboratory: 'DOST Laboratory', professor: "Gecilie Almirañez", semester: "Summer", start_year: 2023, end_year: 2024, remarks: "Laboratory" },
    { subject_code: 'COMP 2013', subject_name: 'Computer Programming I', section: "BSIT 2-1", start_time: "01:00 PM", end_time: "05:00 PM", schedule_date: "10/06/2024", laboratory: 'DOST Laboratory', professor: "Steven Villarosa", semester: "2nd Semester", start_year: 2023, end_year: 2024, remarks: "Laboratory" },
    { subject_code: 'COMP 2103', subject_name: 'Information Technology Fundamentals', section: "BSIT 2-1", start_time: "01:00 PM", end_time: "05:00 PM", schedule_date: "24/07/2024", laboratory: 'Aboitiz Laboratory', professor: "Dustin Santos", semester: "1st Semester", start_year: 2023, end_year: 2024, remarks: "Laboratory"},
    { subject_code: 'COMP 1103', subject_name: 'Fundamentals of Computing', section: "BSIT 3-1", start_time: "7:30 AM", end_time: "10:30 AM", schedule_date: "09/08/2024", laboratory: 'DOST Laboratory', professor: "Gecilie Almirañez", semester: "Summer", start_year: 2023, end_year: 2024, remarks: "Laboratory" },
    { subject_code: 'COMP 2013', subject_name: 'Computer Programming I', section: "BSIT 2-1", start_time: "01:00 PM", end_time: "05:00 PM", schedule_date: "10/06/2024", laboratory: 'DOST Laboratory', professor: "Steven Villarosa", semester: "2nd Semester", start_year: 2023, end_year: 2024, remarks: "Laboratory" },
    { subject_code: 'COMP 2103', subject_name: 'Information Technology Fundamentals', section: "BSIT 2-1", start_time: "01:00 PM", end_time: "05:00 PM", schedule_date: "24/07/2024", laboratory: 'Aboitiz Laboratory', professor: "Dustin Santos", semester: "1st Semester", start_year: 2023, end_year: 2024, remarks: "Laboratory"},
    { subject_code: 'COMP 1103', subject_name: 'Fundamentals of Computing', section: "BSIT 3-1", start_time: "7:30 AM", end_time: "10:30 AM", schedule_date: "09/08/2024", laboratory: 'DOST Laboratory', professor: "Gecilie Almirañez", semester: "Summer", start_year: 2023, end_year: 2024, remarks: "Laboratory" },
    { subject_code: 'COMP 2013', subject_name: 'Computer Programming I', section: "BSIT 2-1", start_time: "01:00 PM", end_time: "05:00 PM", schedule_date: "10/06/2024", laboratory: 'DOST Laboratory', professor: "Steven Villarosa", semester: "2nd Semester", start_year: 2023, end_year: 2024, remarks: "Laboratory" },
    { subject_code: 'COMP 2103', subject_name: 'Information Technology Fundamentals', section: "BSIT 2-1", start_time: "01:00 PM", end_time: "05:00 PM", schedule_date: "24/07/2024", laboratory: 'Aboitiz Laboratory', professor: "Dustin Santos", semester: "1st Semester", start_year: 2023, end_year: 2024, remarks: "Laboratory"},
    { subject_code: 'COMP 1103', subject_name: 'Fundamentals of Computing', section: "BSIT 3-1", start_time: "7:30 AM", end_time: "10:30 AM", schedule_date: "09/08/2024", laboratory: 'DOST Laboratory', professor: "Gecilie Almirañez", semester: "Summer", start_year: 2023, end_year: 2024, remarks: "Laboratory" },
    { subject_code: 'COMP 2013', subject_name: 'Computer Programming I', section: "BSIT 2-1", start_time: "01:00 PM", end_time: "05:00 PM", schedule_date: "10/06/2024", laboratory: 'DOST Laboratory', professor: "Steven Villarosa", semester: "2nd Semester", start_year: 2023, end_year: 2024, remarks: "Laboratory" },
    { subject_code: 'COMP 2103', subject_name: 'Information Technology Fundamentals', section: "BSIT 2-1", start_time: "01:00 PM", end_time: "05:00 PM", schedule_date: "24/07/2024", laboratory: 'Aboitiz Laboratory', professor: "Dustin Santos", semester: "1st Semester", start_year: 2023, end_year: 2024, remarks: "Laboratory"},
    { subject_code: 'COMP 1103', subject_name: 'Fundamentals of Computing', section: "BSIT 3-1", start_time: "7:30 AM", end_time: "10:30 AM", schedule_date: "09/08/2024", laboratory: 'DOST Laboratory', professor: "Gecilie Almirañez", semester: "Summer", start_year: 2023, end_year: 2024, remarks: "Laboratory" },
    { subject_code: 'COMP 2013', subject_name: 'Computer Programming I', section: "BSIT 2-1", start_time: "01:00 PM", end_time: "05:00 PM", schedule_date: "10/06/2024", laboratory: 'DOST Laboratory', professor: "Steven Villarosa", semester: "2nd Semester", start_year: 2023, end_year: 2024, remarks: "Laboratory" },
    { subject_code: 'COMP 2103', subject_name: 'Information Technology Fundamentals', section: "BSIT 2-1", start_time: "01:00 PM", end_time: "05:00 PM", schedule_date: "24/07/2024", laboratory: 'Aboitiz Laboratory', professor: "Dustin Santos", semester: "1st Semester", start_year: 2023, end_year: 2024, remarks: "Laboratory"},
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

  get filteredSchedules(): Schedule[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.schedule.slice(startIndex, endIndex);
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

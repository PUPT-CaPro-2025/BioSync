import { Student } from '../../model/student-model';
import { Component, Input } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { Schedule } from '../../model/schedule-model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { AddStudentComponent } from '../add-student/add-student.component';
import { EditStudentComponent } from '../edit-student/edit-student.component';

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, CommonModule, FormsModule, MatSelectModule, AddStudentComponent, EditStudentComponent],
  templateUrl: './student.component.html',
  styleUrl: './student.component.css'
})
export class StudentComponent {
  //Temporary data
  students: Student[] = [
    { id: 1, student_number: "2021-00123-TG-0", first_name: "John", last_name: "Doe", middle_initial: "B", suffix: "N/A", program: "BSIT", year: "3", section: 1 },
    { id: 2, student_number: "2021-00456-TG-0", first_name: "Jane", last_name: "Doowie", middle_initial: "S", suffix: "Jr", program: "DIT", year: "1", section: 1 },
    { id: 3, student_number: "2021-00789-TG-0", first_name: "Sarah", last_name: "Kirkkoff", middle_initial: "M", suffix: "N/A", program: "BSOA", year: "2", section: 1 },
    { id: 4, student_number: "2021-00321-TG-0", first_name: "Steve", last_name: "Montemayor", middle_initial: "T", suffix: "N/A", program: "BSIT", year: "4", section: 1 },
    { id: 5, student_number: "2021-00654-TG-0", first_name: "Reymark", last_name: "Astrono", middle_initial: "N/A", suffix: "2nd", program: "BSOA", year: "4", section: 1 },
    { id: 6, student_number: "2021-00987-TG-0", first_name: "Maribelle", last_name: "Hernandez", middle_initial: "F", suffix: "N/A", program: "DIT", year: "2", section: 1 },
  ]

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

  @Input() totalItems: number = 500;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = Math.ceil(this.totalItems / this.itemsPerPage);
  isAddStudent: boolean = false;
  isEditStudent: boolean = false;

  get pages(): number[] {
    return Array(this.totalPages).fill(0).map((_, i) => i + 1);
  }

  getDisplayRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `${start}-${end}`;
  }

  get filteredStudents(): Student[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.students.slice(startIndex, endIndex);
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

  toggleAddStudent(): void {
    this.isAddStudent = !this.isAddStudent;
  }

  handleBackToStudent(): void {
    this.isAddStudent = false;
  }

  toggleEditStudent(): void {
    this.isEditStudent = !this.isEditStudent;
  }

  handleEditBackToStudent(): void {
    this.isEditStudent = false;
  }
}

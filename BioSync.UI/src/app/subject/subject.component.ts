import { Component, Input } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from '../../model/subject-model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-subject',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, CommonModule, FormsModule, MatIconModule],
  templateUrl: './subject.component.html',
  styleUrl: './subject.component.css'
})
export class SubjectComponent {
  entries: string[] = [
    '10', '20', '30', '40', '50'  
  ];

  sorting: string[] = [
    'Subject Code', 'Alphabetical', 'Date'
  ];

  //Temporary data
  subjects: Subject[] = [
    { subject_code: 'COMP 1103', subject_name: 'Fundamentals of Computing' },
    { subject_code: 'COMP 2013', subject_name: 'Computer Programming I' },
    { subject_code: 'COMP 2103', subject_name: 'Information Technology Fundamentals' },
    { subject_code: 'COMP 1103', subject_name: 'Fundamentals of Computing' },
    { subject_code: 'COMP 2013', subject_name: 'Computer Programming I' },
    { subject_code: 'COMP 2103', subject_name: 'Information Technology Fundamentals' },
    { subject_code: 'COMP 1103', subject_name: 'Fundamentals of Computing' },
    { subject_code: 'COMP 2013', subject_name: 'Computer Programming I' },
    { subject_code: 'COMP 2103', subject_name: 'Information Technology Fundamentals' },
    { subject_code: 'COMP 1103', subject_name: 'Fundamentals of Computing' },
    { subject_code: 'COMP 2013', subject_name: 'Computer Programming I' },
    { subject_code: 'COMP 2103', subject_name: 'Information Technology Fundamentals' },
    { subject_code: 'COMP 1103', subject_name: 'Fundamentals of Computing' },
    { subject_code: 'COMP 2013', subject_name: 'Computer Programming I' },
    { subject_code: 'COMP 2103', subject_name: 'Information Technology Fundamentals' },
    { subject_code: 'COMP 1103', subject_name: 'Fundamentals of Computing' },
    { subject_code: 'COMP 2013', subject_name: 'Computer Programming I' },
    { subject_code: 'COMP 2103', subject_name: 'Information Technology Fundamentals' },
    { subject_code: 'COMP 1103', subject_name: 'Fundamentals of Computing' },
    { subject_code: 'COMP 2013', subject_name: 'Computer Programming I' },
    { subject_code: 'COMP 2103', subject_name: 'Information Technology Fundamentals' },
    { subject_code: 'COMP 1103', subject_name: 'Fundamentals of Computing' },
    { subject_code: 'COMP 2013', subject_name: 'Computer Programming I' },
    { subject_code: 'COMP 2103', subject_name: 'Information Technology Fundamentals' },
    { subject_code: 'COMP 1103', subject_name: 'Fundamentals of Computing' },
    { subject_code: 'COMP 2013', subject_name: 'Computer Programming I' },
    { subject_code: 'COMP 2103', subject_name: 'Information Technology Fundamentals' },
  ];

  @Input() totalItems: number = 500;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = Math.ceil(this.totalItems / this.itemsPerPage);

  get pages(): number[] {
    return Array(this.totalPages).fill(0).map((_, i) => i + 1);
  }

  getDisplayRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `${start}-${end}`;
  }

  get filteredSubjects(): Subject[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.subjects.slice(startIndex, endIndex);
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

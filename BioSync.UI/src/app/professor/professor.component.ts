import { Professor} from '../../model/professor-model';
import {Component, Input, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from '../../model/subject-model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddProfessorComponent } from '../add-professor/add-professor.component';
import { EditProfessorComponent } from '../edit-professor/edit-professor.component';

@Component({
  selector: 'app-professor',
  standalone: true,
  imports: [   MatToolbarModule,
    MatIconModule,
    CommonModule,
    FormsModule,
    MatIconModule,
    AddProfessorComponent,
    EditProfessorComponent],
  templateUrl: './professor.component.html',
  styleUrl: './professor.component.css'
})
export class ProfessorComponent {
  //Temporary Data
  professors: Professor[] = [
    { id: 1, faculty_code: "FA-00123-TG-2024", first_name: "John", last_name: 'Doe', middle_initial: "N/A", suffix: "N/A" },
    { id: 2, faculty_code: "FA-00546-TG-2024", first_name: "Oppen", last_name: 'Heimer', middle_initial: "R", suffix: "Jr." },
    { id: 3, faculty_code: "FA-00789-TG-2024", first_name: "Margarette", last_name: 'Dairy', middle_initial: "E", suffix: "N/A" }
  ]

  entries: string[] = [
    '10', '20', '30', '40', '50'
  ];

  sorting: string[] = [
    'Subject Code', 'Alphabetical', 'Date'
  ];

  @Input() totalItems: number = 500;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = Math.ceil(this.totalItems / this.itemsPerPage);
  isAddProfessor: boolean = false;
  isEditProfessor: boolean = false;

  get pages(): number[] {
    return Array(this.totalPages).fill(0).map((_, i) => i + 1);
  }

  getDisplayRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `${start}-${end}`;
  }

  get filteredProfessors(): Professor[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.professors.slice(startIndex, endIndex);
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

  toggleAddProfessor(): void {
    this.isAddProfessor = !this.isAddProfessor;
  }

  handleBackToProfessor(): void {
    this.isAddProfessor = false;
  }

  toggleEditProfessor(): void {
    this.isEditProfessor = !this.isEditProfessor;
  }

  handleBackToEditProfessor(): void {
    this.isEditProfessor = false;
  }
}

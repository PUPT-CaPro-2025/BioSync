import { Component, Input, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';

interface programs {
  program_name: string;
  program_abbreviation: string;
}

@Component({
  selector: 'app-program',
  standalone: true,
  imports: [MatToolbarModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule,
    CommonModule,],
  templateUrl: './program.component.html',
  styleUrl: './program.component.css'
})
export class ProgramComponent {
  entries: string[] = [
    '10', '20', '30', '40', '50'
  ];

  sorting: string[] = [
    'Alphabetical', 'Date'
  ];

  program: programs[] = [
    { program_name: "Bachelor of Science in Information Technology", program_abbreviation: "BSIT" },
    { program_name: "Diploma in Information Technology", program_abbreviation: "DIT" },
    { program_name: "Bachelor of Science in Electronics Engineering", program_abbreviation: "BSECE" },
  ];

  get filteredPrograms(): programs[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.program.slice(startIndex, endIndex);
  }

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

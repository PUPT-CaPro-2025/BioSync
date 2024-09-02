import { Component, Input, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { Section } from '../../model/section.model';
import { Semester } from '../../model/semester.model'; 
import { SectionService } from '../../services/section.service';
import { AddSectionComponent } from '../add-section/add-section.component';
import { EditSectionComponent } from '../edit-section/edit-section.component';
import { ViewSectionComponent } from '../view-section/view-section.component';

interface sections {
  program: string;
  year: string;
  section: string;
}

@Component({
  selector: 'app-section',
  standalone: true,
  imports: [MatToolbarModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule,
    CommonModule,
    AddSectionComponent,
    EditSectionComponent,
    ViewSectionComponent
  ],
  providers: [SectionService],
  templateUrl: './section.component.html',
  styleUrl: './section.component.css'
})
export class SectionComponent {
  entries: string[] = [
    '10', '20', '30', '40', '50'
  ];

  sorting: string[] = [
    'Alphabetical', 'Date'
  ];

  section: sections[] = [
    { program: "BSIT", year: "1", section: "1" },
    { program: "BSIT", year: "2", section: "1" },
    { program: "BSIT", year: "3", section: "1" },
    { program: "BSIT", year: "4", section: "1" },
    { program: "DIT", year: "1", section: "1" },
    { program: "DIT", year: "2", section: "1" },
    { program: "DIT", year: "3", section: "1" },
    { program: "DIT", year: "4", section: "1" },
  ];

  @Input() totalItems: number = 500;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = Math.ceil(this.totalItems / this.itemsPerPage);
  isAddSection: boolean = false;
  isEditSection: boolean = false;
  isViewSection: boolean = false;
  sectionToEdit!: Section;

  get filteredSections(): sections[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.section.slice(startIndex, endIndex);
  }

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

  toggleAddSection(): void {
    this.isAddSection = !this.isAddSection;
  }

  handleBackToSection(): void {
    this.isAddSection = false;
  }

  toggleEditSection(): void {
    this.isEditSection = !this.isEditSection;
  }

  handleBackToEditSection(): void {
    this.isEditSection = false;
  }

  toggleViewSection(): void {
    this.isViewSection = !this.isViewSection;
  }

  handleBackToViewSection(): void {
    this.isViewSection = false;
  }
}

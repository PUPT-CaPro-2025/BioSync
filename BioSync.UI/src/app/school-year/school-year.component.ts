import { Component, Input, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { SchoolYearService } from '../../services/school.year.service';
import { SchoolYear } from '../../model/school.year.model';
import { MatDialog } from '@angular/material/dialog';
import { EditSchoolYearComponent } from "../edit-school-year/edit-school-year.component";
import { AddSchoolYearComponent } from '../add-school-year/add-school-year.component';
import { ViewSchoolYearComponent } from '../view-school-year/view-school-year.component';

interface schoolYears {
  year_start: string;
  year_end: string;
  first_sem_start: string;
  first_sem_end: string;
  second_sem_start: string;
  second_sem_end: string;
  summer_start: string;
  summer_end: string;
}

@Component({
  selector: 'app-school-year',
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
    AddSchoolYearComponent, 
    EditSchoolYearComponent,
    ViewSchoolYearComponent
  ],
  providers: [SchoolYearService],
  templateUrl: './school-year.component.html',
  styleUrl: './school-year.component.css'
})
export class SchoolYearComponent {
      entries: string[] = [
        '10', '20', '30', '40', '50'
      ];
    
      sorting: string[] = [
        'Alphabetical', 'Date'
      ];

      schoolYear: schoolYears[] = [
        { year_start: "2024", 
          year_end: "2025", 
          first_sem_start: "October 22, 2024",
          first_sem_end: "February 23, 2025",
          second_sem_start: "March 15, 2025",
          second_sem_end: "July 13, 2025",
          summer_start: "July 22, 2025",
          summer_end: "September 25, 2025",
        },
      ];

      @Input() totalItems: number = 500;
      itemsPerPage: number = 10;
      currentPage: number = 1;
      totalPages: number = Math.ceil(this.totalItems / this.itemsPerPage);
      isAddSchoolYear: boolean = false;
      isEditSchoolYear: boolean = false;
      isViewSchoolYear: boolean = false;
      schoolYearToEdit!: SchoolYear;

      constructor(
        private schoolYearService: SchoolYearService, 
        private dialog: MatDialog) {}

      get filteredSchoolYears(): schoolYears[] {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.schoolYear.slice(startIndex, endIndex);
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

      toggleAddSchoolYear(): void {
        this.isAddSchoolYear = !this.isAddSchoolYear;
      }
    
      handleBackToSchoolYear(): void {
        this.isAddSchoolYear = false;
      }
    
      toggleEditSchoolYear(): void {
        this.isEditSchoolYear = !this.isEditSchoolYear;
      }
    
      handleBackToEditSchoolYear(): void {
        this.isEditSchoolYear = false;
      }

      toggleViewSchoolYear(): void {
        this.isViewSchoolYear = !this.isViewSchoolYear;
      }
    
      handleBackToViewSchoolYear(): void {
        this.isViewSchoolYear = false;
      }
}
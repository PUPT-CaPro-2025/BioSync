import { Component, Input, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { SchoolYearService } from '../../services/school.year.service';
import { SchoolYear } from '../../model/school.year.model';
import { MatDialog } from '@angular/material/dialog';
import { EditSchoolYearComponent } from "../edit-school-year/edit-school-year.component";
import { AddSchoolYearComponent } from '../add-school-year/add-school-year.component';
import { ViewSchoolYearComponent } from '../view-school-year/view-school-year.component';


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
export class SchoolYearComponent implements OnInit{
      entries: string[] = [
        '10', '20', '30', '40', '50'
      ];

      sorting: string[] = [
        'Alphabetical', 'Date'
      ];

      schoolYear: SchoolYear[] = [];

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

    ngOnInit() {
          this.getSchoolYears();
    }

     getSchoolYears(): void {
          this.schoolYearService.getSchoolYears().subscribe({
              next: (schoolYears: SchoolYear[]) => {
                  this.schoolYear = schoolYears;
              }
          })
     }

    dateToReadable(isoDate: Date): string {
        const date = new Date(isoDate);

        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        return date.toLocaleDateString('en-US', options);
    }

      get filteredSchoolYears(): SchoolYear[] {
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

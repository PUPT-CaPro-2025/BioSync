import { Component, Input, OnInit, HostListener } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { SchoolYearService } from '../../services/school.year.service';
import { SchoolYear } from '../../model/school.year.model';
import { MatDialog } from '@angular/material/dialog';
import { EditSchoolYearComponent } from './edit-school-year/edit-school-year.component';
import { AddSchoolYearComponent } from './add-school-year/add-school-year.component';
import { ViewSchoolYearComponent } from './view-school-year/view-school-year.component';
import {PromptConfirmComponent} from "../prompt/prompt-confirm/prompt-confirm.component";
import jsPDF from "jspdf";

@Component({
  selector: 'app-school-year',
  standalone: true,
  imports: [
    MatToolbarModule,
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
    ViewSchoolYearComponent,
  ],
  providers: [SchoolYearService],
  templateUrl: './school-year.component.html',
  styleUrl: './school-year.component.css',
})
export class SchoolYearComponent implements OnInit {
  entries: string[] = ['10', '20', '30', '40', '50'];

  sorting: string[] = ['Alphabetical', 'Date'];

  schoolYear: SchoolYear[] = [];

  totalItems!: number;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalPages!: number;
  isAddSchoolYear: boolean = false;
  isEditSchoolYear: boolean = false;
  isViewSchoolYear: boolean = false;
  schoolYearToEdit!: SchoolYear;
  headerImage!: string;
  activeDropdownId: number | null = null;

  constructor(
    private schoolYearService: SchoolYearService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.getSchoolYears();

    this.loadImageToBase64('../../assets/header.png', (base64Image) => {
      this.headerImage = base64Image;
    });
  }

  getSchoolYears(): void {
    this.schoolYearService.getSchoolYears().subscribe({
      next: (schoolYears: SchoolYear[]) => {
        this.schoolYear = schoolYears;
        this.totalItems = this.schoolYear.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      },
    });
  }

  dateToReadable(isoDate: Date): string {
    const date = new Date(isoDate);

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    return date.toLocaleDateString('en-US', options);
  }

  openConfirmationDialog(schoolYear: SchoolYear): void {
    this. activeDropdownId = null;
    const ref = this.dialog.open(PromptConfirmComponent, {
      width: '400px',
      data: {
        title: 'Delete School Year',
        message: 'Are you sure you want to delete this school year?',
      }
    })

    ref.afterClosed().subscribe({
      next: () => {
        this.deleteSchoolYear(schoolYear);
      }
    })
  }

  onSchoolYearCreate(schoolYear: SchoolYear): void {
    this.schoolYear.push(schoolYear);
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalItems = this.schoolYear.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  onSchoolYearEdit(schoolYear: SchoolYear): void {
    const index = this.schoolYear.findIndex((sy: SchoolYear) => sy.id === schoolYear.id);

    this.schoolYear[index] = schoolYear;
  }

  deleteSchoolYear(schoolYear: SchoolYear): void {
    this.schoolYearService.deleteSchoolYear(schoolYear).subscribe({
      next: () => {
        this.schoolYear = this.schoolYear.filter(
          v => v.id !== schoolYear.id);
        this.updatePagination();
      }
    })
  }

  get filteredSchoolYears(): SchoolYear[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.schoolYear.slice(startIndex, endIndex);
  }

  get pages(): number[] {
    return Array(this.totalPages)
      .fill(0)
      .map((_, i) => i + 1);
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

  toggleDropdownAction(schoolYearId: number): void {
    this.activeDropdownId = this.activeDropdownId === schoolYearId ? null : schoolYearId;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    const isDropdownClicked = target.closest('.action-container') !== null;
    const isToggleButtonClicked = target.closest('.dropdown-toggle') !== null;

    if (!isDropdownClicked && !isToggleButtonClicked) {
      this.activeDropdownId = null;
    }
  }

  toggleAddSchoolYear(): void {
    this.isAddSchoolYear = !this.isAddSchoolYear;
  }

  handleBackToSchoolYear(): void {
    this.isAddSchoolYear = false;
  }

  toggleEditSchoolYear(schoolYear: SchoolYear): void {
    this.activeDropdownId = null;
    this.isEditSchoolYear = !this.isEditSchoolYear;
    this.schoolYearToEdit = schoolYear;

  }

  handleBackToEditSchoolYear(): void {
    this.isEditSchoolYear = false;
  }

  toggleViewSchoolYear(): void {
    this. activeDropdownId = null;
    this.isViewSchoolYear = !this.isViewSchoolYear;
  }

  handleBackToViewSchoolYear(): void {
    this.isViewSchoolYear = false;
  }


  generatePdf() {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const imgWidth = 115;
    const imgHeight = 15;
    const xOffset = (pageWidth - imgWidth) / 2;
    doc.addImage(this.headerImage, 'PNG', xOffset, 5, imgWidth, imgHeight);

    const title = 'ACADEMIC YEAR LIST';
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, 30, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Date/Time Printed:', pageWidth / 2.1, 35, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleString();
    doc.text(currentDate, pageWidth / 2, 35);

    const columns = ['Academic Year', 'First Semester', 'Second Semester', 'Summer Semester'];
    const rows = this.schoolYear.map(sy =>
      [
        `${sy.startYear} - ${sy.endYear}`,
        `${this.dateToReadable(sy.firstSemester.startDate)} - ${this.dateToReadable(sy.firstSemester.endDate)}`,
        `${this.dateToReadable(sy.secondSemester.startDate)} - ${this.dateToReadable(sy.secondSemester.endDate)}`,
        `${this.dateToReadable(sy.summerSemester.startDate)} - ${this.dateToReadable(sy.summerSemester.endDate)}`,
      ]);

    doc.autoTable({
      head: [columns],
      body: rows,
      startY: 40,
      theme: 'grid',
      styles: {
        fontSize: 10,
        halign: 'center',
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        lineWidth: 0.4,
        lineColor: [0, 0, 0],
      },
      bodyStyles: {
        lineColor: [0, 0, 0],
        textColor: [0, 0, 0],
      }
    });

    doc.save('academic-year-list.pdf');
  }

  loadImageToBase64(url: string, callback: (base64Image: string) => void): void {
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // To prevent CORS issues
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      const base64Image = canvas.toDataURL('image/png');
      callback(base64Image);
    };
  }

}

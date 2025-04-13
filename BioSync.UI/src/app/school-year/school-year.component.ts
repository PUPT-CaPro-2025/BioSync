import { Component, OnInit, HostListener } from '@angular/core';
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
  styleUrls: ['./school-year.component.css', '../schedule/schedule.component.css']
})
export class SchoolYearComponent implements OnInit {
  entries: string[] = ['10', '20', '30', '40', '50'];

  schoolYear: SchoolYear[] = [];

  totalItems!: number;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalPages!: number;
  isAddSchoolYear: boolean = false;
  isEditSchoolYear: boolean = false;
  isViewSchoolYear: boolean = false;
  schoolYearToEdit!: SchoolYear;
  bagongPilipinas!: string; 
  stamp!: string;
  schoolLogo!: string;
  activeDropdownId: number | null = null;
  reportDropdown = false;

  constructor(
    private schoolYearService: SchoolYearService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.getSchoolYears();

    this.loadImageToBase64('../../assets/BagongPilipinas.png', (base64Image) => {
      this.bagongPilipinas = base64Image;
    });

    this.loadImageToBase64('../../assets/stamp.jpg', (base64Image) => {
      this.stamp = base64Image;
    });

    this.loadImageToBase64('../../assets/PUPLogo.png', (base64Image) => {
      this.schoolLogo = base64Image;
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

  dateToReadable(isoDate: Date, csv=false): string {
    const date = new Date(isoDate);

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    if(csv){
      return date.toLocaleDateString('en-GB', options)
          .replace(/\s/g, '-');
    } else {
      return date.toLocaleDateString('en-US', options);
    }

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

  toggleDropdown(){
    this.reportDropdown = !this.reportDropdown;
  }

  generatePdf() {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const leftX = 10;
    const rightX = pageWidth - 10;
    const lineHeight = 7;
    let currentY = 60; // Start position for content

    const columns = ['Academic Year', 'First Semester', 'Second Semester', 'Summer Semester'];
    const rows = this.schoolYear.map(sy =>
      [
        `${sy.startYear} - ${sy.endYear}`,
        `${this.dateToReadable(sy.firstSemester.startDate)} - ${this.dateToReadable(sy.firstSemester.endDate)}`,
        `${this.dateToReadable(sy.secondSemester.startDate)} - ${this.dateToReadable(sy.secondSemester.endDate)}`,
        `${this.dateToReadable(sy.summerSemester.startDate)} - ${this.dateToReadable(sy.summerSemester.endDate)}`,
      ]);

    const renderHeader = (currentPage: number, pageCount: number) => {
      //Add header image
     const margin = 10;
     const imgWidth = 20; 
     const imgHeight = 20;

     doc.addImage(this.schoolLogo, 'PNG', margin, 10, imgWidth, imgHeight);

     const textStartX = margin + imgWidth + 5;
     const textStartY = 15;
     doc.setFontSize(10);
     doc.text('Republic of the Philippines', textStartX, textStartY);

     doc.setFontSize(12);
     doc.setFont('times', 'bold');
     doc.text('POLYTECHNIC UNIVERSITY OF THE PHILIPPINES', textStartX, textStartY + 5);

     doc.setFontSize(10);
     doc.setFont('times', 'normal');
     doc.text('Office of the Vice President for Branches and Campuses', textStartX, textStartY + 10);

     doc.setFontSize(11);
     doc.setFont('times', 'bold');
     doc.text('TAGUIG CAMPUS', textStartX, textStartY + 15);

     doc.addImage(this.bagongPilipinas, 'PNG', pageWidth - margin - imgWidth, 10, imgWidth, imgHeight);

     const title = 'ACADEMIC YEAR LIST';
     doc.setFontSize(20);
     doc.setFont('helvetica', 'bold');
     doc.text(title, pageWidth / 2, 45, { align: 'center' });
 
     doc.setFontSize(10);
     doc.setFont('helvetica', 'bold');
     doc.text('Date/Time Printed:', pageWidth / 2 - 20, 50, { align: 'center' });
     doc.setFont('helvetica', 'normal');
     const currentDate = new Date().toLocaleString();
     doc.text(currentDate, pageWidth / 2 + 20, 50, { align: 'center' });

      // Add footer
     const footerY = doc.internal.pageSize.height - 15;
     const textLeftX = 10;  

     doc.setFont('helvetica', 'normal');
     doc.setFontSize(8);
     doc.text('General Santos Ave., Lower Bicutan, Taguig City, Philippines 1632', textLeftX, footerY - 10);
     doc.text('Direct Line: (02) 8837 5858 to 60', textLeftX, footerY - 5);

     doc.setTextColor(0, 0, 0); 
     doc.text('Website: ', textLeftX, footerY + 0.5);
     doc.setTextColor(0, 0, 255); 
     doc.textWithLink('www.pup.edu.ph', textLeftX + 12, footerY + 0.5, { url: 'http://www.pup.edu.ph' });
     doc.setTextColor(0, 0, 0);
     doc.text(' | Email: ', textLeftX + 33, footerY + 0.5);
     doc.text('taguig@pup.edu.ph', textLeftX + 44, footerY + 0.5);
     doc.setTextColor(0);

     doc.setFont('times', 'normal');
     doc.setFontSize(15);
     doc.text('THE COUNTRY\'S 1st POLYTECHNICU', textLeftX, footerY + 8);

     const stampRightX = doc.internal.pageSize.width - 80;
     const stampWidth = 65;
     const stampHeight = 30; 
     doc.addImage(this.stamp, 'JPEG', stampRightX, footerY - 15, stampWidth, stampHeight);
    }

    doc.autoTable({
      head: [columns],
      body: rows,
      startY: 55,
      theme: 'grid',
      margin: { top: 55, bottom: 40 },
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
      },
      didDrawPage: (data: { pageNumber: number; pageCount: number }) => {
        renderHeader(data.pageNumber, data.pageCount);
      },
    });

    doc.save('academic-year-list.pdf');
  }

  generateCSV() {
    const columns = [
      'Academic Year',
      'First Semester Start',
      'First Semester End',
      'Second Semester Start',
      'Second Semester End',
      'Summer Semester Start',
      'Summer Semester End'
    ];

    let csvContent = columns.join(',') + '\n'; // Add CSV header

    const rows = this.schoolYear.map(sy => [
      `${sy.startYear} - ${sy.endYear}`,
       this.dateToReadable(sy.firstSemester.startDate, true),
       this.dateToReadable(sy.firstSemester.endDate, true),
       this.dateToReadable(sy.secondSemester.startDate, true),
       this.dateToReadable(sy.secondSemester.endDate, true),
       this.dateToReadable(sy.summerSemester.startDate, true),
       this.dateToReadable(sy.summerSemester.endDate, true),
    ]);

    rows.forEach(row => {
      csvContent += row.join(',') + '\n'; // Add rows to CSV
    });

    const blob = new Blob([csvContent], { type: 'text/csv' }); // Create a blob for CSV
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = 'academic-year-list.csv';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
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

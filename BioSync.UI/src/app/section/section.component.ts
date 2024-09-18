import { Component, Input, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { Section } from '../../model/section.model';
import { SectionService } from '../../services/section.service';
import { AddSectionComponent } from '../add-section/add-section.component';
import {MatDialog} from "@angular/material/dialog";
import {PromptConfirmComponent} from "../prompt-confirm/prompt-confirm.component";
import jsPDF from "jspdf";


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
  ],
  providers: [SectionService],
  templateUrl: './section.component.html',
  styleUrl: './section.component.css'
})
export class SectionComponent implements OnInit{
  entries: string[] = [
    '10', '20', '30', '40', '50'
  ];

  sorting: string[] = [
    'Alphabetical', 'Date'
  ];

  section: Section[] = [];

  @Input() totalItems: number = 500;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = Math.ceil(this.totalItems / this.itemsPerPage);
  isAddSection: boolean = false;
  headerImage!: string;

  constructor(
    private dialog: MatDialog,
    private sectionService: SectionService,
  ) {}

  ngOnInit() {
    this.getSections();

    this.loadImageToBase64('../../assets/header.png', (base64Image) => {
      this.headerImage = base64Image;
    });
  }

  getSections(){
    this.sectionService.getSections().subscribe({
      next: (sections: Section[]) => {
        this.section = sections;
        this.sortSections();
      }
    })
  }

  sortSections() {
    this.section.sort((a: Section, b: Section) => b.id - a.id);
  }

  onSectionCreation(section: Section){
    this.section.push(section);
    this.sortSections();
  }

  openConfirmationDialog(section: Section){
    const ref = this.dialog.open(PromptConfirmComponent, {
      width: '400px',
      data: {
        title: 'Delete Section',
        message: `Are you sure you want to delete this section?`
      }
    })

    ref.afterClosed().subscribe(result => {
      if (result) {
        this.deleteSection(section);
      }
    })
  }

  deleteSection(section: Section){
    this.sectionService.deleteSection(section).subscribe({
      next: () => {
        this.section = this.section.filter(v => v.id !== section.id);
      }
    })
  }

  get filteredSections(): Section[] {
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

  generatePdf() {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const imgWidth = 115; // Width of the image in mm
    const imgHeight = 15; // Adjust the height accordingly
    const xOffset = (pageWidth - imgWidth) / 2; // Calculate the xOffset to center the image
    doc.addImage(this.headerImage, 'PNG', xOffset, 5, imgWidth, imgHeight);

    // Add Title and Date/Time only on the first page
    const title = 'SECTION LIST';
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, 30, { align: 'center' }); // Center aligned header

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Date/Time Printed:', pageWidth / 2.1, 35, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleString();
    doc.text(currentDate, pageWidth / 2, 35);

    const columns = ['Program', 'Year', 'Section'];
    const rows = this.section.map(sec =>
      [
        sec.program.programName,
        sec.year,
        sec.section
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

    doc.save('section-list.pdf');
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

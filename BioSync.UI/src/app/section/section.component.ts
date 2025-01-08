import { Component, OnInit, HostListener} from '@angular/core';
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
import { AddSectionComponent } from './add-section/add-section.component';
import {MatDialog} from "@angular/material/dialog";
import {PromptConfirmComponent} from "../prompt/prompt-confirm/prompt-confirm.component";
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
  styleUrls: ['./section.component.css', '../schedule/schedule.component.css']
})
export class SectionComponent implements OnInit{
  entries: string[] = [
    '10', '20', '30', '40', '50'
  ];

  section: Section[] = [];

  totalItems!: number;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalPages!: number;
  isAddSection: boolean = false;
  headerImage!: string;
  activeDropdownId: number | null = null;

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
        this.totalItems = this.section.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      }
    })
  }

  sortSections() {
    this.section.sort((a: Section, b: Section) => b.id - a.id);
  }

  onSectionCreation(section: Section){
    this.section.push(section);
    this.sortSections();
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalItems = this.section.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  openConfirmationDialog(section: Section){
    this.activeDropdownId = null;
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
        this.updatePagination();
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

  toggleDropdownAction(sectionId: number): void {
    this.activeDropdownId = this.activeDropdownId === sectionId ? null : sectionId;
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

  toggleAddSection(): void {
    this.isAddSection = !this.isAddSection;
  }

  handleBackToSection(): void {
    this.isAddSection = false;
  }

  generatePdf() {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    const imgWidth = 115;
    const imgHeight = 15;
    const xOffset = (pageWidth - imgWidth) / 2;
    doc.addImage(this.headerImage, 'PNG', xOffset, 5, imgWidth, imgHeight);

    const title = 'SECTION LIST';
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, 30, { align: 'center' });

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

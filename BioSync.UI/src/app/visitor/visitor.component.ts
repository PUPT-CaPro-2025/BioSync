import { Visitor } from '../../model/visitor.model';
import {Component, Input, OnInit, HostListener} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditVisitorComponent } from './edit-visitor/edit-visitor.component';
import {VisitorService} from "../../services/visitor.service";
import {MatDialog} from "@angular/material/dialog";
import {PromptConfirmComponent} from "../prompt/prompt-confirm/prompt-confirm.component";
import jsPDF from "jspdf";

@Component({
  selector: 'app-visitor',
  standalone: true,
  imports: [MatToolbarModule,
    MatIconModule,
    CommonModule,
    FormsModule,
    MatIconModule,
    EditVisitorComponent],
  providers: [VisitorService],
  templateUrl: './visitor.component.html',
  styleUrl: './visitor.component.css'
})
export class VisitorComponent implements OnInit{
  //Temporary Data
  visitors: Visitor[] = [];

  entries: string[] = [
    '10', '20', '30', '40', '50'
  ];

  sorting: string[] = [
    'Subject Code', 'Alphabetical', 'Date'
  ];

  totalItems!: number;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalPages!: number;
  isEditVisitor: boolean = false;
  visitorToEdit!: Visitor;
  headerImage!: string;
  activeDropdownId: number | null = null;

  constructor(
    private visitorService: VisitorService,
    private dialog: MatDialog
  ){}

  ngOnInit() {
    this.initializeVisitors();

    this.loadImageToBase64('../../assets/header.png', (base64Image) => {
      this.headerImage = base64Image;
    });
  }

  initializeVisitors(){
    this.visitorService.getVisitors().subscribe({
      next: (visitors: Visitor[]) => {
        this.visitors = visitors;
        this.totalItems = visitors.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      }
    })
  }

  getDate(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getTime(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12;

    return `${hours}:${minutes}:${seconds} ${ampm}`;
  }

  onVisitorUpdate(updatedVisitor: Visitor){
    const index = this.visitors.findIndex(
      visitor => visitor.id === updatedVisitor.id
    );

    if(index === -1) return;

    this.visitors[index] = updatedVisitor;
  }

  openDeleteDialog(visitor: Visitor): void {
    this.activeDropdownId = null;
    const dialogRef = this.dialog.open(PromptConfirmComponent, {
      width: '400px',
      data: {
        title: 'Delete Visitor',
        message: 'Are you sure you want to delete this visitor?',
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(!result) return;

      this.deleteVisitorLog(visitor);
    })
  }

  deleteVisitorLog(visitor: Visitor): void {
    this.visitorService.deleteVisitor(visitor).subscribe({
      next: () => {
        this.visitors = this.visitors.filter(v => v.id !== visitor.id);
      },
      error: err => console.error(err)
    })
  }

  get pages(): number[] {
    return Array(this.totalPages).fill(0).map((_, i) => i + 1);
  }

  getDisplayRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `${start}-${end}`;
  }

  get filteredVisitors(): Visitor[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.visitors.slice(startIndex, endIndex);
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

  toggleDropdownAction(visitorId: number): void {
    this.activeDropdownId = this.activeDropdownId === visitorId ? null : visitorId;
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

  toggleEditVisitor(visitor: Visitor) {
    this.isEditVisitor = !this.isEditVisitor;
    this.visitorToEdit = visitor;
    this.activeDropdownId = null;
  }

  handleBackToEditVisitor(): void {
    this.isEditVisitor = false;
  }

  generatePdf() {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const imgWidth = 115;
    const imgHeight = 15;
    const xOffset = (pageWidth - imgWidth) / 2;
    doc.addImage(this.headerImage, 'PNG', xOffset, 5, imgWidth, imgHeight);

    const title = 'VISITOR LIST';
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, 30, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Date/Time Printed:', pageWidth / 2.1, 35, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleString();
    doc.text(currentDate, pageWidth / 2, 35);

    const columns = ['Visitor Name', 'Purpose of Visit', 'Date', 'Time', 'Destination'];
    const rows = this.visitors.map(visitor =>
      [
        visitor.name,
        visitor.purposeOfVisit,
        `${this.getDate(visitor.visitDate)}`,
        `${this.getTime(visitor.visitDate)}`,
        visitor.destination
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

    doc.save('visitor-list.pdf');
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

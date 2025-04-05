import { Visitor } from '../../model/visitor.model';
import {Component, OnInit, HostListener} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditVisitorComponent } from './edit-visitor/edit-visitor.component';
import {VisitorService} from "../../services/visitor.service";
import {MatDialog} from "@angular/material/dialog";
import {PromptConfirmComponent} from "../prompt/prompt-confirm/prompt-confirm.component";
import jsPDF from "jspdf";
import {MatButton} from "@angular/material/button";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import { AddVisitorComponent } from './add-visitor/add-visitor.component';
import { PromptCsvComponent } from '../prompt/prompt-csv/prompt-csv.component';

@Component({
  selector: 'app-visitor',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatIconModule,
    CommonModule,
    FormsModule,
    MatIconModule,
    EditVisitorComponent, 
    AddVisitorComponent,
    MatButton, 
    MatMenu, 
    MatMenuItem, 
    MatMenuTrigger],
  providers: [VisitorService],
  templateUrl: './visitor.component.html',
  styleUrls: ['./visitor.component.css', '../schedule/schedule.component.css',
    '../subject/subject.component.css', '../student/student.component.css']
})
export class VisitorComponent implements OnInit{
  visitors: Visitor[] = [];

  entries: string[] = [
    '10', '20', '30', '40', '50'
  ];

  sorting: string[] = [
    'Alphabetical', 'Date', 'Purpose of Visit'
  ];

  totalItems!: number;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalPages!: number;
  isAddVisitor: boolean = false;
  isEditVisitor: boolean = false;
  visitorToEdit!: Visitor;
  bagongPilipinas!: string;
  stamp!: string;
  schoolLogo!: string;
  activeDropdownId: number | null = null;
  reportDropdown = false;

  constructor(
    private visitorService: VisitorService,
    private dialog: MatDialog
  ){}

  ngOnInit() {
    this.initializeVisitors();

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

  updatePagination(): void {
    this.totalItems = this.visitors.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  deleteVisitorLog(visitor: Visitor): void {
    this.visitorService.deleteVisitor(visitor).subscribe({
      next: () => {
        this.visitors = this.visitors.filter(v => v.id !== visitor.id);
        this.updatePagination();
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

  toggleSingleLogVisitor(){
    this.isAddVisitor = !this.isAddVisitor;
  }

  handleBackToVisitor(): void {
    this.isAddVisitor = false;
  }

  toggleMultipleVisitors() {
    const ref = this.dialog.open(PromptCsvComponent, {
      width: '450px',
      height: '210px',
      data: {
        scheduleId: null,
      }
    })

    ref.afterClosed().subscribe({
      next: () => {
        
      }
    })
  }

  handleBackToEditVisitor(): void {
    this.isEditVisitor = false;
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

    //Table Headers and Rows
    const columns = ['Visitor Name', 'Purpose of Visit', 'Date', 'Time', 'Destination'];
    const rows = this.visitors.map(visitor =>
      [
        visitor.name,
        visitor.purposeOfVisit,
        `${this.getDate(visitor.visitDate)}`,
        `${this.getTime(visitor.visitDate)}`,
        visitor.destination
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
 
      const title = 'VISITOR LIST';
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

    //Table 
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

    doc.save('visitor-list.pdf');
  }

  generateCSV() {
    const columns = ['Visitor Name', 'Purpose of Visit', 'Date', 'Time', 'Destination'];

    let csvContent = columns.join(',') + '\n';

    const rows = this.visitors.map(visitor =>
        [
          visitor.name,
          visitor.purposeOfVisit,
          this.getDate(visitor.visitDate),
          this.getTime(visitor.visitDate),
          visitor.destination
        ]
    );

    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = 'visitor-list.csv';

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

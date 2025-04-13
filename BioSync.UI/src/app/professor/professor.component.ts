import {Component, OnInit, HostListener} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddProfessorComponent } from './add-professor/add-professor.component';
import { EditProfessorComponent } from './edit-professor/edit-professor.component';
import {UserService} from "../../services/user.service";
import {User} from "../../model/user.model";
import {MatDialog} from "@angular/material/dialog";
import {PromptConfirmComponent} from "../prompt/prompt-confirm/prompt-confirm.component";
import {PromptOkayComponent} from "../prompt/prompt-okay/prompt-okay.component";
import jsPDF from "jspdf";

@Component({
  selector: 'app-professor',
  standalone: true,
  imports: [   MatToolbarModule,
    MatIconModule,
    CommonModule,
    FormsModule,
    MatIconModule,
    AddProfessorComponent,
    EditProfessorComponent],
  providers: [UserService],
  templateUrl: './professor.component.html',
  styleUrls: ['./professor.component.css',
    '../schedule/schedule.component.css', '../subject/subject.component.css']
})
export class ProfessorComponent implements OnInit{
  professors: User[] = [];

  entries: string[] = [
    '10', '20', '30', '40', '50'
  ];
  totalItems!: number;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalPages!: number;
  isAddProfessor: boolean = false;
  isEditProfessor: boolean = false;
  professorToUpdate!: User
  bagongPilipinas!: string;
  stamp!: string;
  schoolLogo!: string;  
  activeDropdownId: number | null = null;
  reportDropdown = false;

  constructor(
    private userService: UserService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.getProfessors()

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

  getProfessors(): void {
    this.userService.getUsersByRole("FACULTY").subscribe({
      next: (professors: User[]) => {
        this.professors = professors;
        this.totalItems = this.professors.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      }
    })
  }

  onProfessorAdded(newProfessor: User){
    this.professors.push(newProfessor);
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalItems = this.professors.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  onProfessorUpdate(updatedProfessor: User){
    const index = this.professors.findIndex(
      professor => professor.id === updatedProfessor.id);

    if(index === -1) return;

    this.professors[index] = updatedProfessor;
  }

  get pages(): number[] {
    return Array(this.totalPages).fill(0).map((_, i) => i + 1);
  }

  getDisplayRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `${start}-${end}`;
  }

  get filteredProfessors(): User[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.professors.slice(startIndex, endIndex);
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

  toggleDropdownAction(professorId: number): void {
    this.activeDropdownId = this.activeDropdownId === professorId ? null : professorId;
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

  toggleAddProfessor(): void {
    this.isAddProfessor = !this.isAddProfessor;
  }

  handleBackToProfessor(): void {
    this.isAddProfessor = false;
  }

  toggleEditProfessor(professor: User): void {
    this.activeDropdownId = null;
    this.isEditProfessor = !this.isEditProfessor;
    this.professorToUpdate = professor;
  }

  handleBackToEditProfessor(): void {
    this.isEditProfessor = false;
  }

  openDeleteConfirmation(professor: User){
    this.activeDropdownId = null;
    const ref = this.dialog.open(PromptConfirmComponent, {
      width: '400px',
      data: {
        title: 'Delete Professor',
        message: 'Are you sure you want to delete?',
      }
    });

    ref.afterClosed().subscribe({
      next: (result) => {
        if(!result) return;
        this.deleteProfessor(professor);
      }
    })
  }

  openSomethingWentWrong(){
    this.dialog.open(PromptOkayComponent, {
      width: '400px',
      data: {
        title: 'Something Went Wrong!',
        message: 'Can\'t delete professor with existing schedule'
      }
    })

  }

  deleteProfessor(professor: User){
    this.userService.deleteUser(professor).subscribe({
      next: () => {
        this.professors = this.professors.filter(
          prof => prof.id !== professor.id
        );
        this.updatePagination();
      },
      error: () => this.openSomethingWentWrong()
    })
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

    const columns = ['Faculty Code', 'First Name', 'Middle Name', 'Last Name', 'Suffix'];
    const rows = this.professors.map(professor =>
      [
        professor.usercode,
        professor.firstName,
        professor.middleName,
        professor.lastName,
        professor.suffix
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

     const title = 'PROFESSOR LIST';
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

    doc.save('professor-list.pdf');
  }

  generateCSV() {
    const columns = ['Faculty Code', 'First Name', 'Middle Name', 'Last Name', 'Suffix'];

    let csvContent = columns.join(',') + '\n';

    this.professors.forEach(professor => {
      const row = [
        professor.usercode,
        professor.firstName,
        professor.middleName,
        professor.lastName,
        professor.suffix
      ];
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = 'professor-list.csv';

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

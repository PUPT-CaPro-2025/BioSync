import {Component, Input, OnInit, HostListener} from '@angular/core';
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
  styleUrls: ['./professor.component.css', '../schedule/schedule.component.css']
})
export class ProfessorComponent implements OnInit{
  professors: User[] = [];

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
  isAddProfessor: boolean = false;
  isEditProfessor: boolean = false;
  professorToUpdate!: User
  headerImage!: string;
  activeDropdownId: number | null = null;

  constructor(
    private userService: UserService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.getProfessors()

    this.loadImageToBase64('../../assets/header.png', (base64Image) => {
      this.headerImage = base64Image;
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

  generatePdf() {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const imgWidth = 115;
    const imgHeight = 15;
    const xOffset = (pageWidth - imgWidth) / 2;
    doc.addImage(this.headerImage, 'PNG', xOffset, 5, imgWidth, imgHeight);

    const title = 'PROFESSOR LIST';
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, 30, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Date/Time Printed:', pageWidth / 2.1, 35, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleString();
    doc.text(currentDate, pageWidth / 2, 35);


    const columns = ['Faculty Code', 'First Name', 'Middle Name', 'Last Name', 'Suffix'];
    const rows = this.professors.map(professor =>
      [
        professor.usercode,
        professor.firstName,
        professor.middleName,
        professor.lastName,
        professor.suffix
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

    doc.save('professor-list.pdf');
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

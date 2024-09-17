import {Component, Input, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddProfessorComponent } from '../add-professor/add-professor.component';
import { EditProfessorComponent } from '../edit-professor/edit-professor.component';
import {UserService} from "../../services/user.service";
import {User} from "../../model/user.model";
import {MatDialog} from "@angular/material/dialog";
import {PromptConfirmComponent} from "../prompt-confirm/prompt-confirm.component";
import {PromptOkayComponent} from "../prompt-okay/prompt-okay.component";
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
  styleUrl: './professor.component.css'
})
export class ProfessorComponent implements OnInit{
  professors: User[] = [];

  entries: string[] = [
    '10', '20', '30', '40', '50'
  ];

  sorting: string[] = [
    'Subject Code', 'Alphabetical', 'Date'
  ];

  @Input() totalItems: number = 500;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = Math.ceil(this.totalItems / this.itemsPerPage);
  isAddProfessor: boolean = false;
  isEditProfessor: boolean = false;
  professorToUpdate!: User


  constructor(
    private userService: UserService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.getProfessors()
  }

  getProfessors(): void {
    this.userService.getUsersByRole("FACULTY").subscribe({
      next: (professors: User[]) => {
        this.professors = professors;
      }
    })
  }

  onProfessorAdded(newProfessor: User){
    this.professors.push(newProfessor);
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

  toggleAddProfessor(): void {
    this.isAddProfessor = !this.isAddProfessor;
  }

  handleBackToProfessor(): void {
    this.isAddProfessor = false;
  }

  toggleEditProfessor(professor: User): void {
    this.isEditProfessor = !this.isEditProfessor;
    this.professorToUpdate = professor;
  }

  handleBackToEditProfessor(): void {
    this.isEditProfessor = false;
  }

  openDeleteConfirmation(professor: User){
    const ref = this.dialog.open(PromptConfirmComponent, {
      width: '400px',
      data: {
        title: 'Delete Professor',
        message: 'Are you sure you want to delete?',
      }
    });

    ref.afterClosed().subscribe({
      next: () => {
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
      },
      error: () => this.openSomethingWentWrong()
    })
  }

  generatePdf() {
    const doc = new jsPDF('landscape');

    // Add a custom header to the PDF
    doc.setFontSize(18);
    doc.text('List of Professors', 14, 20);

    doc.setFontSize(12);
    doc.text('Generated on: ' + new Date().toLocaleDateString(), 14, 30);

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
        fillColor: [248, 76, 66],
        textColor: 255,
        fontSize: 12
      },
      bodyStyles: {
        fontSize: 10
      }
    });

    // Save the generated PDF
    doc.save('professor-list.pdf');
  }
}

import { Component, Input, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { AddProgramComponent } from '../add-program/add-program.component';
import { EditProgramComponent } from '../edit-program/edit-program.component';
import { Program } from '../../model/program.model';
import { ProgramService } from '../../services/program.service';
import { MatDialog } from '@angular/material/dialog';
import {PromptConfirmComponent} from "../prompt-confirm/prompt-confirm.component";
import { ViewProgramComponent } from '../view-program/view-program.component';

@Component({
  selector: 'app-program',
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
    AddProgramComponent,
    EditProgramComponent,
    ViewProgramComponent
  ],
  providers: [ProgramService],
  templateUrl: './program.component.html',
  styleUrl: './program.component.css'
})
export class ProgramComponent implements OnInit{
  entries: string[] = [
    '10', '20', '30', '40', '50'
  ];

  sorting: string[] = [
    'Alphabetical', 'Date'
  ];

  programs: Program[] = [];

  @Input() totalItems: number = 500;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = Math.ceil(this.totalItems / this.itemsPerPage);
  isAddProgram: boolean = false;
  isEditProgram: boolean = false;
  isViewProgram: boolean = false;
  programToEdit!: Program;
  currentProgram: number | undefined;

  constructor(
    private programService: ProgramService, 
    private dialog: MatDialog) {}

  ngOnInit() {
    this.getAllPrograms()
  }

  getAllPrograms(){
    this.programService.getAllPrograms().subscribe({
      next: (programs: Program[]) => {
        programs.forEach((program) => {
          this.programs.push(program);
        })
      },
      error: (error) => { console.error(error) }
    }
    )
  }

  onProgramAdded(newProgram: Program){
    this.programs.push(newProgram);
  }

  onProgramUpdate(updatedProgram: Program) {
    const index = this.programs.findIndex(
      program => program.id === updatedProgram.id
    );

    if(index === -1) return;

    this.programs[index] = updatedProgram;
  }

  openDeleteDialog(program: Program): void {
    const dialogRef = this.dialog.open(PromptConfirmComponent, {
      width: '400px',
      data: {
        title: "Delete Program",
        message: "Are you sure you want to delete this program?"
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteProgram(program);
      }
    });
  }

  deleteProgram(programToDelete: Program) {
    this.programService.deleteProgram(programToDelete).subscribe({
      next: () => {
        this.programs = this.programs.filter(program => program.id !== programToDelete.id);
      },
      error: err => console.error(err)
    });
  }

  get filteredPrograms(): Program[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.programs.slice(startIndex, endIndex);
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

  toggleAddProgram(): void {
    this.isAddProgram = !this.isAddProgram;
  }

  handleBackToProgram(): void {
    this.isAddProgram = false;
  }

  toggleEditProgram(program: Program): void {
    this.isEditProgram = !this.isEditProgram;
    this.programToEdit = program;
  }

  handleBackToEditProgram(): void {
    this.isEditProgram = false;
  }

  toggleViewProgram(programId: number | undefined): void {
    this.isViewProgram = !this.isViewProgram;
    if(this.isViewProgram){
      this.currentProgram = programId;
    }
  }

  setViewId(){
    return this.currentProgram;
  }

  handleBackToViewProgram(): void {
    this.isViewProgram = false;
  }
}

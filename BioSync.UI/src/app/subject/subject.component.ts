import {Component, Input, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from '../../model/subject-model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddSubjectComponent } from '../add-subject/add-subject.component';
import {SubjectService} from "../../services/subject.service";
import {PromptConfirmComponent} from "../prompt-confirm/prompt-confirm.component";
import {MatDialog} from "@angular/material/dialog";
import { EditSubjectComponent } from '../edit-subject/edit-subject.component';

@Component({
  selector: 'app-subject',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatIconModule,
    CommonModule,
    FormsModule,
    MatIconModule,
    AddSubjectComponent,
    EditSubjectComponent,
  ],
  providers: [SubjectService],
  templateUrl: './subject.component.html',
  styleUrl: './subject.component.css'
})
export class SubjectComponent implements OnInit{
  entries: string[] = [
    '10', '20', '30', '40', '50'
  ];

  sorting: string[] = [
    'Subject Code', 'Alphabetical', 'Date'
  ];

  subjects: Subject[] = []

  @Input() totalItems: number = 500;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = Math.ceil(this.totalItems / this.itemsPerPage);
  isAddSubject: boolean = false;
  isEditSubject: boolean = false;
  subjectToEdit!: Subject;

  constructor(
    private subjectService: SubjectService,
    private dialog: MatDialog) {}

  ngOnInit() {
    this.getSubjects()
  }

  getSubjects(){
    this.subjectService.getSubjects().subscribe({
      next: (subjects: Subject[]) => {
        subjects.forEach((subject) => {
          this.subjects.push(subject);
        })
      },
      error: (error) => { console.error(error) }
    }
    )
  }

  onSubjectAdded(newSubject: Subject){
    this.subjects.push(newSubject);
  }

  onSubjectUpdate(updatedSubject: Subject) {
    const index = this.subjects.findIndex(
      subject => subject.id === updatedSubject.id
    );

    if(index === -1) return;

    this.subjects[index] = updatedSubject;
  }

  openDeleteDialog(subject: Subject): void {
    const dialogRef = this.dialog.open(PromptConfirmComponent, {
      width: '400px',
      data: {
        title: "Delete Subject",
        message: "Are you sure you want to delete this subject?"
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteSubject(subject);
      }
    });
  }

  deleteSubject(subject: Subject) {
    this.subjectService.deleteSubject(subject.id).subscribe({
      next: () => {
        this.subjects = this.subjects.filter(s => s.id !== subject.id);
      },
      error: err => console.error(err)
    });
  }

  get pages(): number[] {
    return Array(this.totalPages).fill(0).map((_, i) => i + 1);
  }

  getDisplayRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `${start}-${end}`;
  }

  get filteredSubjects(): Subject[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.subjects.slice(startIndex, endIndex);
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

  toggleAddSubject(): void {
    this.isAddSubject = !this.isAddSubject;
  }

  handleBackToSubject(): void {
    this.isAddSubject = false;
  }

  toggleEditSubject(subject: Subject): void {
    this.isEditSubject = !this.isEditSubject;
    this.subjectToEdit = subject;
  }

  handleBackToEditSubject(): void {
    this.isEditSubject = false;
  }
}

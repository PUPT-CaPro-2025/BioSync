import {Component, Input, OnInit, HostListener} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from '../../model/subject-model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddSubjectComponent } from './add-subject/add-subject.component';
import {SubjectService} from "../../services/subject.service";
import {PromptConfirmComponent} from "../prompt/prompt-confirm/prompt-confirm.component";
import {MatDialog} from "@angular/material/dialog";
import { EditSubjectComponent } from './edit-subject/edit-subject.component';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
  styleUrls: ['./subject.component.css', '../schedule/schedule.component.css']
})
export class SubjectComponent implements OnInit{
  entries: string[] = [
    '10', '20', '30', '40', '50'
  ];

  sorting: string[] = [
    'Subject Code', 'Alphabetical', 'Date'
  ];

  subjects: Subject[] = []

  totalItems!: number;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalPages!: number;
  isAddSubject: boolean = false;
  isEditSubject: boolean = false;
  subjectToEdit!: Subject;
  headerImage!: string;
  activeDropdownId: number | null = null;

  constructor(
    private subjectService: SubjectService,
    private dialog: MatDialog) {}

  ngOnInit() {
    this.getSubjects()

    this.loadImageToBase64('../../assets/header.png', (base64Image) => {
      this.headerImage = base64Image;
    });
  }

  getSubjects(){
    this.subjectService.getSubjects().subscribe({
      next: (subjects: Subject[]) => {
        subjects.forEach((subject) => {
          this.subjects.push(subject);
        })
        this.totalItems = this.subjects.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      },
      error: (error) => { console.error(error) }
    }
    )
  }

  onSubjectAdded(newSubject: Subject){
    this.subjects.push(newSubject);
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalItems = this.subjects.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  onSubjectUpdate(updatedSubject: Subject) {
    const index = this.subjects.findIndex(
      subject => subject.id === updatedSubject.id
    );

    if(index === -1) return;

    this.subjects[index] = updatedSubject;
  }

  openDeleteDialog(subject: Subject): void {
    this.activeDropdownId = null;
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
        this.updatePagination();
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

  toggleDropdownAction(SubjectId: number): void {
    this.activeDropdownId = this.activeDropdownId === SubjectId ? null : SubjectId;
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

  toggleAddSubject(): void {
    this.isAddSubject = !this.isAddSubject;
  }

  handleBackToSubject(): void {
    this.isAddSubject = false;
  }

  toggleEditSubject(subject: Subject): void {
    this.activeDropdownId = null;
    this.isEditSubject = !this.isEditSubject;
    this.subjectToEdit = subject;
  }

  handleBackToEditSubject(): void {
    this.isEditSubject = false;
  }

  generatePdf() {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    const imgWidth = 115;
    const imgHeight = 15;
    const xOffset = (pageWidth - imgWidth) / 2;
    doc.addImage(this.headerImage, 'PNG', xOffset, 5, imgWidth, imgHeight);

    const title = 'SUBJECT LIST';
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, 30, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Date/Time Printed:', pageWidth / 2.1, 35, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleString();
    doc.text(currentDate, pageWidth / 2, 35);

    const columns = ['Subject Code', 'Subject Name', 'Description'];
    const rows = this.subjects.map(subject => [subject.code, subject.name, subject.description]);

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

    doc.save('subjects-list.pdf');
  }

  loadImageToBase64(url: string, callback: (base64Image: string) => void): void {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
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

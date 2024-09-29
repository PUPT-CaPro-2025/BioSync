import {Component, Input, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { AddStudentComponent } from '../add-student/add-student.component';
import { EditStudentComponent } from '../edit-student/edit-student.component';
import {User} from "../../model/user.model";
import {UserService} from "../../services/user.service";
import {MatDialog} from "@angular/material/dialog";
import {PromptConfirmComponent} from "../prompt-confirm/prompt-confirm.component";
import jsPDF from "jspdf";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {MatButton} from "@angular/material/button";

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatIconModule,
    CommonModule,
    FormsModule,
    MatSelectModule,
    AddStudentComponent,
    EditStudentComponent,
    MatMenu,
    MatMenuTrigger,
    MatButton,
    MatMenuItem
  ],
  providers: [UserService],
  templateUrl: './student.component.html',
  styleUrl: './student.component.css'
})
export class StudentComponent implements OnInit{

  students: User[] = []

  entries: string[] = [
    '10', '20', '30', '40', '50'
  ];

  sorting: string[] = [
    'Section', 'Program'
  ];

  yearSemesters: string[] = [
    'School Year 2324 - First Semester', 'School Year 2324 - Second Semester', 'School Year 2324 - Summer'
  ];

  selectedYearSem = 'School Year 2324 - Summer';

  @Input() totalItems: number = 500;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = Math.ceil(this.totalItems / this.itemsPerPage);
  isAddStudent: boolean = false;
  isEditStudent: boolean = false;
  studentToEdit!:User;
  headerImage!: string;
  sortBy = ''

  constructor(
    private userService: UserService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.getStudents();

    this.loadImageToBase64('../../assets/header.png', (base64Image) => {
      this.headerImage = base64Image;
    });
  }

  getStudents() {
    this.userService.getUsersByRole("STUDENT").subscribe({
      next: students => {
        this.students = students;
      }
    })
  }

  onStudentAdded(newStudent: User){
    this.students.push(newStudent);
  }

  onStudentUpdate(updatedStudent: User){
    const index = this.students.findIndex(
      student => student.id === updatedStudent.id
    );

    if(index === -1) return;

    this.students[index] = updatedStudent;
  }

  openConfirmationDialog(student: User){
    const dialog = this.dialog.open(PromptConfirmComponent, {
      width: '400px',
      data: {
        title: 'Deleting Student',
        message: 'Are you sure you want to delete this student?'
      }
    })

    dialog.afterClosed().subscribe( result => {
      if (!result) return;

      this.deleteStudent(student)
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

  get filteredStudents(): User[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.students.slice(startIndex, endIndex);
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

  toggleAddStudent(): void {
    this.isAddStudent = !this.isAddStudent;
  }

  handleBackToStudent(): void {
    this.isAddStudent = false;
  }

  toggleEditStudent(studentToEdit: User): void {
    this.isEditStudent = !this.isEditStudent;
    this.studentToEdit = studentToEdit;
  }

  handleEditBackToStudent(): void {
    this.isEditStudent = false;
  }

  sortStudents() {
    if(this.sortBy === 'Section') {
      this.students.sort((a, b) => {
        return a.section?.id! - b.section?.id!
      })
    } else if (this.sortBy === 'Program'){
      this.students.sort((a, b) => {
        return a.program?.id! - b.program?.id!
      })
    } else {
      this.getStudents();
    }
  }

  private deleteStudent(studentToDelete: User) {
    this.userService.deleteUser(studentToDelete).subscribe({
      next: () => {
        this.students = this.students.filter(student => studentToDelete.id !== student.id);
      }
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

    const title = 'STUDENT LIST';
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, 30, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Date/Time Printed:', pageWidth / 2.1, 35, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleString();
    doc.text(currentDate, pageWidth / 2, 35);

    const columns = ['Student Code','Program', 'First Name', 'Middle Name', 'Last Name', ];
    const rows = this.students.map(students =>
      [
        students.usercode,
        students.program?.programAbbreviation,
        students.firstName,
        students.middleName,
        students.lastName,
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

    doc.save('student-list.pdf');
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

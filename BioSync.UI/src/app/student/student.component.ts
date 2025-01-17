import {Component, OnInit, HostListener} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { AddStudentComponent } from './add-student/add-student.component';
import { EditStudentComponent } from './edit-student/edit-student.component';
import {User} from "../../model/user.model";
import {UserService} from "../../services/user.service";
import {MatDialog} from "@angular/material/dialog";
import {PromptConfirmComponent} from "../prompt/prompt-confirm/prompt-confirm.component";
import jsPDF from "jspdf";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {MatButton} from "@angular/material/button";
import {PromptCsvComponent} from "../prompt/prompt-csv/prompt-csv.component";
import {PromptOkayComponent} from "../prompt/prompt-okay/prompt-okay.component";
import { Program } from '../../model/program.model';
import { ProgramService } from '../../services/program.service';
import { Section } from '../../model/section.model';
import { SectionService } from '../../services/section.service';
import {StudentEditCsvComponent} from "../prompt/student-edit-csv/student-edit-csv.component";

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
  providers: [UserService, SectionService, ProgramService],
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css',
    '../schedule/schedule.component.css', '../subject/subject.component.css']
})
export class StudentComponent implements OnInit{
  queriedStudents: User[] = [];
  students: User[] = [];
  studentContainer: User[] = [];

  entries: string[] = [
    '10', '20', '30', '40', '50'
  ];

  programs: Program[] = [];
  selectedProgram = -1;

  sections: Section[] = [];
  selectedYearAndSection = -1;

  selectedBiometrics = -1;

  totalItems!: number;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalPages!: number
  isAddStudent: boolean = false;
  isEditStudent: boolean = false;
  studentToEdit!:User;
  bagongPilipinas!: string; 
  stamp!: string;
  schoolLogo!: string;  
  searchQuery!: string;
  activeDropdownId: number | null = null;
  reportDropdown = false;

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private sectionService: SectionService,
    private programService: ProgramService,
  ) {}

  ngOnInit() {
    this.getStudents();
    this. getAllPrograms();

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

  getStudents() {
    this.userService.getUsersByRole("STUDENT").subscribe({
      next: students => {
        this.students = students;
        console.log(this.students[0])
        this.studentContainer = students;
        this.queriedStudents = [...this.students];
        this.totalItems = this.students.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      }
    })

    this.queriedStudents = [...this.students];
  }

  onStudentAdded(newStudent: User){
    this.getStudents();
  }

  updatePagination(): void {
    this.totalItems = this.queriedStudents.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  onStudentUpdate(updatedStudent: User){
    const index = this.queriedStudents.findIndex(
      student => student.id === updatedStudent.id
    );

    if(index === -1) return;

    this.queriedStudents[index] = updatedStudent;
  }

  openConfirmationDialog(student: User){
    this.activeDropdownId = null;
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

  openMessageDialog(success: boolean, message?: string){
    this.dialog.open(PromptOkayComponent, {
      width: '400px',
      data: {
        title: success ? 'Student Deleted' : 'Something went wrong',
        message: success ? 'Successfully deleted student.' : message,
      }
    })
  }

  getAllPrograms() {
    this.programService.getAllPrograms().subscribe({
      next: (programs: Program[]) => {
        this.programs = programs;
      }
    })
  }

  getSections(programId: number) {
    this.sectionService.getSectionByProgramId(programId).subscribe({
      next: (sections: Section[]) => {
        this.sections = sections;
      }
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
    return this.queriedStudents.slice(startIndex, endIndex);
  }

  onPageChange(): void {
    // Handle page change logic here
  }

  updateQueriedStudents() {
    this.queriedStudents = this.students;

    // Filter by selected program
    if (this.selectedProgram !== -1) {
      this.getSections(this.selectedProgram);
      this.queriedStudents = this.queriedStudents.filter(
          student => student.section?.program.id === this.selectedProgram
      );
    }

    // Filter by selected section
    if (this.selectedYearAndSection !== -1) {
      this.queriedStudents = this.queriedStudents.filter(
          student => student.section?.id === this.selectedYearAndSection
      );
    }

    // Filter by biometrics status
    if (this.selectedBiometrics !== -1) {
      this.queriedStudents = this.queriedStudents.filter(
          student => student.biometrics === (this.selectedBiometrics > 0)
      );
    }

    // Update pagination data
    this.totalItems = this.queriedStudents.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
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

  toggleDropdownAction(studentId: number): void {
    this.activeDropdownId = this.activeDropdownId === studentId ? null : studentId;
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

  toggleAddStudent(): void {
    this.isAddStudent = !this.isAddStudent;
  }

  handleBackToStudent(): void {
    this.isAddStudent = false;
  }

  toggleEditStudent(studentToEdit: User): void {
    this.activeDropdownId = null;
    this.isEditStudent = !this.isEditStudent;
    this.studentToEdit = studentToEdit;
  }

  handleEditBackToStudent(): void {
    this.isEditStudent = false;
  }

  toggleBulkAddStudent() {
    const ref = this.dialog.open(PromptCsvComponent, {
      width: '450px',
      height: '210px',
      data: {
        scheduleId: null,
      }
    })

    ref.afterClosed().subscribe({
      next: () => {
        this.getStudents()
    }
    })
  }

  searchStudentList() {
    const query = this.searchQuery.toLowerCase();

    this.queriedStudents = this.students.filter(student => {
      return (
        student.firstName.toLowerCase().includes(query) ||
        student.lastName.toLowerCase().includes(query) ||
        student.middleName?.toLowerCase().includes(query) ||
        student.usercode.toLowerCase().includes(query)
      );
    });

    this.currentPage = 1;
  }

  private deleteStudent(studentToDelete: User) {
    this.userService.deleteUser(studentToDelete).subscribe({
      next: () => {
        this.queriedStudents = this.queriedStudents.filter(student => studentToDelete.id !== student.id);
        this.openMessageDialog(true);
        this.updatePagination();
      },
      error: err => {
        console.log(err.error);
        this.openMessageDialog(false, err.error)
      }
    })
  }

  generatePdf() {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const leftX = 10;
    const rightX = pageWidth - 10;
    const lineHeight = 7;
    let currentY = 60; // Start position for content

    //Header and Rows
    const columns = ['Student Code','Program', 'First Name', 'Middle Name', 'Last Name', ];
    let studentsToPrint: User[];
    if(this.selectedProgram == -1 && this.selectedYearAndSection == -1){
      studentsToPrint = this.studentContainer;
    } else {
      studentsToPrint = this.queriedStudents;
    }
    const rows = studentsToPrint.map(students =>
      [
        students.usercode,
        students.program?.programAbbreviation,
        students.firstName,
        students.middleName,
        students.lastName,
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

     const title = 'STUDENT LIST';
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

    doc.save('student-list.pdf');
  }

  generateCSV() {
    const columns = ['Student Code', 'Program', 'First Name', 'Middle Name', 'Last Name'];

    let studentsToPrint: User[];
    if (this.selectedProgram == -1 && this.selectedYearAndSection == -1) {
      studentsToPrint = this.studentContainer;
    } else {
      studentsToPrint = this.queriedStudents;
    }

    let csvContent = columns.join(',') + '\n';

    studentsToPrint.forEach(student => {
      const row = [
        student.usercode,
        student.program?.programAbbreviation || '',
        student.firstName,
        student.middleName,
        student.lastName
      ];
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = 'student-list.csv';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  toggleDropdown(){
    this.reportDropdown = !this.reportDropdown;
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

  openEditDialog() {
    const ref = this.dialog.open(StudentEditCsvComponent, {
      width: '450px',
      height: '210px',
      data: {
        scheduleId: null,
      }
    })

    ref.afterClosed().subscribe({
      next: () => {
        this.getStudents()
      }
    })
  }
}

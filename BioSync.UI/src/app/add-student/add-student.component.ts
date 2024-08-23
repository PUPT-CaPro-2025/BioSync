import {Component, Output, EventEmitter, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import { MatSelectModule } from '@angular/material/select';
import {ProgramService} from "../../services/program.service";
import {Program} from "../../model/program.model";
import {UserService} from "../../services/user.service";
import {User} from "../../model/user.model";
import {MatDialog} from "@angular/material/dialog";
import {PromptOkayComponent} from "../prompt-okay/prompt-okay.component";

@Component({
  selector: 'app-add-student',
  standalone: true,
  imports: [MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule],
  providers: [ProgramService, UserService],
  templateUrl: './add-student.component.html',
  styleUrl: './add-student.component.css'
})
export class AddStudentComponent implements OnInit{
  @Output() backToStudent = new EventEmitter<void>();
  @Output() addedStudent = new EventEmitter<User>();
  //Temporary Suffixes
  allSuffix: string[] = [
    'N/A',
    'Ph.D.',
    'Ed.D.',
    'D.Phil.',
    'D.Sc.',
    'M.D.',
    'Sr.',
    'Jr.',
    '1st',
    '2nd',
    '3rd'
  ];

  allPrograms: Program[] = [];

  allYears: string[] = [
    "1", "2", "3", "4", "Ladderized 1", "Ladderized 2"
  ];

  allSections: number[] = [
    1, 2, 3, 4
  ];

  studentForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private programService: ProgramService,
    private userService: UserService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.getAllPrograms();
    this.initForm();
  }

  initForm(){
    this.studentForm = this.formBuilder.group({
      usercode: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      middleName: ['', [Validators.required]],
      suffix: ['', [Validators.required]],
      program: ['', [Validators.required]],
      year: ['', [Validators.required]],
      section: [null, [Validators.required]]
    });
  }

  getAllPrograms() : Program[] {
    this.programService.getAllPrograms().subscribe({
      next: (programs: Program[]) => {
        this.allPrograms = programs;
      },
      error: error => { console.error(error); }
    })

    return this.allPrograms;
  }

  returnToStudentView(): void {
    this.backToStudent.emit();
  }

  submit(){
    if(!this.studentForm.valid || !this.studentForm.touched) return;

    let studentToAdd = this.studentForm.value;

    let selectedProgram = this.allPrograms.find(
      (program: Program) => program.id === studentToAdd.program);

    studentToAdd = {
      ...studentToAdd,
      program: selectedProgram,
      role: 'STUDENT',
      password: 'student123'
    }

    this.userService.createUser(studentToAdd).subscribe({
      next: (student: User) => {
        if(!student.id) return;
        this.openSuccessDialog();
        this.addedStudent.emit(student);
        this.returnToStudentView();
      }
    })

    return;
  }

  openSuccessDialog(){
    this.dialog.open(PromptOkayComponent, {
      width: '400px',
      data: {
        title: 'Student Added!',
        message: 'Student has been added successfully.'
      }
    })
  }

}

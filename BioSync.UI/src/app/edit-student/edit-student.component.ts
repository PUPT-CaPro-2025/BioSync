import {Component, Output, EventEmitter, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-edit-student',
  standalone: true,
  imports: [MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule],
  templateUrl: './edit-student.component.html',
  styleUrl: './edit-student.component.css'
})
export class EditStudentComponent {
  @Output() backToEditStudent = new EventEmitter<void>();

  //Temporary Suffixes
  allSuffix: string[] = [
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

  //Temporary Programs
  allPrograms: string[] = [
    'BSIT',
    'DIT',
    'BSOA',
    'BSECE',
    'BSBA-MM',
    'BSBA-HRM'
  ];

  allYears: string[] = [
    "1", "2", "3", "4", "Ladderized 1", "Ladderized 2" 
  ];

  allSections: number[] = [
    1, 2, 3, 4
  ];

  studentForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.initForm();
  }

  initForm(){
    this.studentForm = this.formBuilder.group({
      student_name: ['', [Validators.required]],
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      middle_initial: ['', [Validators.required]],
      suffix: ['', [Validators.required]],
      program: ['', [Validators.required]],
      year: ['', [Validators.required]],
      section: [0, [Validators.required]]
    });
  }

  cancelEditStudent(): void {
    this.backToEditStudent.emit();
  }

  submit(){
    console.log("Click Submit!")
    return;
  }
}

import {Component, Output, EventEmitter, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-edit-professor',
  standalone: true,
  imports: [MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule],
  templateUrl: './edit-professor.component.html',
  styleUrl: './edit-professor.component.css'
})
export class EditProfessorComponent {
  @Output() backToEditProfessor = new EventEmitter<void>();

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

  professorForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.initForm();
  }

  initForm(){
    this.professorForm = this.formBuilder.group({
      code: ['', [Validators.required]],
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      middle_initial: ['', [Validators.required]],
      suffix: ['', [Validators.required]]
    });
  }

  cancelEditProfessor(): void {
    this.backToEditProfessor.emit();
  }

  submit(){
    console.log("Click Submit!")
    return;
  }
}

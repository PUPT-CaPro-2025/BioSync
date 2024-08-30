import {Component, Output, EventEmitter, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import { MatSelectModule } from '@angular/material/select';
import { ProgramService } from '../../services/program.service';
import { Program } from '../../model/program.model';

@Component({
  selector: 'app-add-section',
  standalone: true,
  imports: [MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule
  ],
  providers: [ProgramService],
  templateUrl: './add-section.component.html',
  styleUrl: './add-section.component.css'
})
export class AddSectionComponent implements OnInit {
  sectionForm!: FormGroup;

  years: string[] = [
    '1', '2', '3', '4', '5', 'Ladderized'
  ];

  sections: string[] =[
    '1', '2', '3', '4', '5'
  ];

  programs: Program[] = [];

  constructor(private formBuilder: FormBuilder, private programService: ProgramService) {}

  ngOnInit() {
    this.getAllPrograms();
    this.initForm();
  }

  initForm(){
    this.sectionForm = this.formBuilder.group({
      program: ['', [Validators.required]],
      year: ['', [Validators.required]],
      section: ['', Validators.required]
    });
  }

  getAllPrograms() {
    this.programService.getAllPrograms().subscribe({
      next: programs => {
        this.programs = programs;
      }
    })
  }

  submit(){
    console.log("Submit");
    return;
  }
}

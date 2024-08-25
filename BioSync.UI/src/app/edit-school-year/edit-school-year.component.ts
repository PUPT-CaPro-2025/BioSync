import {Component, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-edit-school-year',
  standalone: true,
  imports: [MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule,],
  templateUrl: './edit-school-year.component.html',
  styleUrl: './edit-school-year.component.css'
})
export class EditSchoolYearComponent implements OnInit {
  schoolYearForm!: FormGroup;

  constructor( private formBuilder: FormBuilder) {}

  years: string[] = [
    '2020', '2021', '2022', '2023', '2024', '2025',
    '2026', '2027', '2028', '2029', '2030', '2031',
  ];

  ngOnInit() {
    this.initForm();
  }

  initForm(){
    this.schoolYearForm = this.formBuilder.group({
      yearStart: ['', [Validators.required]],
      yearEnd: ['', [Validators.required]],
      oneStartDate: ['', Validators.required],
      oneEndDate: ['', [Validators.required]],
      twoStartDate: ['', [Validators.required]],
      twoEndDate: ['', [Validators.required]],
      summerStartDate: ['', [Validators.required]],
      summerStart: ['', [Validators.required]],
    });
  }

  submit(){
    console.log("Submit!");
    return;
  }
}

import {Component, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-add-school-year',
  standalone: true,
  imports: [MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './add-school-year.component.html',
  styleUrl: './add-school-year.component.css'
})
export class AddSchoolYearComponent implements OnInit {
  schoolYearForm!: FormGroup;

  constructor( private formBuilder: FormBuilder) {}

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

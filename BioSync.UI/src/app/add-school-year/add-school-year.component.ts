import {Component, Output, EventEmitter, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import { MatSelectModule } from '@angular/material/select';
import {SchoolYear} from "../../model/school.year.model";
import {createApplication} from "@angular/platform-browser";
import {SchoolYearService} from "../../services/school.year.service";
import {ProgramService} from "../../services/program.service";
import {MatDialog} from "@angular/material/dialog";
import {PromptOkayComponent} from "../prompt-okay/prompt-okay.component";

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
  providers: [SchoolYearService],
  templateUrl: './add-school-year.component.html',
  styleUrl: './add-school-year.component.css'
})
export class AddSchoolYearComponent implements OnInit {
  @Output() backToSchoolYear = new EventEmitter<void>();
  @Output() newSchoolYear = new EventEmitter<SchoolYear>();
  addSchoolYearForm!: FormGroup;

  constructor(
      private formBuilder: FormBuilder,
      private schoolYearService: SchoolYearService,
      private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.initAddSchoolYearForm();
  }

  initAddSchoolYearForm(){
    this.addSchoolYearForm = this.formBuilder.group({
      startYear: ['', [Validators.required]],
      endYear: ['', [Validators.required]],
      oneStartDate: ['', Validators.required],
      oneEndDate: ['', [Validators.required]],
      twoStartDate: ['', [Validators.required]],
      twoEndDate: ['', [Validators.required]],
      summerStartDate: ['', [Validators.required]],
      summerEndDate: ['', [Validators.required]],
    });
  }

  returnToSchoolYearView(): void {
    this.backToSchoolYear.emit();
  }

  submit(){
    const formValues = this.addSchoolYearForm.value;

    let newSchoolYear = this.createSchoolYearObject(formValues);

    this.createSchoolYear(newSchoolYear);
  }

  createSchoolYear(schoolYear: SchoolYear){
    this.schoolYearService.createSchoolYear(schoolYear).subscribe({
      next: schoolYear => {
        if(!schoolYear.id) return;
        this.newSchoolYear.emit(schoolYear);
        this.openSuccessDialog();
      }
    })
  }

  createSchoolYearObject(formValues: any): SchoolYear {
    return {
      startYear: formValues.startYear,
      endYear: formValues.endYear,
      firstSemester: {
        name: 'First Semester',
        startDate: formValues.oneStartDate,
        endDate: formValues.oneEndDate,
      },
      secondSemester: {
        name: 'Second Semester',
        startDate: formValues.twoStartDate,
        endDate: formValues.twoEndDate,
      },
      summerSemester: {
        name: 'Summer Semester',
        startDate: formValues.summerStartDate,
        endDate: formValues.summerEndDate,
      }
    };
  }

  openSuccessDialog(): void {
    const ref = this.dialog.open(PromptOkayComponent, {
      width: '400px',
      data: {
        title: 'School Year Added!',
        message: 'School Year has been added successfully.'
      }
    })

    ref.afterClosed().subscribe({
      next: () => {
        this.returnToSchoolYearView();
      }
    })
  }
}

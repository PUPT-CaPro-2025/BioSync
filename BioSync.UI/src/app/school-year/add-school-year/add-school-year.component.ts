import {Component, Output, EventEmitter, OnInit} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {
  FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, 
  Validators, AbstractControl
} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import { MatSelectModule } from '@angular/material/select';
import {SchoolYear} from "../../../model/school.year.model";
import {SchoolYearService} from "../../../services/school.year.service";
import {MatDialog} from "@angular/material/dialog";
import {PromptOkayComponent} from "../../prompt/prompt-okay/prompt-okay.component";
import {
  startYearValidator, endYearValidator, oneMonthGapDateValidator
} from '../../../services/validators/customSchoolYearValidator';

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
      startYear: ['', [Validators.required, startYearValidator()]],
      endYear: ['', [Validators.required, endYearValidator()]],
      oneStartDate: ['', Validators.required],
      oneEndDate: ['', [Validators.required, oneMonthGapDateValidator('oneStartDate')]],
      twoStartDate: ['', [Validators.required]],
      twoEndDate: ['', [Validators.required, oneMonthGapDateValidator('twoStartDate')]],
      summerStartDate: ['', [Validators.required]],
      summerEndDate: ['', [Validators.required, oneMonthGapDateValidator('summerStartDate')]],
    });
  }

  returnToSchoolYearView(): void {
    this.backToSchoolYear.emit();
  }

  get startYearControl(): AbstractControl {
    return this.addSchoolYearForm.get('startYear')!;
  }
  get endYearControl(): AbstractControl {
    return this.addSchoolYearForm.get('endYear')!;
  }

  get oneStartDateControl(): AbstractControl {
    return this.addSchoolYearForm.get('oneStartDate')!;
  }

  get oneEndDateControl(): AbstractControl {
    return this.addSchoolYearForm.get('oneEndDate')!;
  }

  get twoStartDateControl(): AbstractControl {
    return this.addSchoolYearForm.get('twoStartDate')!;
  }

  get twoEndDateControl(): AbstractControl {
    return this.addSchoolYearForm.get('twoEndDate')!;
  }

  get summerStartDateControl(): AbstractControl {
    return this.addSchoolYearForm.get('summerStartDate')!;
  }

  get summerEndDateControl(): AbstractControl {
    return this.addSchoolYearForm.get('summerEndDate')!;
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

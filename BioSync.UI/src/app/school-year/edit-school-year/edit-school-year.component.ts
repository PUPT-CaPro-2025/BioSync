import {Component, Output, EventEmitter, OnInit, Input} from '@angular/core';
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
} from '../school.year.validation';

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
  providers: [SchoolYearService],
  templateUrl: './edit-school-year.component.html',
  styleUrl: './edit-school-year.component.css'
})
export class EditSchoolYearComponent implements OnInit {
  @Output() backToEditSchoolYear = new EventEmitter<void>();
  @Output() editedSchoolYear = new EventEmitter<SchoolYear>();
  @Input() schoolYearToEdit!: SchoolYear;
  schoolYearForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private schoolYearService: SchoolYearService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.initEditSchoolYearForm();
    this.initFormValues();
  }

  initEditSchoolYearForm(){
    this.schoolYearForm = this.formBuilder.group({
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

  initFormValues(){
    const formatDate = (dateString: Date): string => {
      return new Date(dateString).toISOString().split('T')[0];
    };

    this.schoolYearForm.patchValue({
      startYear: this.schoolYearToEdit.startYear,
      endYear: this.schoolYearToEdit.endYear,
      oneStartDate: formatDate(this.schoolYearToEdit.firstSemester.startDate),
      twoStartDate: formatDate(this.schoolYearToEdit.secondSemester.startDate),
      summerStartDate: formatDate(this.schoolYearToEdit.summerSemester.startDate),
      oneEndDate: formatDate(this.schoolYearToEdit.firstSemester.endDate),
      twoEndDate: formatDate(this.schoolYearToEdit.secondSemester.endDate),
      summerEndDate: formatDate(this.schoolYearToEdit.summerSemester.endDate),
    });
  }

  returnToSchoolYearView(): void {
    this.backToEditSchoolYear.emit();
  }

  submit(){
    let hello = this.createSchoolYearObject(this.schoolYearForm.value)

    const updatedSchoolYear= {
      ...this.schoolYearToEdit,
      ...hello,
    }

    console.log(updatedSchoolYear);
    this.editSchoolYear(updatedSchoolYear);
  }

  editSchoolYear(schoolYear: SchoolYear){
    this.schoolYearService.updateSchoolYear(schoolYear).subscribe({
      next: (schoolYear: SchoolYear) => {
        if(!schoolYear.id) return;
        this.editedSchoolYear.emit(schoolYear);
        this.openSuccessDialog();
      }
    })
  }

  openSuccessDialog(){
    const ref = this.dialog.open(PromptOkayComponent, {
      width: '400px',
      data: {
        title: 'School Year Updated',
        message: 'School Year has been updated successfully.',
      }
    })

    ref.afterClosed().subscribe({
      next: () => {
        this.returnToSchoolYearView();
      }
    })
  }

  createSchoolYearObject(formValues: any): SchoolYear {
    return {
      startYear: formValues.startYear,
      endYear: formValues.endYear,
      firstSemester: {
        id: this.schoolYearToEdit.firstSemester.id,
        name: 'First Semester',
        startDate: formValues.oneStartDate,
        endDate: formValues.oneEndDate,
      },
      secondSemester: {
        id: this.schoolYearToEdit.secondSemester.id,
        name: 'Second Semester',
        startDate: formValues.twoStartDate,
        endDate: formValues.twoEndDate,
      },
      summerSemester: {
        id: this.schoolYearToEdit.summerSemester.id,
        name: 'Summer Semester',
        startDate: formValues.summerStartDate,
        endDate: formValues.summerEndDate,
      }
    };
  }

  get startYearControl(): AbstractControl {
    return this.schoolYearForm.get('startYear')!;
  }
  get endYearControl(): AbstractControl {
    return this.schoolYearForm.get('endYear')!;
  }

  get oneStartDateControl(): AbstractControl {
    return this.schoolYearForm.get('oneStartDate')!;
  }

  get oneEndDateControl(): AbstractControl {
    return this.schoolYearForm.get('oneEndDate')!;
  }

  get twoStartDateControl(): AbstractControl {
    return this.schoolYearForm.get('twoStartDate')!;
  }

  get twoEndDateControl(): AbstractControl {
    return this.schoolYearForm.get('twoEndDate')!;
  }

  get summerStartDateControl(): AbstractControl {
    return this.schoolYearForm.get('summerStartDate')!;
  }

  get summerEndDateControl(): AbstractControl {
    return this.schoolYearForm.get('summerEndDate')!;
  }
}

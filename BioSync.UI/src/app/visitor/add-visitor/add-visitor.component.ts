import {Component, EventEmitter, Output, ViewEncapsulation} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {
  FormBuilder, FormGroup, ReactiveFormsModule, 
  Validators, AbstractControl
} from "@angular/forms";
import { MatSelectModule } from '@angular/material/select';
import { MatSelectChange } from '@angular/material/select';
import {MatInput} from "@angular/material/input";
import {MatDialog} from "@angular/material/dialog";
import {VisitorService} from "../../../services/visitor.service";
import {VisitPurposeService} from "../../../services/visit.purpose.service";
import {VisitPurpose} from "../../../model/visit.purpose.model";
import {Laboratory} from "../../../model/laboratory.model";
import {LaboratoryService} from "../../../services/laboratory.service";
import { letterOnlyValidator } from '../../../services/validators/customVisitorValidator';
import { MatToolbarModule } from '@angular/material/toolbar';
import {Visitor} from "../../../model/visitor.model";
import {
  PromptOkayComponent
} from "../../prompt/prompt-okay/prompt-okay.component";
import {finalize} from "rxjs";

@Component({
  selector: 'app-add-visitor',
  standalone: true,
  imports: [MatIconModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatInput,
    MatSelectModule,
    MatToolbarModule
  ],
  providers: [VisitorService, VisitPurposeService, LaboratoryService],
  templateUrl: './add-visitor.component.html',
  styleUrls: ['./add-visitor.component.css', '../../student/add-student/add-student.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AddVisitorComponent {
  visitorForm!: FormGroup;
  showOtherDetails: boolean = false;
  @Output() backToVisitor = new EventEmitter<void>();
  @Output() addedVisitor = new EventEmitter<Visitor>();
  
  labs: Laboratory[] = [];
  visitPurposes: VisitPurpose[] =[];
  
  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private visitorService: VisitorService,
    private visitPurposeService: VisitPurposeService,
    private labService: LaboratoryService
  ) {}
  
  ngOnInit() {
    this.initForm();
    this.getVisitPurposes();
    this.getLaboratories();
  }
  
  onVisitPurposeChange(event: MatSelectChange): void {
    this.showOtherDetails = event.value === 'Others';
  }
  
  initForm(): void{
    this.visitorForm = this.formBuilder.group({
      name: ['', [Validators.required, letterOnlyValidator()]],
      purposeOfVisit: ['', [Validators.required]],
      otherDetails: ['',[Validators.maxLength(100), letterOnlyValidator()]],
      destination: ['', [Validators.required]],
      })
  }
  
  getVisitPurposes(){
    this.visitPurposeService.getVisitPurposes().subscribe({
      next: value => {
        this.visitPurposes = value;
      }
    })
  }
  
  get nameControl(): AbstractControl {
      return this.visitorForm.get('name')!;
  }
  
  get purposeOfVisitControl(): AbstractControl {
    return this.visitorForm.get('purposeOfVisit')!;
  }

  get otherDetailsControl(): AbstractControl {
    return this.visitorForm.get('otherDetails')!;
  }

  get destinationControl(): AbstractControl {
    return this.visitorForm.get('destination')!;
  }

  returnToVisitorView(): void {
    this.backToVisitor.emit();
  }
  
  submit(){
    if(!this.visitorForm.valid) return;

    const createdVisitor = this.visitorForm.value;

    this.visitorService.logVisitor(createdVisitor).subscribe({
      next: (loggedVisitor: Visitor) => {
        if(loggedVisitor.id){
          this.displaySuccess();
          this.addedVisitor.emit(loggedVisitor);
        }
      },
      error: err => console.error(err)
    })
  }

  displaySuccess() {
    const ref = this.dialog.open(PromptOkayComponent, {
      width: '400px',
      data: {
        title: 'Visitor Successfully Logged!',
        message: "Visitor has been successfully recorded in the system."
      }
    })

    ref.afterClosed()
        .pipe(finalize(() => this.returnToVisitorView()))
        .subscribe();
  }
  
  private getLaboratories() {
    this.labService.getLaboratories().subscribe({
      next: value => {
        this.labs = value;
      }
    })
  }
}

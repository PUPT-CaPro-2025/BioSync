import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import { MatSelectModule } from '@angular/material/select';
import { MatSelectChange } from '@angular/material/select';
import {MatInput} from "@angular/material/input";
import {MatDialog} from "@angular/material/dialog";
import {PromptOkayComponent} from "../../prompt/prompt-okay/prompt-okay.component";
import {VisitorService} from "../../../services/visitor.service";
import {Visitor} from "../../../model/visitor.model";
import {Router} from "@angular/router";
import {VisitPurposeService} from "../../../services/visit.purpose.service";
import {VisitPurpose} from "../../../model/visit.purpose.model";
import {Laboratory} from "../../../model/laboratory.model";
import {LaboratoryService} from "../../../services/laboratory.service";

@Component({
  selector: 'app-login-visitor',
  standalone: true,
  imports: [MatIconModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatInput,
    MatSelectModule
  ],
  providers: [VisitorService, VisitPurposeService, LaboratoryService],
  templateUrl: './login-visitor.component.html',
  styleUrl: './login-visitor.component.css'
})
export class LoginVisitorComponent implements OnInit {
  visitorLogForm!: FormGroup;
  showOtherDetails: boolean = false;

  labs: Laboratory[] = [];
  visitPurposes: VisitPurpose[] =[];

  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private visitorService: VisitorService,
    private router: Router,
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
    this.visitorLogForm = this.formBuilder.group({
        name: ['', [Validators.required]],
        purposeOfVisit: ['', [Validators.required]],
        otherDetails: [''],
        destination: ['', [Validators.required]],
      }
    )
  }

  displaySuccess() {
    this.dialog.open(PromptOkayComponent, {
      width: '400px',
      data: {
        title: 'Visitor Successfully Logged!',
        message: "Visitor has been successfully recorded in the system."
      }
    })
  }

  getVisitPurposes(){
    this.visitPurposeService.getVisitPurposes().subscribe({
      next: value => {
        this.visitPurposes = value;
      }
    })
  }


  submit(){
    if(!this.visitorLogForm.valid) return;

    const createdVisitor = this.visitorLogForm.value;

    this.visitorService.logVisitor(createdVisitor).subscribe({
      next: (loggedVisitor: Visitor) => {
        if(loggedVisitor.id){
          this.displaySuccess();
        }
      },
      error: err => console.error(err)
    })

    this.visitorLogForm.reset()
  }

  navigateTo(route: string) {
    this.router.navigate([route]).then();
  }

  private getLaboratories() {
    this.labService.getLaboratories().subscribe({
      next: value => {
        this.labs = value;
      }
    })
  }
}

import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {
  FormBuilder, FormGroup, ReactiveFormsModule, 
  Validators, AbstractControl
} from "@angular/forms";
import { MatSelectModule } from '@angular/material/select';
import { MatSelectChange } from '@angular/material/select';
import {MatInput} from "@angular/material/input";
import {MatDialog} from "@angular/material/dialog";
import {PromptOkayComponent} from "../../prompt/prompt-okay/prompt-okay.component";
import {VisitorService} from "../../../services/visitor.service";
import {Visitor} from "../../../model/visitor.model";
import {Router} from "@angular/router";
import { letterOnlyValidator } from '../visitor.validation';

@Component({
  selector: 'app-login-visitor',
  standalone: true,
  imports: [MatIconModule, 
    ReactiveFormsModule, 
    MatSelectModule, 
    MatInput,
    MatSelectModule
  ],
  providers: [VisitorService],
  templateUrl: './login-visitor.component.html',
  styleUrl: './login-visitor.component.css'
})
export class LoginVisitorComponent implements OnInit {
  visitorLogForm!: FormGroup;
  showOtherDetails: boolean = false;

  labs: string[] = [
    'DOST Laboratory',
    'Aboitiz Laboratory',
  ];

  visitPurposes: string[] =[
    'Panelist',
    'Organizer',
    'Clearance'
  ];

  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private visitorService: VisitorService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initForm();
  }

  onVisitPurposeChange(event: MatSelectChange): void {
    this.showOtherDetails = event.value === 'Others';
  }

  initForm(): void{
    this.visitorLogForm = this.formBuilder.group({
        name: ['', [Validators.required, letterOnlyValidator()]],
        purposeOfVisit: ['', [Validators.required]],
        otherDetails: ['',[Validators.maxLength(50), letterOnlyValidator()]],
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

  get nameControl(): AbstractControl {
    return this.visitorLogForm.get('name')!;
  }
  
  get purposeOfVisitControl(): AbstractControl {
    return this.visitorLogForm.get('purposeOfVisit')!;
  }

  get otherDetailsControl(): AbstractControl {
    return this.visitorLogForm.get('otherDetails')!;
  }
  
  get destinationControl(): AbstractControl {
    return this.visitorLogForm.get('destination')!;
  }
}

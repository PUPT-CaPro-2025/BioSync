import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import { MatSelectModule } from '@angular/material/select';
import {MatInput} from "@angular/material/input";
import {MatDialog} from "@angular/material/dialog";
import {PromptOkayComponent} from "../prompt-okay/prompt-okay.component";
import {VisitorService} from "../../services/visitor.service";
import {Authentication} from "../../model/authentication.model";
import {Visitor} from "../../model/visitor.model";

@Component({
  selector: 'app-login-visitor',
  standalone: true,
  imports: [MatIconModule, ReactiveFormsModule, MatSelectModule, MatInput],
  providers: [VisitorService],
  templateUrl: './login-visitor.component.html',
  styleUrl: './login-visitor.component.css'
})
export class LoginVisitorComponent implements OnInit {
  visitorLogForm!: FormGroup;

  labs: string[] = [
    'DOST Laboratory',
    'Aboitiz Laboratory',
  ];

  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private visitorService: VisitorService,
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm(): void{
    this.visitorLogForm = this.formBuilder.group({
        name: ['', [Validators.required]],
        purposeOfVisit: ['', [Validators.required]],
        otherDetails: ['', [Validators.required]],
        destination: ['', [Validators.required]],
      }
    )
  }

  displaySuccess() {
    this.dialog.open(PromptOkayComponent, {
      width: '400px'
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
}

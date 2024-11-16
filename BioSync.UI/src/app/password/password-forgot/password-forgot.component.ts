import {Component, OnInit} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {MatInput} from "@angular/material/input";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgClass} from "@angular/common";
import {customEmailValidator} from "../../../services/validators/customEmailValidator";
import {PasswordService} from "../../../services/password.service";
import {MatDialog} from "@angular/material/dialog";
import {PromptOkayComponent} from "../../prompt/prompt-okay/prompt-okay.component";
import {MatProgressSpinner} from "@angular/material/progress-spinner";

@Component({
  selector: 'app-password-forgot',
  standalone: true,
  imports: [MatIconModule, MatInput, ReactiveFormsModule, NgClass, MatProgressSpinner],
  providers: [PasswordService],
  templateUrl: './password-forgot.component.html',
  styleUrl: './password-forgot.component.css'
})
export class PasswordForgotComponent implements OnInit {
  passwordResetForm!: FormGroup;
  isValid = false;
  hasSubmitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private passwordService: PasswordService,
    private dialog: MatDialog) {}

  ngOnInit(){
    this.passwordResetForm = this.formBuilder.group({
      email: ['', [Validators.required, customEmailValidator()]],
    })
  }

  isEmailValid(){
    this.isValid = this.passwordResetForm.valid;
  }

  openConfirmDialog(success: boolean){
    this.dialog.open(PromptOkayComponent, {
      width: '400px',
      data: {
        title: success ? 'Email has been sent!' : 'Email does not exist',
        message: success ? 'Please see email inbox for password reset instructions.' : 'We could not find your email.'
      }
    })
  }

  submit(){
    this.isValid = false;
    this.hasSubmitted = true;
    const { email } = this.passwordResetForm.value;
    this.passwordService.forgotPassword(email).subscribe({
      next: () => {
        this.passwordResetForm.reset();
        this.openConfirmDialog(true);
        this.hasSubmitted = false;
      },
      error: () => {
        this.passwordResetForm.reset();
        this.openConfirmDialog(false);
        this.hasSubmitted = false;
      }
    })
  }
}

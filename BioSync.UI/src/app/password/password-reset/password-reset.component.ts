import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PasswordService } from '../../../services/password.service';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { PromptOkayComponent } from '../../prompt/prompt-okay/prompt-okay.component';
import { MatInput } from '@angular/material/input';
import { passwordValidator } from '../../../services/validators/customPasswordValidator';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [
    MatIconModule,
    ReactiveFormsModule,
    CommonModule,
    MatProgressSpinner,
    MatInput,
  ],
  providers: [PasswordService],
  templateUrl: './password-reset.component.html',
  styleUrl: './password-reset.component.css',
})
export class PasswordResetComponent implements OnInit {
  resetPasswordForm!: FormGroup;
  resetToken!: string;
  hasSubmitted = false;
  errorMessage: string | null = null;
  passwordVisible = false;
  passwordFieldType = 'password';
  confirmPasswordVisible = false;
  confirmPasswordFieldType = 'password';
  passwordInput = false;
  confirmPasswordInput = false;

  //update this when implementing Setup password depends on the function 
  setupPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private passwordService: PasswordService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.initForm();
    this.getToken();
  }

  initForm() {
    this.resetPasswordForm = this.formBuilder.group({
      newPassword: ['', [Validators.required, passwordValidator()]],
      confirmPassword: ['', [Validators.required, passwordValidator()]],
    });
  }

  getToken() {
    this.activatedRoute.queryParams.subscribe((params) => {
      const token = params['token'];
      if (token) {
        this.resetToken = token;
      } else {
        this.router.navigate(['/login']).then();
      }
    });
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
    this.passwordFieldType = this.passwordVisible ? 'text' : 'password';
  }

  toggleConfirmPasswordVisibility(): void { 
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
    this.confirmPasswordFieldType = this.confirmPasswordVisible ? 'text' : 'password';
  }

  onInput(field: string): void {
    if (field === 'newPassword') {
      const newPasswordValue = this.resetPasswordForm.get('newPassword')?.value;
      this.passwordInput = !!newPasswordValue && newPasswordValue.length > 0;
      this.setMessageToNull();
    } else if (field === 'confirmPassword') {
      const confirmPasswordValue = this.resetPasswordForm.get('confirmPassword')?.value;
      this.confirmPasswordInput = !!confirmPasswordValue && confirmPasswordValue.length > 0;
    }
  }

  submit() {
    if (this.resetPasswordForm.invalid) {
      this.errorMessage = 'Please enter valid values';
      return;
    }

    const { newPassword, confirmPassword } = this.resetPasswordForm.value;

    if (newPassword !== confirmPassword) {
      this.errorMessage = 'Passwords Do Not Match';
      return;
    }

    this.hasSubmitted = true;

    this.passwordService
      .resetPassword(this.resetToken, confirmPassword)
      .subscribe({
        next: () => {
          this.openConfirmDialog(true);
          this.hasSubmitted = false;
          this.resetPasswordForm.reset();
        },
        error: () => {
          this.openConfirmDialog(false);
          this.hasSubmitted = false;
          this.resetPasswordForm.reset();
        },
      });
  }

  openConfirmDialog(confirm: boolean) {
    const ref = this.dialog.open(PromptOkayComponent, {
      width: '400px',
      data: {
        title: confirm ? 'Password Updated!' : 'Something Went Wrong',
        message: confirm
          ? 'Password has been changed successfully.'
          : 'The password reset token may be invalid or expired.',
      },
    });

    ref.afterClosed().subscribe({
      next: () => {
        this.router.navigate(['/login']).then();
      }
    })
  }

  setMessageToNull() {
    if (this.errorMessage != null) {
      this.errorMessage = null;
    }
  }

  get isFormValid() {
    return this.resetPasswordForm.valid;
  }

  get newPasswordControl(): AbstractControl {
    return this.resetPasswordForm.get('newPassword')!;
  }

  get comfirmPasswordControl(): AbstractControl {
    return this.resetPasswordForm.get('confirmPassword')!;
  }
}

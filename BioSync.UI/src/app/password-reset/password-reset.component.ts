import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [MatIconModule, ReactiveFormsModule, CommonModule],
  templateUrl: './password-reset.component.html',
  styleUrl: './password-reset.component.css'
})
export class PasswordResetComponent {
    resetPasswordForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.resetPasswordForm = this.formBuilder.group({
            newPassword: ['', Validators.required],
            confirmPassword: ['', Validators.required]
        });
    }

    get isFormValid() {
        return this.resetPasswordForm.valid;
    }
}

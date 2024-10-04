import { AbstractControl, ValidatorFn } from '@angular/forms';

export function customEmailValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const email = control.value;
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const valid = emailRegex.test(email);
    return valid ? null : { invalidEmail: true };
  };
}

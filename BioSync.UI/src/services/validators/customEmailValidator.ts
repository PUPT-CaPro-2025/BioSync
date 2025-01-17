import { AbstractControl, ValidatorFn } from '@angular/forms';

export function customEmailValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const email = control.value;
    const emailRegex = /^[a-z0-9ñ.+_-]+@[a-z0-9ñ.-]+\.[a-zñ]{2,}$/;
    const valid = emailRegex.test(email);
    return valid ? null : { invalidEmail: true };
  };
}

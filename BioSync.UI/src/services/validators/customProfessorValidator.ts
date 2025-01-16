import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function usercodeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      const pattern = /^FA\d{4}[A-Z]{2,3}\d{4}$/;

      const isValid = pattern.test(value);
      return isValid ? null : { invalidUsercode: true };
    };
  }

export function facultyNameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    const isValid = /^[a-zA-Z\s]*$/.test(value);
    return isValid ? null : { invalidName: true };
  };
}
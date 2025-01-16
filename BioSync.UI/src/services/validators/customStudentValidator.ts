import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function usercodeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      const pattern = /^\d{4}-\d{5}-[A-Z]{2,3}-\d$/

      const isValid = pattern.test(value);
      return isValid ? null : { invalidUsercode: true };
    };
}

export function studentNameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    const isValid = /^[a-zA-Z\s]*$/.test(value);
    return isValid ? null : { invalidName: true };
  };
}
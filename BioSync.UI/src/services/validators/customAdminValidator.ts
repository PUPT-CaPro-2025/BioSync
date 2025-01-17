import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function adminNameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    const isValid = /^[a-zA-ZñÑ\s]*$/.test(value);
    return isValid ? null : { invalidName: true };
  };
}
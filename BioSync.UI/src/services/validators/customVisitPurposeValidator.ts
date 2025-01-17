import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function visitPurposeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    const isValid = /^[a-zA-Z\s]*$/.test(value);
    return isValid ? null : { invalidVisitPurpose: true };
  };
}

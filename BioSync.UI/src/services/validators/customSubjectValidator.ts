import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function subjectCodeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    const isValid = /^[a-zA-Z0-9\- ]*$/.test(value);
    return isValid ? null : { invalidSubjectCode: true };
  };
}
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function programAbbreviationValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    const isValid = /^[A-Z-]+$/.test(value);
    return isValid ? null : { invalidProgramAbbreviation: true };
  };
}

export function lettersAndSpacesValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    const isValid = /^[A-Za-z\s]+$/.test(value);
    return isValid ? null : { onlyLettersAllowed: true }; 
  };
}
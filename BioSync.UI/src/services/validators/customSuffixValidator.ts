import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function letterAndSpacesValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      const isValid = /^[a-zA-ZÑñ\s]*$/.test(value);
      return isValid ? null : { invalidName: true };
    };
}

export function letterOnlyValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    const isValid = /^[A-Za-zÑñ]*$/.test(value);
    return isValid ? null : { invalidName: true };
  };
}
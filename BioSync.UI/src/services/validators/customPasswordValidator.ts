import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (value && value.length < 8) {
      return { minLength: true };
    }

    if (value && !/[A-Z]/.test(value)) {
      return { noUppercase: true };
    }

    if (value && !/[a-z]/.test(value)) {
      return { noLowercase: true };
    }

    if (value && !/\d/.test(value)) {
      return { noNumber: true };
    }

    if (value && !/[@$!%*?&]/.test(value)) {
      return { noSpecialChar: true };
    }

    return null;
  };
}

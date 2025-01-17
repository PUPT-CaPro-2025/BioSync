import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function laboratoryNameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    const isValid = /^[a-zA-ZñÑ\s]*$/.test(value);
    return isValid ? null : { invalidName: true };
  };
}

export function roomCodeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    const isValid = /^[a-zA-Z0-9 \-]*$/.test(value);
    return isValid ? null : { invalidRoomCode: true };
  };
}

export function capacityValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    const isValid = /^[0-9]*$/.test(value);
    return isValid ? null : { invalidCapacity: true };
  };
}

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function startYearValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const startYear = control.value;

      const isValidYear = (year: string | number): boolean => {
        return typeof year === 'string' 
            ? /^\d{4}$/.test(year) 
            : Number.isInteger(year) && year >= 1000 && year <= 9999;
      };

      return isValidYear(startYear) ? null : { invalidNumber: true };
    };
}

export function endYearValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const endYear = control.value;
    const startYear = control.parent?.get('startYear')?.value;

    const isValidYear = (year: string | number): boolean => {
      return typeof year === 'string' 
          ? /^\d{4}$/.test(year) 
          : Number.isInteger(year) && year >= 1000 && year <= 9999;
    };

    if (!isValidYear(endYear)) {
      return { invalidNumber: true }; 
    }

    if (startYear && parseInt(endYear) !== parseInt(startYear) + 1) {
      return { yearEndNotValid: true }; 
    }

    return null;
  };
}

export function oneMonthGapDateValidator(startControlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const formGroup = control.parent;
      if (!formGroup) return null;

      const startDate = formGroup.get(startControlName)?.value;
      const endDate = control.value;

      if (!startDate || !endDate) {
        return null;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      const isValidGap = (end.getTime() - start.getTime()) >= (30 * 24 * 60 * 60 * 1000); 

      return isValidGap ? null : { insufficientGap: true };
    };
}
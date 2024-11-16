import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

function parseTime(time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0); 
  return date;
}

export function belowStartTimeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const startTime = parseTime(value).getTime();
    const earliestStart = parseTime('07:30').getTime();

    const isValid = startTime >= earliestStart;
    return isValid ? null : { belowStartTime: true };
  };
}

export function aboveStartTimeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const startTime = parseTime(value).getTime();
      const limit = parseTime('18:30').getTime(); 
  
      const isValid = startTime <= limit;
      return isValid ? null : { aboveStartTime: true };
    };
  }
  

export function aboveEndTimeValidator(getStartTime: () => string | null): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null; 

    const endTime = parseTime(value).getTime();
    const latestEnd = parseTime('21:30').getTime();

    const isEndTimeValid = endTime <= latestEnd;

    const startTimeValue = getStartTime();
    let isEndTimeAfterStart = true;
    if (startTimeValue) {
      const startTime = parseTime(startTimeValue).getTime();
      const threeHoursInMs = 3 * 60 * 60 * 1000;
      isEndTimeAfterStart = (endTime - startTime) >= threeHoursInMs;
    }

    const isValid = isEndTimeValid && isEndTimeAfterStart;
    if (isValid) {
      return null;
    } else if (!isEndTimeValid) {
      return { aboveStartTime: true };
    } else {
      return { endTimeTooSoon: true };
    }
  };
}

export function belowEndTimeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const endTime = parseTime(value).getTime();
      const limit = parseTime('10:30').getTime(); 
  
      const isValid = endTime >= limit;
      return isValid ? null : { belowStartTime: true };
    };
}
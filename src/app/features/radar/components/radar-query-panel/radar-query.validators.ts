import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function finiteRangeValidator(min: number, max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: unknown = control.value;
    return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max
      ? null
      : { finiteRange: { min, max } };
  };
}

export function positiveRadiusValidator(control: AbstractControl): ValidationErrors | null {
  const value: unknown = control.value;
  return typeof value === 'number' && Number.isFinite(value) && value > 0 && value <= 250
    ? null
    : { radius: { max: 250 } };
}

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import {isDominioValid} from '../index';

export function dominioValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const isValid = isDominioValid(control.value);
    return isValid ? null : { invalidDominio: { value: control.value } };
  };
}

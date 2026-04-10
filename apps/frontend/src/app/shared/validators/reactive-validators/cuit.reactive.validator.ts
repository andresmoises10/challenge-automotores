import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import {isCuitValid} from '../index';


export function cuitValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const isValid = isCuitValid(control.value);
    return isValid ? null : { invalidCuit: { value: control.value } };
  };
}

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import {isFechaFabricacionValid} from '../index';

export function fechaFabricacionValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const isValid = isFechaFabricacionValid(control.value);
    return isValid ? null : { invalidFechaFabricacion: { value: control.value } };
  };
}

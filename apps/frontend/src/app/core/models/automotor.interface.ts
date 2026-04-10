import {Sujeto} from './sujeto.interface';

export interface Automotor {
  id?: number;
  dominio: string;
  chasis: string;
  motor: string;
  color: string;
  fechaFabricacion: string; // YYYYMM
  cuit: string;
  sujeto?: Sujeto;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAutomotorPayload {
  dominio: string;
  chasis: string;
  motor: string;
  color: string;
  fechaFabricacion: string;
  cuit: string;
}

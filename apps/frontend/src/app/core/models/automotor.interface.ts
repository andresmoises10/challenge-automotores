import {Sujeto} from './sujeto.interface';

export interface Automotor {
  id?: number;
  dominio: string;
  chasis: string;
  motor: string;
  color: string;
  fechaFabricacion: string; // YYYYMM
  cuit: string;
  sujeto_id?: number;
  sujeto?: Sujeto;
  createdAt?: string;
  updatedAt?: string;
}


/** Payload para POST /api/automotores */
export interface CreateAutomotorPayload {
  cuit: string;
  dominio: string;
  chasis: string;
  motor: string;
  color: string;
  fechaFabricacion: string;
}

/** Payload para PUT /api/automotores/:dominio */
export interface UpdateAutomotorPayload {
  dominio?: string;
  chasis?: string;
  motor?: string;
  color?: string;
  fechaFabricacion?: string;
}

/** Respuesta paginada de GET /api/automotores */
export interface PaginatedAutomotores {
  data: Automotor[];
  total: number;
  page: number;
  limit: number;
}

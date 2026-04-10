export interface Sujeto {
  id?: number;
  cuit: string;
  nombre: string;
  tipo: 'PERSONA_FISICA' | 'PERSONA_JURIDICA';
  createdAt?: string;
  updatedAt?: string;
}

/** Payload para POST /api/sujetos */
export interface CreateSujetoPayload {
  cuit: string;
  nombre: string;
  tipo: 'PERSONA_FISICA' | 'PERSONA_JURIDICA';
}

/** Respuesta paginada de GET /api/sujetos */
export interface PaginatedSujetos {
  data: Sujeto[];
  total: number;
  page: number;
  limit: number;
}

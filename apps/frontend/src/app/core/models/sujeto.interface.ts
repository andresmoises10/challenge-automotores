export interface Sujeto {
  id?: number;
  cuit: string;
  nombre: string;
  tipo: 'PERSONA_FISICA' | 'PERSONA_JURIDICA';
  createdAt?: string;
  updatedAt?: string;
}

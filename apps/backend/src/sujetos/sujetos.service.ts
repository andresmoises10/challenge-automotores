import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SujetoEntity } from './entities/sujeto.entity';
import { CreateSujetoDto } from './dtos/create-sujeto.dto';
import { VALIDATION_MESSAGES, ERROR_CODES } from '../config';

/**
 * Servicio de Sujetos
 * Contiene toda la lógica de negocio para Sujetos
 *
 * Responsabilidades:
 * - CRUD básico (Create, Read)
 * - Búsqueda por CUIT
 * - Validaciones de duplicados
 * - Manejo de errores
 */
@Injectable()
export class SujetosService {
  constructor(
    @InjectRepository(SujetoEntity)
    private sujetosRepository: Repository<SujetoEntity>,
  ) {}

  /**
   * Crear un nuevo Sujeto
   *
   * Validaciones:
   * 1. CUIT no debe existir (verificar en DB)
   * 2. DTO ya validó formato CUIT, nombre, tipo
   *
   * @param createSujetoDto - DTO con cuit, nombre, tipo
   * @returns Sujeto creado
   * @throws BadRequestException si CUIT duplicado
   * @throws InternalServerErrorException si error en DB
   *
   * @example
   * const sujeto = await this.sujetosService.create({
   *   cuit: '20123456789',
   *   nombre: 'Juan Pérez',
   *   tipo: 'PERSONA_FISICA'
   * });
   * // → { id: 1, cuit: '20123456789', nombre: 'Juan Pérez', ... }
   */
  async create(createSujetoDto: CreateSujetoDto): Promise<SujetoEntity> {
    try {
      // Paso 1: Verificar que el CUIT no exista
      const existingSujeto = await this.findByCuit(createSujetoDto.cuit);
      if (existingSujeto) {
        throw new BadRequestException({
          code: ERROR_CODES.CUIT_DUPLICATED,
          fieldErrors: {
            cuit: VALIDATION_MESSAGES.CUIT_DUPLICATED,
          },
        });
      }

      // Paso 2: Crear el sujeto
      const sujeto = this.sujetosRepository.create(createSujetoDto);

      // Paso 3: Guardar en DB
      const savedSujeto = await this.sujetosRepository.save(sujeto);

      return savedSujeto;
    } catch (error) {
      // Si es BadRequestException (CUIT duplicado), re-lanzar
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Si es error de DB, loguear y devolver error genérico
      console.error('Error al crear sujeto:', error);
      throw new InternalServerErrorException({
        code: ERROR_CODES.DATABASE_ERROR,
        message: 'Error al crear sujeto en la base de datos',
      });
    }
  }

  /**
   * Obtener un Sujeto por ID
   *
   * @param id - ID del sujeto
   * @returns Sujeto encontrado
   * @throws NotFoundException si no existe
   *
   * @example
   * const sujeto = await this.sujetosService.findById(1);
   */
  async findById(id: number): Promise<SujetoEntity> {
    try {
      const sujeto = await this.sujetosRepository.findOneBy({ id });

      if (!sujeto) {
        throw new NotFoundException({
          code: ERROR_CODES.SUJETO_NOT_FOUND,
          message: VALIDATION_MESSAGES.SUJETO_NOT_FOUND,
        });
      }

      return sujeto;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      console.error('Error al buscar sujeto por ID:', error);
      throw new InternalServerErrorException({
        code: ERROR_CODES.DATABASE_ERROR,
        message: 'Error al buscar sujeto',
      });
    }
  }

  /**
   * Obtener un Sujeto por CUIT
   *
   * Usado en:
   * - Validación de CUIT antes de crear automotor
   * - Endpoint GET /api/sujetos/by-cuit?cuit=...
   *
   * @param cuit - CUIT (11 dígitos)
   * @returns Sujeto encontrado o null
   *
   * @example
   * const sujeto = await this.sujetosService.findByCuit('20123456789');
   */
  async findByCuit(cuit: string): Promise<SujetoEntity | null> {
    try {
      const sujeto = await this.sujetosRepository.findOneBy({ cuit });
      return sujeto || null;
    } catch (error) {
      console.error('Error al buscar sujeto por CUIT:', error);
      throw new InternalServerErrorException({
        code: ERROR_CODES.DATABASE_ERROR,
        message: 'Error al buscar sujeto',
      });
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: SujetoEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const skip = (page - 1) * limit;

      const [data, total] = await this.sujetosRepository.findAndCount({
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
      });

      return { data, total, page, limit };
    } catch (error) {
      console.error('Error al obtener sujetos:', error);
      throw new InternalServerErrorException({
        code: ERROR_CODES.DATABASE_ERROR,
        message: 'Error al obtener sujetos',
      });
    }
  }

  async cuitExists(cuit: string): Promise<boolean> {
    try {
      const sujeto = await this.findByCuit(cuit);
      return sujeto !== null;
    } catch {
      return false;
    }
  }
}

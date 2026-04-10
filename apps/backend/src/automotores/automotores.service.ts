import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AutomotorEntity } from './entities/automotor.entity';
import { CreateAutomotorDto, UpdateAutomotorDto } from './dtos';
import { SujetosService } from '../sujetos/sujetos.service';
import {
  VALIDATION_MESSAGES,
  ERROR_CODES,
  DEFAULT_LIMIT,
  MAX_LIMIT,
} from '../config';

/**
 * Servicio de Automotores
 *
 * Contiene toda la lógica de negocio para Automotores:
 * - CRUD (Create, Read, Update, Delete)
 * - Validaciones de duplicados (dominio, chasis, motor)
 * - Verificación de CUIT en sujetos
 * - Manejo de errores
 *
 * Inyecta:
 * - Repository<AutomotorEntity> → acceso a DB
 * - SujetosService → validar CUIT existe
 */
@Injectable()
export class AutomotolesService {
  constructor(
    @InjectRepository(AutomotorEntity)
    private automotolesRepository: Repository<AutomotorEntity>,
    private sujetosService: SujetosService,
  ) {}

  /**
   * Crear un nuevo Automotor
   *
   * Flujo:
   * 1. DTO valida formato (dominio, chasis, motor, fecha, color)
   * 2. Verificar que CUIT existe en sujetos
   * 3. Verificar que dominio no esté duplicado
   * 4. Verificar que chasis no esté duplicado
   * 5. Verificar que motor no esté duplicado
   * 6. Guardar en DB
   *
   * @param createAutomotorDto - DTO con dominio, chasis, motor, color, fecha, cuit
   * @returns Automotor creado
   * @throws BadRequestException si hay error de validación o duplicados
   * @throws InternalServerErrorException si error en DB
   *
   * @example
   * const automotor = await this.automotolesService.create({
   *   dominio: 'ABC123',
   *   chasis: 'ABC123XYZ456',
   *   motor: 'DEF456XYZ789',
   *   color: 'Blanco',
   *   fechaFabricacion: '202401',
   *   cuit: '20123456789'
   * });
   */
  async create(
    createAutomotorDto: CreateAutomotorDto,
  ): Promise<AutomotorEntity> {
    try {
      // Paso 1: Verificar que el CUIT existe en sujetos
      const sujeto = await this.sujetosService.findByCuit(
        createAutomotorDto.cuit,
      );

      if (!sujeto) {
        throw new BadRequestException({
          code: ERROR_CODES.SUJETO_NOT_FOUND,
          message: VALIDATION_MESSAGES.CUIT_NOT_FOUND,
        });
      }

      // Paso 2: Verificar que dominio no esté duplicado
      const existingDominio = await this.automotolesRepository.findOneBy({
        dominio: createAutomotorDto.dominio,
      });

      if (existingDominio) {
        throw new BadRequestException({
          code: ERROR_CODES.DOMINIO_DUPLICATED,
          fieldErrors: {
            dominio: VALIDATION_MESSAGES.DOMINIO_DUPLICATED,
          },
        });
      }

      // Paso 3: Verificar que chasis no esté duplicado
      const existingChasis = await this.automotolesRepository.findOneBy({
        chasis: createAutomotorDto.chasis,
      });

      if (existingChasis) {
        throw new BadRequestException({
          code: ERROR_CODES.CHASIS_DUPLICATED,
          fieldErrors: {
            chasis: VALIDATION_MESSAGES.CHASIS_DUPLICATED,
          },
        });
      }

      // Paso 4: Verificar que motor no esté duplicado
      const existingMotor = await this.automotolesRepository.findOneBy({
        motor: createAutomotorDto.motor,
      });

      if (existingMotor) {
        throw new BadRequestException({
          code: ERROR_CODES.MOTOR_DUPLICATED,
          fieldErrors: {
            motor: VALIDATION_MESSAGES.MOTOR_DUPLICATED,
          },
        });
      }

      // Paso 5: Crear el automotor
      const automotor = this.automotolesRepository.create({
        ...createAutomotorDto,
        sujeto_id: sujeto.id,
      });

      // Paso 6: Guardar en DB
      const savedAutomotor = await this.automotolesRepository.save(automotor);

      return savedAutomotor;
    } catch (error) {
      // Si es BadRequestException, re-lanzar (validación fallida)
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Si es error de DB, loguear y devolver error genérico
      console.error('Error al crear automotor:', error);
      throw new InternalServerErrorException({
        code: ERROR_CODES.DATABASE_ERROR,
        message: 'Error al crear automotor en la base de datos',
      });
    }
  }

  /**
   * Obtener todos los Automotores con paginación
   *
   * @param page - Página (default: 1)
   * @param limit - Límite por página (default: 10, max: 100)
   * @returns objeto con data, total, page, limit
   *
   * @example
   * const result = await this.automotolesService.findAll(1, 10);
   * // → { data: [...], total: 150, page: 1, limit: 10 }
   */
  async findAll(
    page: number = 1,
    limit: number = DEFAULT_LIMIT,
  ): Promise<{
    data: AutomotorEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      // Validar límite máximo
      const safeLimit = Math.min(limit, MAX_LIMIT);
      const skip = (page - 1) * safeLimit;

      const [data, total] = await this.automotolesRepository.findAndCount({
        skip,
        take: safeLimit,
        order: { createdAt: 'DESC' },
        relations: ['sujeto'], // Carga el sujeto (propietario)
      });

      return { data, total, page, limit: safeLimit };
    } catch (error) {
      console.error('Error al obtener automotores:', error);
      throw new InternalServerErrorException({
        code: ERROR_CODES.DATABASE_ERROR,
        message: 'Error al obtener automotores',
      });
    }
  }

  /**
   * Obtener un Automotor por ID
   *
   * @param id - ID del automotor
   * @returns Automotor encontrado
   * @throws NotFoundException si no existe
   *
   * @example
   * const automotor = await this.automotolesService.findById(1);
   */
  async findById(id: number): Promise<AutomotorEntity> {
    try {
      const automotor = await this.automotolesRepository.findOne({
        where: { id },
        relations: ['sujeto'],
      });

      if (!automotor) {
        throw new NotFoundException({
          code: ERROR_CODES.AUTOMOTOR_NOT_FOUND,
          message: VALIDATION_MESSAGES.AUTOMOTOR_NOT_FOUND,
        });
      }

      return automotor;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      console.error('Error al buscar automotor por ID:', error);
      throw new InternalServerErrorException({
        code: ERROR_CODES.DATABASE_ERROR,
        message: 'Error al buscar automotor',
      });
    }
  }

  async findByDominio(dominio: string): Promise<AutomotorEntity> {
    try {
      const automotor = await this.automotolesRepository.findOne({
        where: { dominio },
        relations: ['sujeto'],
      });

      if (!automotor) {
        throw new NotFoundException({
          code: ERROR_CODES.AUTOMOTOR_NOT_FOUND,
          message: VALIDATION_MESSAGES.AUTOMOTOR_NOT_FOUND,
        });
      }

      return automotor;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      console.error('Error al buscar automotor por dominio:', error);
      throw new InternalServerErrorException({
        code: ERROR_CODES.DATABASE_ERROR,
        message: 'Error al buscar automotor',
      });
    }
  }

  async updateByDominio(dominio: string, updateAutomotorDto: UpdateAutomotorDto): Promise<AutomotorEntity> {
    try {
      const automotor = await this.findByDominio(dominio);

      if (updateAutomotorDto.dominio && updateAutomotorDto.dominio !== automotor.dominio) {
        const existing = await this.automotolesRepository.findOneBy({ dominio: updateAutomotorDto.dominio });
        if (existing) {
          throw new BadRequestException({ code: ERROR_CODES.DOMINIO_DUPLICATED, fieldErrors: { dominio: VALIDATION_MESSAGES.DOMINIO_DUPLICATED } });
        }
      }

      if (updateAutomotorDto.chasis && updateAutomotorDto.chasis !== automotor.chasis) {
        const existing = await this.automotolesRepository.findOneBy({ chasis: updateAutomotorDto.chasis });
        if (existing) {
          throw new BadRequestException({ code: ERROR_CODES.CHASIS_DUPLICATED, fieldErrors: { chasis: VALIDATION_MESSAGES.CHASIS_DUPLICATED } });
        }
      }

      if (updateAutomotorDto.motor && updateAutomotorDto.motor !== automotor.motor) {
        const existing = await this.automotolesRepository.findOneBy({ motor: updateAutomotorDto.motor });
        if (existing) {
          throw new BadRequestException({ code: ERROR_CODES.MOTOR_DUPLICATED, fieldErrors: { motor: VALIDATION_MESSAGES.MOTOR_DUPLICATED } });
        }
      }

      Object.assign(automotor, updateAutomotorDto);
      return this.automotolesRepository.save(automotor);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      console.error('Error al actualizar automotor por dominio:', error);
      throw new InternalServerErrorException({
        code: ERROR_CODES.DATABASE_ERROR,
        message: 'Error al actualizar automotor',
      });
    }
  }

  async deleteByDominio(dominio: string): Promise<void> {
    try {
      const automotor = await this.findByDominio(dominio);
      await this.automotolesRepository.remove(automotor);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      console.error('Error al eliminar automotor por dominio:', error);
      throw new InternalServerErrorException({
        code: ERROR_CODES.DATABASE_ERROR,
        message: 'Error al eliminar automotor',
      });
    }
  }

  /**
   * Actualizar un Automotor
   *
   * Flujo:
   * 1. Verificar que existe el automotor
   * 2. Si actualiza dominio → verificar que no esté duplicado
   * 3. Si actualiza chasis → verificar que no esté duplicado
   * 4. Si actualiza motor → verificar que no esté duplicado
   * 5. Guardar cambios
   *
   * @param id - ID del automotor
   * @param updateAutomotorDto - DTO con campos opcionales
   * @returns Automotor actualizado
   * @throws NotFoundException si no existe
   * @throws BadRequestException si hay conflicto de duplicados
   *
   * @example
   * const automotor = await this.automotolesService.update(1, {
   *   color: 'Rojo',
   *   dominio: 'XYZ789'
   * });
   */
  async update(
    id: number,
    updateAutomotorDto: UpdateAutomotorDto,
  ): Promise<AutomotorEntity> {
    try {
      // Paso 1: Verificar que existe
      const automotor = await this.findById(id);

      // Paso 2: Si actualiza dominio, verificar duplicado
      if (
        updateAutomotorDto.dominio &&
        updateAutomotorDto.dominio !== automotor.dominio
      ) {
        const existingDominio = await this.automotolesRepository.findOneBy({
          dominio: updateAutomotorDto.dominio,
        });

        if (existingDominio) {
          throw new BadRequestException({
            code: ERROR_CODES.DOMINIO_DUPLICATED,
            fieldErrors: {
              dominio: VALIDATION_MESSAGES.DOMINIO_DUPLICATED,
            },
          });
        }
      }

      // Paso 3: Si actualiza chasis, verificar duplicado
      if (
        updateAutomotorDto.chasis &&
        updateAutomotorDto.chasis !== automotor.chasis
      ) {
        const existingChasis = await this.automotolesRepository.findOneBy({
          chasis: updateAutomotorDto.chasis,
        });

        if (existingChasis) {
          throw new BadRequestException({
            code: ERROR_CODES.CHASIS_DUPLICATED,
            fieldErrors: {
              chasis: VALIDATION_MESSAGES.CHASIS_DUPLICATED,
            },
          });
        }
      }

      // Paso 4: Si actualiza motor, verificar duplicado
      if (
        updateAutomotorDto.motor &&
        updateAutomotorDto.motor !== automotor.motor
      ) {
        const existingMotor = await this.automotolesRepository.findOneBy({
          motor: updateAutomotorDto.motor,
        });

        if (existingMotor) {
          throw new BadRequestException({
            code: ERROR_CODES.MOTOR_DUPLICATED,
            fieldErrors: {
              motor: VALIDATION_MESSAGES.MOTOR_DUPLICATED,
            },
          });
        }
      }

      // Paso 5: Aplicar cambios
      Object.assign(automotor, updateAutomotorDto);

      // Paso 6: Guardar
      const updatedAutomotor = await this.automotolesRepository.save(automotor);

      return updatedAutomotor;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      console.error('Error al actualizar automotor:', error);
      throw new InternalServerErrorException({
        code: ERROR_CODES.DATABASE_ERROR,
        message: 'Error al actualizar automotor',
      });
    }
  }

  /**
   * Eliminar un Automotor
   *
   * @param id - ID del automotor
   * @returns void (no devuelve nada)
   * @throws NotFoundException si no existe
   *
   * @example
   * await this.automotolesService.delete(1);
   */
  async delete(id: number): Promise<void> {
    try {
      // Verificar que existe
      const automotor = await this.findById(id);

      // Eliminar
      await this.automotolesRepository.remove(automotor);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      console.error('Error al eliminar automotor:', error);
      throw new InternalServerErrorException({
        code: ERROR_CODES.DATABASE_ERROR,
        message: 'Error al eliminar automotor',
      });
    }
  }

  /**
   * Obtener automotores por CUIT (propietario)
   *
   * Útil para listado de automotores de un sujeto específico
   *
   * @param cuit - CUIT del propietario
   * @returns array de automotores
   *
   * @example
   * const automotores = await this.automotolesService.findByCuit('20123456789');
   */
  async findByCuit(cuit: string): Promise<AutomotorEntity[]> {
    try {
      const automotores = await this.automotolesRepository
        .createQueryBuilder('automotor')
        .leftJoinAndSelect('automotor.sujeto', 'sujeto')
        .where('sujeto.cuit = :cuit', { cuit })
        .orderBy('automotor.createdAt', 'DESC')
        .getMany();

      return automotores;
    } catch (error) {
      console.error('Error al buscar automotores por CUIT:', error);
      throw new InternalServerErrorException({
        code: ERROR_CODES.DATABASE_ERROR,
        message: 'Error al buscar automotores',
      });
    }
  }

  /**
   * Verificar si un dominio ya existe
   *
   * @param dominio - Dominio a verificar
   * @returns true si existe, false si no
   */
  async dominioExists(dominio: string): Promise<boolean> {
    try {
      const result = await this.automotolesRepository.findOneBy({ dominio });
      return result !== null;
    } catch {
      return false;
    }
  }

  /**
   * Verificar si un chasis ya existe
   *
   * @param chasis - Chasis a verificar
   * @returns true si existe, false si no
   */
  async chasisExists(chasis: string): Promise<boolean> {
    try {
      const result = await this.automotolesRepository.findOneBy({ chasis });
      return result !== null;
    } catch {
      return false;
    }
  }

  /**
   * Verificar si un motor ya existe
   *
   * @param motor - Motor a verificar
   * @returns true si existe, false si no
   */
  async motorExists(motor: string): Promise<boolean> {
    try {
      const result = await this.automotolesRepository.findOneBy({ motor });
      return result !== null;
    } catch {
      return false;
    }
  }
}

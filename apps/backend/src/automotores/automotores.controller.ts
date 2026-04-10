import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { AutomotolesService } from './automotores.service';
import { CreateAutomotorDto, UpdateAutomotorDto } from './dtos';
import { AutomotorEntity } from './entities/automotor.entity';

const SCHEMA_422 = {
  schema: {
    example: {
      statusCode: 422,
      code: 'VALIDATION_ERROR',
      message: 'Validación fallida',
      fieldErrors: {
        dominio: 'Dominio debe ser AAA999 o AA999AA',
        cuit: 'CUIT debe ser 11 dígitos válidos (módulo 11)',
        chasis: 'Chasis debe ser alfanumérico de 6 a 20 caracteres',
        motor: 'Motor debe ser alfanumérico de 6 a 20 caracteres',
        fechaFabricacion: 'Fecha debe ser YYYYMM (ej: 202401), no puede ser futura',
      },
    },
  },
};

const SCHEMA_400_SUJETO_NOT_FOUND = {
  schema: {
    example: {
      statusCode: 400,
      code: 'SUJETO_NOT_FOUND',
      message: 'CUIT no encontrado en el sistema',
    },
  },
};

const SCHEMA_404_AUTOMOTOR = {
  schema: {
    example: {
      statusCode: 404,
      code: 'AUTOMOTOR_NOT_FOUND',
      message: 'Automotor no encontrado',
    },
  },
};

@ApiTags('Automotores')
@Controller('automotores')
export class AutomotolesController {
  constructor(private readonly automotolesService: AutomotolesService) {}

  /**
   * POST /api/automotores
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear un nuevo automotor',
    description:
      'Registra un vehículo en el sistema. El CUIT debe corresponder a un sujeto existente. ' +
      'Dominio, chasis y motor deben ser únicos. Si el CUIT no existe, el frontend debe crear primero el sujeto.',
  })
  @ApiBody({ type: CreateAutomotorDto })
  @ApiResponse({
    status: 201,
    description: 'Automotor creado exitosamente',
    type: AutomotorEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'CUIT no existe en sujetos → frontend debe abrir modal "Crear Sujeto"',
    ...SCHEMA_400_SUJETO_NOT_FOUND,
  })
  @ApiResponse({
    status: 422,
    description: 'Error de validación — formato inválido o duplicados (dominio, chasis, motor)',
    ...SCHEMA_422,
  })
  async create(@Body() createAutomotorDto: CreateAutomotorDto): Promise<AutomotorEntity> {
    return this.automotolesService.create(createAutomotorDto);
  }

  /**
   * GET /api/automotores?page=1&limit=10
   */
  @Get()
  @ApiOperation({
    summary: 'Listar automotores paginados',
    description: 'Devuelve la lista de automotores con el sujeto propietario incluido. Ordenados por fecha de creación descendente.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Registros por página (default: 10, max: 100)' })
  @ApiResponse({
    status: 200,
    description: 'Listado paginado de automotores con sujeto propietario',
    schema: {
      example: {
        data: [
          {
            id: 1,
            dominio: 'ABC123',
            chasis: 'ABC123XYZ456789',
            motor: 'DEF456XYZ789012',
            color: 'Blanco',
            fechaFabricacion: '202401',
            sujeto_id: 1,
            sujeto: {
              id: 1,
              cuit: '20123456789',
              nombre: 'Juan Pérez',
              tipo: 'PERSONA_FISICA',
              createdAt: '2024-01-15T10:30:00.000Z',
              updatedAt: '2024-01-15T10:30:00.000Z',
            },
            createdAt: '2024-01-15T10:30:00.000Z',
            updatedAt: '2024-01-15T10:30:00.000Z',
          },
        ],
        total: 50,
        page: 1,
        limit: 10,
      },
    },
  })
  async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.automotolesService.findAll(page, limit);
  }

  /**
   * GET /api/automotores/:dominio
   */
  @Get(':dominio')
  @ApiOperation({
    summary: 'Obtener automotor por dominio',
    description: 'Devuelve un automotor con el sujeto propietario incluido.',
  })
  @ApiParam({ name: 'dominio', type: String, example: 'ABC123', description: 'Dominio del automotor (AAA999 o AA999AA)' })
  @ApiResponse({ status: 200, description: 'Automotor encontrado', type: AutomotorEntity })
  @ApiResponse({ status: 404, description: 'Automotor no encontrado', ...SCHEMA_404_AUTOMOTOR })
  async findByDominio(@Param('dominio') dominio: string): Promise<AutomotorEntity> {
    return this.automotolesService.findByDominio(dominio);
  }

  /**
   * PUT /api/automotores/:dominio
   */
  @Put(':dominio')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar un automotor',
    description:
      'Actualiza campos de un automotor identificado por su dominio. Todos los campos son opcionales. ' +
      'Si se envía dominio, chasis o motor, deben ser únicos en el sistema.',
  })
  @ApiParam({ name: 'dominio', type: String, example: 'ABC123', description: 'Dominio actual del automotor' })
  @ApiBody({ type: UpdateAutomotorDto })
  @ApiResponse({ status: 200, description: 'Automotor actualizado exitosamente', type: AutomotorEntity })
  @ApiResponse({ status: 404, description: 'Automotor no encontrado', ...SCHEMA_404_AUTOMOTOR })
  @ApiResponse({
    status: 422,
    description: 'Error de validación — formato inválido o valor duplicado',
    schema: {
      example: {
        statusCode: 422,
        code: 'VALIDATION_ERROR',
        message: 'Validación fallida',
        fieldErrors: { dominio: 'Este dominio ya está registrado' },
      },
    },
  })
  async update(
    @Param('dominio') dominio: string,
    @Body() updateAutomotorDto: UpdateAutomotorDto,
  ): Promise<AutomotorEntity> {
    return this.automotolesService.updateByDominio(dominio, updateAutomotorDto);
  }

  /**
   * DELETE /api/automotores/:dominio
   */
  @Delete(':dominio')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar un automotor',
    description: 'Elimina un automotor del sistema por su dominio. Devuelve 204 sin body.',
  })
  @ApiParam({ name: 'dominio', type: String, example: 'ABC123', description: 'Dominio del automotor a eliminar' })
  @ApiResponse({ status: 204, description: 'Automotor eliminado exitosamente (sin body)' })
  @ApiResponse({ status: 404, description: 'Automotor no encontrado', ...SCHEMA_404_AUTOMOTOR })
  async delete(@Param('dominio') dominio: string): Promise<void> {
    return this.automotolesService.deleteByDominio(dominio);
  }
}

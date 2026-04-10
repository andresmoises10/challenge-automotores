import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { SujetosService } from './sujetos.service';
import { CreateSujetoDto } from './dtos/create-sujeto.dto';
import { SujetoEntity } from './entities/sujeto.entity';

const SCHEMA_422 = {
  schema: {
    example: {
      statusCode: 422,
      code: 'VALIDATION_ERROR',
      message: 'Validación fallida',
      fieldErrors: {
        cuit: 'CUIT debe ser 11 dígitos válidos (módulo 11)',
        nombre: 'Nombre debe tener mínimo 3 caracteres',
        tipo: 'Tipo de sujeto debe ser PERSONA_FISICA o PERSONA_JURIDICA',
      },
    },
  },
};

const SCHEMA_404_SUJETO = {
  schema: {
    example: {
      statusCode: 404,
      code: 'SUJETO_NOT_FOUND',
      message: 'Sujeto no encontrado',
    },
  },
};

@ApiTags('Sujetos')
@Controller('sujetos')
export class SujetosController {
  constructor(private readonly sujetosService: SujetosService) {}

  /**
   * POST /api/sujetos
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear un nuevo sujeto',
    description:
      'Crea una persona física o jurídica. El CUIT debe ser válido (módulo 11) y único en el sistema.',
  })
  @ApiBody({ type: CreateSujetoDto })
  @ApiResponse({
    status: 201,
    description: 'Sujeto creado exitosamente',
    type: SujetoEntity,
  })
  @ApiResponse({
    status: 422,
    description: 'Error de validación — CUIT inválido, nombre corto, tipo incorrecto o CUIT duplicado',
    ...SCHEMA_422,
  })
  async create(@Body() createSujetoDto: CreateSujetoDto): Promise<SujetoEntity> {
    return this.sujetosService.create(createSujetoDto);
  }

  /**
   * GET /api/sujetos?page=1&limit=10
   */
  @Get()
  @ApiOperation({
    summary: 'Listar sujetos paginados',
    description: 'Devuelve la lista de sujetos con paginación. Ordenados por fecha de creación descendente.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Registros por página (default: 10, max: 100)' })
  @ApiResponse({
    status: 200,
    description: 'Listado paginado de sujetos',
    schema: {
      example: {
        data: [
          {
            id: 1,
            cuit: '20123456789',
            nombre: 'Juan Pérez',
            tipo: 'PERSONA_FISICA',
            createdAt: '2024-01-15T10:30:00.000Z',
            updatedAt: '2024-01-15T10:30:00.000Z',
          },
        ],
        total: 45,
        page: 1,
        limit: 10,
      },
    },
  })
  async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.sujetosService.findAll(page, limit);
  }

  /**
   * GET /api/sujetos/by-cuit?cuit=20123456789
   */
  @Get('by-cuit')
  @ApiOperation({
    summary: 'Buscar sujeto por CUIT',
    description:
      'Busca un sujeto por su CUIT. Usado por el frontend para verificar si el propietario existe antes de crear un automotor.',
  })
  @ApiQuery({
    name: 'cuit',
    required: true,
    type: String,
    example: '20123456789',
    description: 'CUIT de 11 dígitos',
  })
  @ApiResponse({
    status: 200,
    description: 'Sujeto encontrado',
    type: SujetoEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'CUIT no registrado en el sistema',
    ...SCHEMA_404_SUJETO,
  })
  async findByCuit(@Query('cuit') cuit: string): Promise<SujetoEntity> {
    const sujeto = await this.sujetosService.findByCuit(cuit);

    if (!sujeto) {
      throw new NotFoundException({
        code: 'SUJETO_NOT_FOUND',
        message: 'Sujeto no encontrado',
      });
    }

    return sujeto;
  }

  /**
   * GET /api/sujetos/:id
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener sujeto por ID',
    description: 'Devuelve un sujeto específico por su ID numérico.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'ID del sujeto' })
  @ApiResponse({
    status: 200,
    description: 'Sujeto encontrado',
    type: SujetoEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Sujeto no encontrado',
    ...SCHEMA_404_SUJETO,
  })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<SujetoEntity> {
    return this.sujetosService.findById(id);
  }
}

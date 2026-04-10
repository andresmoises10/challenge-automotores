import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { VALIDATION_MESSAGES } from '../../config';
import {
  IsDominio,
  IsFechaFabricacion,
  IsChasis,
  IsMotor,
} from '../../common/decorators/validation.decorator';

export class UpdateAutomotorDto {
  @ApiPropertyOptional({
    example: 'XYZ789',
    description: 'Nuevo dominio (AAA999 o AA999AA). Debe ser único en el sistema.',
  })
  @IsOptional()
  @IsDominio()
  dominio?: string;

  @ApiPropertyOptional({
    example: 'XYZ789ABC123456',
    description: 'Nuevo número de chasis alfanumérico (6-20 caracteres). Debe ser único.',
  })
  @IsOptional()
  @IsChasis()
  chasis?: string;

  @ApiPropertyOptional({
    example: 'GHI012XYZ345678',
    description: 'Nuevo número de motor alfanumérico (6-20 caracteres). Debe ser único.',
  })
  @IsOptional()
  @IsMotor()
  motor?: string;

  @ApiPropertyOptional({
    example: 'Rojo',
    description: 'Nuevo color del vehículo (1-50 caracteres)',
    minLength: 1,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: VALIDATION_MESSAGES.COLOR_REQUIRED })
  @MinLength(1, { message: 'Color es requerido' })
  @MaxLength(50, { message: 'Color debe tener máximo 50 caracteres' })
  color?: string;

  @ApiPropertyOptional({
    example: '202306',
    description: 'Nueva fecha de fabricación formato YYYYMM. No puede ser fecha futura.',
  })
  @IsOptional()
  @IsFechaFabricacion()
  fechaFabricacion?: string;
}

import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VALIDATION_MESSAGES } from '../../config';
import {
  IsCUIT,
  IsDominio,
  IsFechaFabricacion,
  IsChasis,
  IsMotor,
} from '../../common/decorators/validation.decorator';

export class CreateAutomotorDto {
  @ApiProperty({
    example: '20123456789',
    description: 'CUIT del propietario (11 dígitos, módulo 11). Debe existir en sujetos.',
  })
  @IsCUIT()
  cuit: string;

  @ApiProperty({
    example: 'ABC123',
    description: 'Dominio del vehículo. Formatos válidos: AAA999 (ej: ABC123) o AA999AA (ej: AB123CD). Único en el sistema.',
  })
  @IsDominio()
  dominio: string;

  @ApiProperty({
    example: 'ABC123XYZ456789',
    description: 'Número de chasis alfanumérico (6-20 caracteres). Único en el sistema.',
  })
  @IsChasis()
  chasis: string;

  @ApiProperty({
    example: 'DEF456XYZ789012',
    description: 'Número de motor alfanumérico (6-20 caracteres). Único en el sistema.',
  })
  @IsMotor()
  motor: string;

  @ApiProperty({
    example: 'Blanco',
    description: 'Color del vehículo (1-50 caracteres)',
    minLength: 1,
    maxLength: 50,
  })
  @IsString({ message: VALIDATION_MESSAGES.COLOR_REQUIRED })
  @MinLength(1, { message: 'Color es requerido' })
  @MaxLength(50, { message: 'Color debe tener máximo 50 caracteres' })
  color: string;

  @ApiProperty({
    example: '202401',
    description: 'Fecha de fabricación formato YYYYMM (ej: 202401 = enero 2024). No puede ser fecha futura.',
  })
  @IsFechaFabricacion()
  fechaFabricacion: string;
}
